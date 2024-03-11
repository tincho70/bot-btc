import { Client } from "discord.js";
import WebSocket from "ws";
import { SocksProxyAgent } from "socks-proxy-agent";
import { CoinbaseMessage } from "./coinbase.d";

const watchPrice = async (client: Client) => {
  try {
    // For my development environment
    const agent =
      process.env.NODE_ENV == "development"
        ? new SocksProxyAgent("socks://100.100.10.123:8088")
        : undefined;

    const server = "wss://ws-feed.exchange.coinbase.com";
    const ws = new WebSocket(server, { agent });
    console.log("Connecting...");

    ws.on("open", () => {
      console.log(`Subsrcibe to server ${server}`);
      const subscribe = JSON.stringify({
        type: "subscribe",
        product_ids: ["BTC-USD"],
        channels: ["ticker_batch"],
      });
      ws.send(subscribe);
    });

    ws.on("error", (error) => {
      console.error("Error in watchPrice: ", error);
    });

    ws.on("message", (message: string) => {
      const ticker = JSON.parse(message) as CoinbaseMessage;
      if (process.env.NODE_ENV == "development")
        console.debug(`Received message from server: ${message}`);
      if (ticker.type === "ticker")
        client.updateTicker(+ticker.price, +ticker.open_24h);
    });

    ws.on("close", (message: string) => {
      console.log(`Unsubscribe to server ${server} with message: ${message}`);
    });
  } catch (error) {
    console.error("Error in watchPrice: ", error);
  }
};

export default watchPrice;
