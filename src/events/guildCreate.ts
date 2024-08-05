import { Guild } from "discord.js";
import { Guild as IGuild } from "../database/entities/Guild";
import { guildRepository } from "../database/repositories/GuildRepository";

import { BotEvent } from "../types";

import { Debugger } from "debug";
import { logger } from "../helpers";

const log: Debugger = logger.extend("Event:GuildCreate");
const error: Debugger = log.extend("error");

const event: BotEvent = {
  name: "guildCreate",
  execute: async (guild: Guild) => {
    try {
      const newGuild: IGuild = {
        id: guild.id,
        joined_at: new Date(),
      };

      const createdGuild = await guildRepository.create(newGuild);
      if (createdGuild) {
        log("New guild added:", createdGuild);
      } else {
        error("ERROR in Guild.create:", createdGuild);
      }
    } catch (err) {
      error("ERROR in guildCreate event:", err);
    }
  },
};

export default event;
