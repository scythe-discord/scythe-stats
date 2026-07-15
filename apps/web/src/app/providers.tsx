'use client';

import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { TooltipProvider } from '~/components/ui/tooltip';
import { TRPCReactProvider } from '~/trpc/react';

/**
 * Client-side provider stack mounted once at the root: theme (next-themes,
 * class strategy → shadcn `.dark` tokens), tRPC + React Query, and the radix
 * TooltipProvider shadcn tooltips expect above them.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <TRPCReactProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </TRPCReactProvider>
    </ThemeProvider>
  );
}
