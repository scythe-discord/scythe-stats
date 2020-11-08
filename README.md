# scythe-stats

# Overview

Scythe Stats (also known as Beloved Pacifist), hosted on scythestats.com (and belovedpacifist.com),
is a site created to aggregate and showcase stats for the board game Scythe, by Stonemaier Games.

Currently, these stats are aggregated from the Scythe Discord, in its #vanilla-win-stats channel.
These, for the most part, feature Tabletop Simulator games. Perhaps there will be some way to integrate
with the Digital Edition in the future.

The repository consists of three main parts - the API, the Discord bot (that collects stats), and the frontend.
You are free to make PRs, post issues, ask for feature requests, etc. as you wish.

If you're interested in design, I'd be open to talk as well. The site's design is mostly hacked up
by me as a byproduct of trying some random handful of things (and in some parts, the code probably shows :)).

# Setting up a Dev Environment

## Prerequisites

You'll want to install several utilities prior to starting development. If you don't already have them, grab:

1. [Node.js](https://nodejs.org/en/download/) (>= 12.0.0)
2. [yarn v1](https://classic.yarnpkg.com/en/docs/install)
3. [Docker](https://www.docker.com/get-started)

Clone the project somewhere you find convenient, and then begin initial dependency installation:

```
git clone git@github.com:shibrady/scythe-stats.git
cd scythe-stats && yarn
```

## Your Discord Application

Because this application relies on Discord OAuth, and also features bot interactions, you will need to set up a Discord application accordingly.
This can be done at [https://discord.com/developers/applications](https://discord.com/developers/applications) - you can find
additional documentation [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html).

If you aren't interesting in using the bot, you can avoid creating the actual bot. But if you are interested in having the bot,
then you will similarly need to create a Discord server, and [invite your bot](https://discordjs.guide/preparations/adding-your-bot-to-servers.html#bot-invite-links)
to that Discord server.

You will also need to create an OAuth2 redirect link in your application, on the OAuth2 tab. More information can be found [here](https://discord.com/developers/docs/topics/oauth2).
If you follow the templated `.env` file shown below, your redirect URL can just be `http://localhost:4000/auth/login`, like so:

![image](https://user-images.githubusercontent.com/10229473/84579274-5f54c980-ad81-11ea-9f04-63562ff8a54c.png)

Be sure to save your changes:

![image](https://user-images.githubusercontent.com/10229473/84579271-582dbb80-ad81-11ea-90ea-3ded32a3ea1b.png)

And record these pieces of information for the `.env` file:

1. Your application's **client ID**
2. Your application's **client secret**
3. Your bot's **token**

## Your .env file

The behavior of the application, and the services it connects to, is largely determined by environment variables. We use [dotenv](https://www.npmjs.com/package/dotenv)
and an `.env` file to manage this.

In the root of your project, create a file named `.env`. You can use this template for getting a quick development environment set up:

```
# .env
NODE_ENV=development

DB_NAME=scythe
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=8432

REDIS_HOST=localhost
REDIS_PASSWORD=redis
REDIS_PORT=8379

DISCORD_CLIENT_ID=<your application client ID here>
DISCORD_CLIENT_SECRET=<your application client secret here>

SESSION_SECRET=banrusinno
API_URL=http://localhost:4000
API_SERVER_PORT=4000
GRAPHQL_API_URL=http://localhost:4000/graphql
GRAPHQL_SERVER_BASIC_AUTH=bp:bancrimmil
SITE_URL=http://localhost:3000

NEXT_PUBLIC_NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:4000/
NEXT_PUBLIC_GRAPHQL_API_URL=http://localhost:4000/graphql
NEXT_PUBLIC_PUBLIC_ASSETS_URL=/
NEXT_PUBLIC_GA_TRACKING_ID=
NEXT_PUBLIC_DISCORD_CLIENT_ID=<your application client ID here>

# Relevant if you are interested in having a bot
BOT_TOKEN=<your bot token here>
GUILD_IDS=<your server(s)'s guild ID(s) here, delimited by ,>
VANILLA_LOG_CHANNEL_ID=<your server(s)'s #vanilla-win-stats channel ID(s) here, delimited by ,>
```

**You will need to replace the Discord related variables** using your own application's information, from the last step.
Session secrets, auth related variables, etc. can all be tuned to your liking if you so wish.

# Starting the application

Starting the application at this time simply involves running several services. This is planned to be
migrated to use docker-compose at some point in the future, but for the time being, in whatever way you tend to
like to run multiple programs (e.g. multiple terminals):

1. API, API-related services

```
yarn dev:db
yarn dev:redis
yarn typeorm migration:run # You only need to run this when you have migrations to run - e.g. the first time
yarn dev:api
```

2. The site

```
yarn dev:site
```

3. The bot

```
yarn dev:bot
```

And that's it! You can now visit your site by going to [http://localhost:3000](http://localhost:3000).

The first time you visit, your site will be quite bare. That's because there isn't any data to show, and this site wasn't
designed to really show anything with 0 data in mind. In order to record some test matches, you'll want to:

1. Log in with Discord OAuth
2. Click Record a Match next to Recent Matches
3. Record some matches until you find it fit for development

This process admittedly isn't the most fun, and I'll be thinking of a stable solution to get some initial data seeded
for an easier development experience.
