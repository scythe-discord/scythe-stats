'use client';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { Panel } from '~/components/site/panel';
import { Button } from '~/components/ui/button';
import { trpc } from '~/trpc/react';

export default function BidIndexPage() {
  const router = useRouter();
  const me = trpc.auth.me.useQuery(undefined, { staleTime: 5 * 60 * 1000 });
  const create = trpc.bids.create.useMutation({
    onSuccess: (game) => router.push(`/bid/${game.id}`),
    onError: (e) => toast.error(e.message),
  });

  const loggedIn = !!me.data;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="m-0 font-extrabold text-[32px] tracking-[-0.8px]">Bid Games</h1>
        <p className="mt-2 mb-0 text-[14px] text-muted-foreground">
          Create a turn-based bid draft, share the link, and auction faction/mat combos before the
          match.
        </p>
      </div>
      <Panel className="flex flex-col items-start gap-4">
        <div>
          <h2 className="m-0 font-semibold text-lg">Start a new draft</h2>
          <p className="mt-1 mb-0 text-[13px] text-muted-foreground">
            You’ll be the host. Invite players with the game link, then start when everyone’s in.
          </p>
        </div>
        {loggedIn ? (
          <Button size="lg" onClick={() => create.mutate()} disabled={create.isPending}>
            {create.isPending ? 'Creating…' : 'Create Bid Game'}
          </Button>
        ) : (
          <Button
            size="lg"
            className="text-white"
            style={{ background: '#5865F2' }}
            onClick={() => signIn('discord')}
          >
            Log in with Discord to create
          </Button>
        )}
      </Panel>
    </main>
  );
}
