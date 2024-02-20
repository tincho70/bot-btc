# bot-btc

A simple Discord bot to display the BTC price in $USD in ticker form

## Installation

```bash
pnpm install
```

## Development

First at all, you need to rename `env.example` to `.env.local` and replace the values in it with your own.

- DISCORD_BOT_TOKEN = your bot token
- DISCORD_APP_ID = your app id
- NODE_ENV = "development"

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
