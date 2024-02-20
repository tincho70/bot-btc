import { Client, Events } from "discord.js";
import botTicker from "../service/ticker";
//import cron from 'node-cron'
import { schedule as cron } from "node-cron";
import { BotEvent } from "../types";
import { YadioPrice } from "../service/Yadio.d";

const event: BotEvent = {
  name: Events.ClientReady,
  once: true,
  execute: async (client: Client) => {
    botTicker(client);
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
