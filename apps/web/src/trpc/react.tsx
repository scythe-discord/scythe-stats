'use client';

import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchStreamLink, httpSubscriptionLink, loggerLink, splitLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { type ReactNode, useState } from 'react';
import superjson from 'superjson';
import type { AppRouter } from '~/server/root';
import { makeQueryClient } from './query-client';

/** Typed React-Query hooks for the app router — `trpc.stats.topPlayers.useQuery(...)`. */
export const trpc = createTRPCReact<AppRouter>();

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always a fresh client so requests don't share cache.
    return makeQueryClient();
  }
  // Browser: reuse a single client across renders (and Suspense remounts).
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function TRPCReactProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === 'development' ||
            (op.direction === 'down' && op.result instanceof Error),
        }),
        splitLink({
          // Subscriptions go over SSE; everything else batches over HTTP.
          condition: (op) => op.type === 'subscription',
          true: httpSubscriptionLink({
            url: `${getBaseUrl()}/api/trpc`,
            transformer: superjson,
          }),
          false: httpBatchStreamLink({
            url: `${getBaseUrl()}/api/trpc`,
            transformer: superjson,
          }),
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
