import './globals.css';

import type { ReactNode } from 'react';
import { SiteNav } from '~/components/site-nav';
import { Toaster } from '~/components/ui/sonner';
import { Providers } from './providers';

export const metadata = {
  title: 'Scythe Stats',
  description: 'Stats for the board game Scythe',
};

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
    </html>
  );
}
