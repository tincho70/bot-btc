import { ActivityType, Client, Collection, RateLimitError } from "discord.js";
import watchPrice from "../coinbase/coinbase";
import { formatPercentageChange, logger } from "../../helpers";
import { Debugger } from "debug";

const ticker = (client: Client) => {
  client.updateTicker = async (price: number, open24h: number) => {
    const log: Debugger = logger.extend("updateTicker");
    const error: Debugger = log.extend("error");
    const debug: Debugger = log.extend("debug");
    const trackLimits = new Collection<string, number>();

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
      debug(`Updating nickname to ${nickname}`);

      client.guilds.cache.forEach((guild) => {
        if (nickname != guild.members.me?.nickname) {
          if (trackLimits.has(guild.id)) {
            if (trackLimits.get(guild.id)! < new Date().getTime()) {
              debug("Resetting limit");
              trackLimits.delete(guild.id);
            } else {
              return;
            }
          }

          guild.members.me?.setNickname(nickname).catch((err) => {
            if (err instanceof RateLimitError) {
              error(
                "LIMIT on guild %s - Waiting for %d",
                guild.id,
                err.timeToReset
              );
              trackLimits.set(guild.id, err.timeToReset + new Date().getTime());
            } else {
              error("Error in setNickname: %o", err);
            }
          });
        }
      });
    } catch (err) {
      error(err);
    }
  };

  watchPrice(client);
};

export default ticker;
