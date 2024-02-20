import { ActivityType, Client } from "discord.js";
import convert from "./Yadio";
import { YadioPrice } from "./Yadio.d";

const botTicker = (client: Client) => {
  client.updateTicker = async (oldPrice: YadioPrice | null = null) => {
    try {
      const yadio = await convert(1, "btc", "usd");
      if (yadio && !yadio.error) {
        const price = yadio.result;
        const nickname = `$${price.toLocaleString("es-AR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`;

        // If new timestamp is higher, calculate variation and update presence
        if (oldPrice && yadio.timestamp > oldPrice.timestamp) {
          const variation = ((price - oldPrice.price) / oldPrice.price) * 100;
          const emoji = variation === 0 ? " " : variation > 0 ? "📈" : "📉";
          client.user!.setPresence({
            activities: [
              {
                type: ActivityType.Custom,
                name: "custom", // name is exposed through the API but not shown in the client for ActivityType.Custom
                state: `Var: ${emoji} ${variation.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}%`,
              },
            ],
            status: "online",
          });
        }

        client.guilds.cache.forEach((guild) => {
          if (nickname != guild.members.me?.nickname) {
            guild.members.me?.setNickname(nickname).catch(console.error);
          }
        });

        return {
          price: yadio.result,
          timestamp: yadio.timestamp,
        } as YadioPrice;
      }
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
};

export default botTicker;
