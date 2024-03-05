import { Client, Events } from "discord.js";
import botTicker from "../service/discord/ticker";
import { schedule as cron } from "node-cron";
import { BotEvent } from "../types";
import { YadioPrice } from "../service/Yadio.d";
import mempool from "../service/discord/mempool";

const event: BotEvent = {
  name: Events.ClientReady,
  once: true,
  execute: async (client: Client) => {
    botTicker(client);
    mempool(client);
    let oldPrice: YadioPrice | null = null;
    cron("* * * * *", async () => {
      oldPrice = await client.updateTicker(oldPrice);
    });
    oldPrice = await client.updateTicker(null);
    console.log(
      `🚀 Discord bot ready with APP_ID: ${process.env.DISCORD_APP_ID}`
    );
  },
};

export default event;
