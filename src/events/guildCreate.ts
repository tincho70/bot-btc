import { Guild } from "discord.js";
import { Guild as IGuild } from "../database/entities/Guild";
import { guildRepository } from "../database/repositories/GuildRepository";

import { BotEvent } from "../types";

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
        console.log("New guild added:", createdGuild);
      } else {
        console.error("ERROR in Guild.create:", createdGuild);
      }
    } catch (error) {
      console.error("ERROR in guildCreate event:", error);
    }
  },
};

export default event;
