'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import { PlayerToken } from '~/components/bid/primitives';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { discordAvatarUrl } from '~/lib/discord';
import { trpc } from '~/trpc/react';

function DiscordGlyph({ className = 'size-[22px]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.27 5.33A17 17 0 0 0 15 4l-.21.42a13 13 0 0 1 3.79 1.2 14 14 0 0 0-12.17 0A13 13 0 0 1 10.2 4.4L10 4a17 17 0 0 0-4.27 1.33A18.5 18.5 0 0 0 2.5 18a17.6 17.6 0 0 0 5.4 2.7l.42-.7a11.4 11.4 0 0 1-1.7-.82l.42-.31a12.2 12.2 0 0 0 10.32 0l.42.31c-.54.32-1.11.6-1.7.82l.42.7a17.5 17.5 0 0 0 5.4-2.7 18.5 18.5 0 0 0-3.23-12.67ZM9 15.3c-.84 0-1.53-.78-1.53-1.73S8.15 11.84 9 11.84s1.54.78 1.53 1.73S9.84 15.3 9 15.3Zm6 0c-.84 0-1.53-.78-1.53-1.73s.69-1.73 1.53-1.73 1.54.78 1.53 1.73S15.84 15.3 15 15.3Z" />
    </svg>
  );
}

function GithubGlyph({ className = 'size-[22px]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2A10 10 0 0 0 8.84 21.5c.5.08.66-.22.66-.48v-1.7c-2.77.6-3.36-1.34-3.36-1.34-.46-1.15-1.11-1.46-1.11-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.21-.25-4.54-1.1-4.54-4.92 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.83-2.34 4.67-4.57 4.91.36.31.68.92.68 1.85v2.74c0 .27.16.57.67.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

function KofiGlyph({ className = 'size-[22px]' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#FF5E5B" aria-hidden="true">
      <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
    </svg>
  );
}

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/tiers', label: 'Tier List' },
];

export function SiteNav() {
  const pathname = usePathname();
  const me = trpc.auth.me.useQuery(undefined, { staleTime: 5 * 60 * 1000 });

  return (
    <nav className="border-border border-b bg-[color-mix(in_oklab,var(--card)_60%,transparent)] px-4 py-3 backdrop-blur sm:px-8 sm:py-4">
      <div className="mx-auto flex w-full max-w-[96rem] items-center gap-3 md:gap-4 xl:gap-7">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="whitespace-nowrap font-semibold text-[15px]">beloved pacifist</span>
        </Link>

        <div className="ml-2 hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Button key={l.href} asChild variant={active ? 'secondary' : 'ghost'} size="sm">
                <Link href={l.href}>{l.label}</Link>
              </Button>
            );
          })}
        </div>

        <div className="flex-1" />

        <Button variant="outline" size="sm" asChild className="hidden md:inline-flex">
          <Link href="/bid">
            Create Bid Game
            <Badge variant="secondary" className="ml-1.5 text-[9px]">
              BETA
            </Badge>
          </Link>
        </Button>

        {me.data ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Account menu"
                className="border-border bg-card hover:bg-accent/50 flex cursor-pointer items-center gap-2 rounded-[9px] border py-[5px] pr-2 pl-1.5 transition-colors"
              >
                <PlayerToken
                  name={me.data.username}
                  you
                  size={24}
                  avatarUrl={discordAvatarUrl(me.data.discordId, me.data.avatarHash)}
                />
                <span className="hidden max-w-[9rem] text-left text-[13px] leading-tight font-semibold sm:block">
                  <span className="block truncate">{me.data.username}</span>
                  <span className="text-muted-foreground block text-[10.5px] font-medium">
                    Signed in
                  </span>
                </span>
                <svg
                  className="text-muted-foreground size-[13px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[210px]">
              <DropdownMenuLabel>
                <span className="flex items-center gap-2">
                  <DiscordGlyph className="size-[15px] text-[#5865F2]" />
                  <span className="flex flex-col gap-px">
                    <span>
                      {me.data.username}
                      {me.data.discriminator ? (
                        <span className="text-muted-foreground font-medium">
                          #{me.data.discriminator}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-muted-foreground text-[11px] font-normal">
                      Signed in with Discord
                    </span>
                  </span>
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <path d="m16 17 5-5-5-5" />
                  <path d="M21 12H9" />
                </svg>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            size="sm"
            className="text-white hover:opacity-90"
            style={{ background: '#5865F2' }}
            onClick={() => signIn('discord')}
          >
            <span className="hidden sm:inline">Login with Discord</span>
            <span className="sm:hidden">Login</span>
          </Button>
        )}

        <div className="hidden gap-0.5 lg:flex">
          <Button variant="ghost" size="icon-sm" aria-label="Discord" asChild>
            <a href="https://discord.com/invite/dcRcxy2" target="_blank" rel="noreferrer">
              <DiscordGlyph />
            </a>
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="GitHub" asChild>
            <a
              href="https://github.com/scythe-discord/scythe-stats"
              target="_blank"
              rel="noreferrer"
            >
              <GithubGlyph />
            </a>
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Support me on Ko-fi" asChild>
            <a href="https://ko-fi.com/qianpou" target="_blank" rel="noreferrer">
              <KofiGlyph />
            </a>
          </Button>
        </div>

        {/* Everything hidden at narrow widths lives in this menu. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Open menu" className="lg:hidden">
              <Menu className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            <div className="md:hidden">
              {LINKS.map((l) => (
                <DropdownMenuItem key={l.href} asChild>
                  <Link href={l.href}>{l.label}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild>
                <Link href="/bid">
                  Create Bid Game
                  <Badge variant="secondary" className="ml-auto text-[9px]">
                    BETA
                  </Badge>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </div>
            <DropdownMenuItem asChild>
              <a href="https://discord.com/invite/dcRcxy2" target="_blank" rel="noreferrer">
                <DiscordGlyph className="size-4" />
                Discord
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href="https://github.com/scythe-discord/scythe-stats"
                target="_blank"
                rel="noreferrer"
              >
                <GithubGlyph className="size-4" />
                GitHub
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="https://ko-fi.com/qianpou" target="_blank" rel="noreferrer">
                <KofiGlyph className="size-4" />
                Support on Ko-fi
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
