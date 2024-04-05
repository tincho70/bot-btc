# bot-btc

A simple Discord bot to display the BTC price in $USD in ticker form

[Invite](https://discord.com/oauth2/authorize?client_id=1209503705377021953&permissions=335629312&scope=applications.commands+bot) to your discord server.

## Installation

```bash
pnpm install
```

## Development

First at all, you need to rename `env.example` to `.env.local` and replace the values in it with your own.

- DISCORD_BOT_TOKEN = your bot token
- DISCORD_APP_ID = your app id
- NODE_ENV = "development"
- DISCORD_GUILD_ID = your guild id
- HALVING_ANNOUNCEMENT_INTERVAL = "10" (number of blocks for automatic halving announcement)
- POSTGRES_DB = "database"
- POSTGRES_USER = "username"
- POSTGRES_PASSWORD = "password"
- POSTGRES_HOST = "localhost"
- POSTGRES_PORT = "5432"

You can build the project with `pnpm build` and run it with `pnpm start`

```bash
pnpm build && pnpm start
```

Or you can develop with docker and vscode:

```bash
docker-compose up
```

## Production

### Prepare your environment

Rename `env.example` to `.env` and replace the values in it with your own.

- DISCORD_BOT_TOKEN = your bot token
- DISCORD_APP_ID = your app id
- NODE_ENV = "produtcion"
- HALVING_ANNOUNCEMENT_INTERVAL = "10" (number of blocks for automatic halving announcement)
- POSTGRES_DB = "database"
- POSTGRES_USER = "username"
- POSTGRES_PASSWORD = "password"
- POSTGRES_HOST = "localhost"
- POSTGRES_PORT = "5432"

### Run with pnpm

You can build the project with `pnpm build` and run it with `pnpm start`

```bash
pnpm build && pnpm start
```

### Run with docker

If you haven't already, [install](https://docs.docker.com/compose/install/) docker and then run the following command:

```bash
docker-compose -f docker-compose.prod.yml up
```
