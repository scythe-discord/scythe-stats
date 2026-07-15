# Scythe Stats

Scythe Stats (also known as **Beloved Pacifist**), hosted at [belovedpacifist.com](https://belovedpacifist.com)
(scythestats.com redirects there), aggregates and showcases stats for the board game
[Scythe](https://stonemaiergames.com/games/scythe/), by Stonemaier Games.

Stats are collected from the Scythe Discord's competitive community. 
Beyond win-rate and tier stats, the site hosts live **bid games**:
players draft faction/mat combos by bidding coins in real time, and ranked results feed a
TrueSkill-style rating ladder.

You are free to make PRs, post issues, and ask for features as you wish.

## Features

- Faction / player-mat win stats and a community tier list
- Match recording (via Discord login), with optional automatic match announcements to Discord
- Live bid games with real-time updates, including a sealed quick-bid mode
- Ranked bid games with OpenSkill ratings

## Stack

- [Next.js](https://nextjs.org/) (App Router) with [tRPC](https://trpc.io/) for the API layer
- [Drizzle ORM](https://orm.drizzle.team/) on PostgreSQL; Redis pub/sub backing SSE live updates
- [Auth.js](https://authjs.dev/) with Discord OAuth
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com/)
- pnpm workspaces + Turborepo; Biome for lint/format; Vitest (+ Testcontainers) for tests

## Repository layout

```
apps/
  web/              # The Next.js app — UI, tRPC routers, auth
packages/
  config/           # Zod-validated environment loading
  db/               # Drizzle schema, migrations, seed
  domain/           # Pure game/rating logic (bid engine, OpenSkill), fully unit-tested
```

## Setting up a dev environment

### Prerequisites

1. [Node.js](https://nodejs.org/) 24 (see `.node-version` — [fnm](https://github.com/Schniz/fnm) or nvm will pick it up)
2. [pnpm](https://pnpm.io/) >= 11 (`corepack enable` is the easiest way)
3. [Docker](https://www.docker.com/get-started) (local Postgres/Redis, and integration tests)

### Install and start services

```sh
git clone https://github.com/scythe-discord/scythe-stats.git
cd scythe-stats
pnpm install
pnpm db:up        # Postgres on :8432 and Redis on :8379 via docker compose
```

### Environment

```sh
cp .env.example .env
ln -s ../../.env apps/web/.env   # Next.js loads env from the app directory
```

The defaults in `.env.example` already match the docker-compose services. Two things you
need to fill in yourself (the comments in `.env.example` walk you through both):

1. **`AUTH_SECRET`** — generate one with `npx auth secret` (or `openssl rand -base64 32`).
2. **Discord OAuth** — create an application at the
   [Discord Developer Portal](https://discord.com/developers/applications), add
   `http://localhost:3000/api/auth/callback/discord` as an OAuth2 redirect URL, and copy the
   client ID and secret into `.env`. This is only needed for logging in; the site itself
   renders fine without it.

The Discord match-announce variables (`DISCORD_BOT_TOKEN`, `GUILD_IDS`,
`VANILLA_LOG_CHANNEL_IDS`) are optional — when unset, recording matches works normally and
the announcement is simply skipped.

### Migrate, seed, and run

The db CLI commands read their configuration from the environment (validation requires both
URLs, even though only the database one is used here):

```sh
export DATABASE_URL=postgres://scythe:scythe@localhost:8432/scythe
export REDIS_URL=redis://:scythe@localhost:8379
pnpm db:migrate                  # apply Drizzle migrations
pnpm -F @scythe/db db:seed       # factions, player mats, tiers, bid presets
pnpm dev
```

Then visit [http://localhost:3000](http://localhost:3000). A fresh database has reference
data but no matches, so the stats pages start out sparse — log in with Discord and record a
few matches to give yourself something to look at.

## Development

| Command          | What it does                                      |
| ---------------- | ------------------------------------------------- |
| `pnpm dev`       | Run the app in dev mode (Turborepo)               |
| `pnpm test`      | Run the test suite (Vitest)                       |
| `pnpm lint`      | Biome check                                       |
| `pnpm typecheck` | TypeScript across the workspace                   |
| `pnpm db:up` / `pnpm db:down` | Start / stop local Postgres + Redis |
| `pnpm db:migrate` | Apply pending Drizzle migrations                 |
| `pnpm -F @scythe/db db:studio` | Browse the database with Drizzle Studio |

Some database and router tests spin up ephemeral Postgres instances with Testcontainers, so
Docker must be running for `pnpm test`. Git hooks (installed automatically on
`pnpm install` via lefthook) run Biome on commit and typecheck + tests on push; CI runs the
same three checks.

## License

[GPL-3.0](LICENSE)
