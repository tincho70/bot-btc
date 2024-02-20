/* eslint-disable @typescript-eslint/no-var-requires */
import { Client, GatewayIntentBits } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { BotEvent } from "./types";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
});

const eventsPath = join(__dirname, "events");
const eventFiles = readdirSync(eventsPath);

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const event: BotEvent = require(filePath).default;
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(process.env.DISCORD_BOT_TOKEN);
