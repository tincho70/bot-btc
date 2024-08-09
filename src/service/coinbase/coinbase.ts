import { Client } from "discord.js";
import WebSocket from "ws";
import { CoinbaseMessage } from "./coinbase.d";
import { logger } from "../../helpers";
import { Debugger } from "debug";

const watchPrice = async (client: Client) => {
  const log: Debugger = logger.extend("watchPrice");
  const debug: Debugger = log.extend("debug");
  const error: Debugger = log.extend("error");
  try {
    const server = "wss://ws-feed.exchange.coinbase.com";
    const ws = new WebSocket(server);

    ws.on("open", () => {
      log(`Subsrcibe to server ${server}`);
      const subscribe = JSON.stringify({
        type: "subscribe",
        product_ids: ["BTC-USD"],
        channels: ["ticker_batch"],
      });
      ws.send(subscribe);
    });

    ws.on("error", (err) => {
      error("Error in watchPrice: ", err);
    });

    ws.on("message", (message: string) => {
      const ticker = JSON.parse(message) as CoinbaseMessage;
      ticker.type === "ticker"
        ? client.updateTicker(+ticker.price, +ticker.open_24h)
        : debug(`Received message from server: ${message}`);
    });

    ws.on("close", (message: string) => {
      log(`Unsubscribe to server ${server} with message: ${message}`);
      log(`Trying to reconnect in 5 seconds...`);
      setTimeout(() => watchPrice(client), 5000);
    });
  } catch (err) {
    error("Error in watchPrice: ", err);
  }
};

export default watchPrice;
