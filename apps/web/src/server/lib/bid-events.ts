import { EventEmitter, on } from 'node:events';
import { createServerEnv } from '@scythe/config';
import Redis from 'ioredis';

/**
 * Redis pub/sub fan-out for live bid-game updates.
 *
 * Each bids mutation publishes the affected `bidGameId` to a single Redis
 * channel; a shared subscriber connection re-emits onto a local EventEmitter so
 * many concurrent SSE subscriptions share one Redis connection. Backing the
 * fan-out with Redis (rather than a bare in-process emitter) keeps it correct
 * across multiple server instances in production.
 *
 * Initialization is best-effort: if env or Redis is unavailable (e.g. unit
 * tests, which build their own context and never set REDIS_URL), live updates
 * are disabled but mutations still succeed. Connections live on globalThis so
 * Next's dev HMR doesn't leak a new pair of Redis sockets on every reload.
 */
const CHANNEL = 'bidGameUpdated';

interface BidEventState {
  pub: Redis;
  sub: Redis;
  emitter: EventEmitter;
  /** Settles once the SUBSCRIBE round-trip completes; never rejects. */
  ready: Promise<void>;
}

// undefined = not yet initialized; null = initialization failed (don't retry).
const globalForBidEvents = globalThis as unknown as {
  __bidEvents?: BidEventState | null;
};

function getState(): BidEventState | null {
  if (globalForBidEvents.__bidEvents !== undefined) return globalForBidEvents.__bidEvents;

  try {
    const { REDIS_URL } = createServerEnv();
    const emitter = new EventEmitter();
    // One listener per active SSE subscription — lift the default cap.
    emitter.setMaxListeners(0);

    const pub = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
    const sub = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
    // An 'error' event with no listener would crash the process (EventEmitter
    // semantics); ioredis reconnects on its own, so log and carry on.
    pub.on('error', (err: Error) => {
      console.warn('[bid-events] Redis pub connection error:', err.message);
    });
    sub.on('error', (err: Error) => {
      console.warn('[bid-events] Redis sub connection error:', err.message);
    });
    // Kept as a promise so subscribers can wait for the SUBSCRIBE round-trip:
    // Redis silently drops messages published before it completes.
    const ready = sub
      .subscribe(CHANNEL)
      .then(() => undefined)
      .catch((err: Error) => {
        console.warn('[bid-events] Redis subscribe failed:', err.message);
      });
    sub.on('message', (_channel, message) => {
      const id = Number(message);
      if (Number.isFinite(id)) emitter.emit('update', id);
    });

    const state: BidEventState = { pub, sub, emitter, ready };
    globalForBidEvents.__bidEvents = state;
    return state;
  } catch (err) {
    console.warn(
      '[bid-events] Redis unavailable; live bid updates disabled:',
      (err as Error).message,
    );
    globalForBidEvents.__bidEvents = null;
    return null;
  }
}

/** Notify all subscribers that a bid game changed (call after each mutation). */
export function publishBidGameUpdated(bidGameId: number): void {
  const state = getState();
  if (state) {
    state.pub.publish(CHANNEL, String(bidGameId)).catch((err: Error) => {
      console.warn('[bid-events] publish failed; live updates may be stale:', err.message);
    });
  }
}

/**
 * Async iterator of update ticks for one bid game, ending when `signal` aborts
 * (the SSE client disconnected). Yields the bidGameId on every relevant event.
 * With Redis unavailable it stays open but idle until the client leaves.
 *
 * Callers MUST obtain the iterator (await this function) BEFORE reading the
 * state they will yield as their initial snapshot: the listener is attached
 * synchronously here and `events.on` buffers anything emitted before the first
 * pull, so an update landing while the snapshot query runs is delivered rather
 * than lost. (An async generator would attach the listener only on first pull —
 * after the snapshot — which is exactly the missed-event window.)
 */
export async function bidGameUpdates(
  bidGameId: number,
  signal?: AbortSignal,
): Promise<AsyncGenerator<number>> {
  const state = getState();
  if (!state) return idleUntilAborted(signal);

  const events = on(state.emitter, 'update', { signal });

  // On a cold process the SUBSCRIBE may still be in flight and publishes
  // before it completes never reach us. Wait for it — but bounded, so a down
  // Redis degrades to snapshot-only (as before) instead of stalling snapshots.
  await Promise.race([state.ready, delay(2000)]);

  return filterUpdates(events, bidGameId, signal);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms).unref());
}

// Never yields; ends on abort (or hangs if no signal — tRPC always passes one).
async function* idleUntilAborted(signal?: AbortSignal): AsyncGenerator<number> {
  await new Promise<void>((resolve) => {
    if (signal?.aborted) return resolve();
    signal?.addEventListener('abort', () => resolve(), { once: true });
  });
}

async function* filterUpdates(
  events: AsyncIterable<unknown[]>,
  bidGameId: number,
  signal?: AbortSignal,
): AsyncGenerator<number> {
  try {
    for await (const [id] of events) {
      if (id === bidGameId) yield id as number;
    }
  } catch (err) {
    // Abort is the normal "client went away" path — swallow it; rethrow others.
    if (signal?.aborted || (err as Error)?.name === 'AbortError') return;
    throw err;
  }
}
