import type { ReactNode } from 'react';
import { cn } from '~/lib/utils';

/** Elevated card surface used across the dashboard pages. */
export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-[14px] border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_rgba(0,0,0,0.18)] sm:p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}
