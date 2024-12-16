import {
  ActivityType,
  Client,
  Collection,
  GuildMember,
  RateLimitError,
  Role,
} from "discord.js";
import watchPrice from "../coinbase/coinbase";
import {
  formatDate,
  formatPercentageChange,
  formatPrice,
  logger,
} from "../../helpers";
import { Debugger } from "debug";

const log: Debugger = logger.extend("updateTicker");
const error: Debugger = log.extend("error");
const debug: Debugger = log.extend("debug");

const ticker = (client: Client) => {
  client.updateTicker = async (price?: number, open24h?: number) => {
    const trackLimits = new Collection<string, number>();

    try {
      if (price) {
        const nickname = `$${formatPrice(price)}`;

        // First time = color Green, otherwhise, check if price is higher or lower
        let colorOn = "Ticker Green";
        let colorOff = "Ticker Red";
        if (client.lastPrice !== null && price < client.lastPrice) {
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
      }

      if (
        client.nextStatus[0] == "change" &&
        client.nextStatus[1] <= Date.now()
      ) {
        if (!(open24h && price)) return;

        const change = formatPercentageChange(open24h, price);
        client.user!.setPresence({
          activities: [
            {
              type: ActivityType.Custom,
              name: "custom",
              state: `Var. diaria: ${change}`,
            },
          ],
          status: "online",
        });
        debug(
          `Updating status to daily variation on ${formatDate(new Date())}`
        );

        client.nextStatus = ["fees", Date.now() + 10 * 1000]; // 10s for fees
      } else if (
        client.nextStatus[0] == "fees" &&
        client.nextStatus[1] <= Date.now()
      ) {
        if (!client.fees) return;

        client.user!.setPresence({
          activities: [
            {
              type: ActivityType.Custom,
              name: "fees",
              state: `sats/vB: ⏬ ${client.fees.low} ↔️ ${client.fees.medium} ⏫ ${client.fees.high}`,
            },
          ],
          status: "online",
        });
        debug(`Updating status to fees on ${formatDate(new Date())}`);

        client.nextStatus = ["change", Date.now() + 20 * 1000]; // 20s for change price percentage
      }
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
