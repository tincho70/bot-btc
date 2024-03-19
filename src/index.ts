import { Client, Collection, GatewayIntentBits } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { SlashCommand } from "./types";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  rest: {
    rejectOnRateLimit: (rateLimitData) => {
      // Handle rate limit on setNickName
      return rateLimitData.route === "/guilds/:id/members/@me";
    },
  },
});

client.slashCommands = new Collection<string, SlashCommand>();
client.cooldowns = new Collection<string, number>();

const handlersDir = join(__dirname, "./handlers");
readdirSync(handlersDir).forEach(async (handler) => {
  if (!handler.endsWith(".js")) return;
  const handlerModule = await import(`${handlersDir}/${handler}`);
  handlerModule.default(client);
});

client.login(process.env.DISCORD_BOT_TOKEN);
