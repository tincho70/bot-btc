import { ActivityType, Client } from "discord.js";
import watchPrice from "../coinbase/coinbase";
import { formatPercentageChange } from "../../helpers";

const ticker = (client: Client) => {
  client.updateTicker = async (price: number, open24h: number) => {
    try {
      const nickname = `$${price.toLocaleString("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;

      const change = formatPercentageChange(open24h, price);
      client.user!.setPresence({
        activities: [
          {
            type: ActivityType.Custom,
            name: "custom", // name is exposed through the API but not shown in the client for ActivityType.Custom
            state: `Var. diaria: ${change}`,
          },
        ],
        status: "online",
      });

      client.lastPrice = price;

      client.guilds.cache.forEach((guild) => {
        if (nickname != guild.members.me?.nickname) {
          guild.members.me?.setNickname(nickname).catch(console.error);
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  watchPrice(client);
};

export default ticker;
