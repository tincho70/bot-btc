import {
  ActivityType,
  Client,
  Collection,
  GuildMember,
  RateLimitError,
  Role,
} from "discord.js";
import watchPrice from "../coinbase/coinbase";
import { formatPercentageChange, logger } from "../../helpers";
import { Debugger } from "debug";

const log: Debugger = logger.extend("updateTicker");
const error: Debugger = log.extend("error");
const debug: Debugger = log.extend("debug");

const ticker = (client: Client) => {
  client.updateTicker = async (price: number, open24h: number) => {
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

      // First time = color Green, otherwhise, check if price is higher or lower
      let colorOn = "Ticker Green";
      let colorOff = "Ticker Red";
      if (price < client.lastPrice) {
        colorOn = "Ticker Red";
        colorOff = "Ticker Green";
      }

      client.lastPrice = price;
      debug(`Updating nickname to ${nickname} and role to ${colorOn}`);

      client.guilds.cache.forEach((guild) => {
        const bot: GuildMember = guild.members.me!;

        if (nickname != bot.nickname) {
          if (trackLimits.has(guild.id)) {
            if (trackLimits.get(guild.id)! < new Date().getTime()) {
              debug("Resetting limit");
              trackLimits.delete(guild.id);
            } else {
              return;
            }
          }

          changeNickname(
            bot,
            nickname,
            guild.roles.cache.find((role) => role.name == colorOn),
            guild.roles.cache.find((role) => role.name == colorOff)
          ).then((timeToReset) => {
            if (timeToReset) {
              error(
                "LIMIT on guild %s - Waiting for %d",
                guild.id,
                timeToReset
              );
              trackLimits.set(guild.id, timeToReset + new Date().getTime());
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

const changeNickname = async (
  bot: GuildMember,
  nickname: string,
  roleOn: Role | undefined,
  roleOff: Role | undefined
) => {
  try {
    await bot.setNickname(nickname);
    if (roleOn == undefined) return;
    await bot.roles.add(roleOn);
    await bot.roles.remove(roleOff);
  } catch (err) {
    if (err instanceof RateLimitError) {
      return err.timeToReset;
    } else {
      error("Error in changeNickname: %o", err);
    }
  }
  return 0;
};

export default ticker;
