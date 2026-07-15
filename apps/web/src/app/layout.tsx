import './globals.css';

import { GoogleAnalytics } from '@next/third-parties/google';
import type { ReactNode } from 'react';
import { SiteNav } from '~/components/site-nav';
import { Toaster } from '~/components/ui/sonner';
import { Providers } from './providers';

export const metadata = {
  title: 'Scythe Stats',
  description: 'Stats for the board game Scythe',
};

// Inlined into the client bundle at build time (NEXT_PUBLIC_*); unset in dev
// and preview builds, so analytics only loads where the deploy provides it.
const gaId = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <SiteNav />
          <div className="mx-auto w-full max-w-[96rem]">{children}</div>
        </Providers>
        <Toaster />
      </body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  );
}
