import { Interaction } from "discord.js";
import { BotEvent } from "../types";

import { Debugger } from "debug";
import { logger } from "../helpers";

const error: Debugger = logger
  .extend("Event:InteractionCreate")
  .extend("error");

const event: BotEvent = {
  name: "interactionCreate",
  execute: (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.slashCommands.get(
        interaction.commandName
      );
      if (!command) return;
      command.execute(interaction);
    } else if (interaction.isAutocomplete()) {
      const command = interaction.client.slashCommands.get(
        interaction.commandName
      );
      if (!command) {
        error(`No command matching ${interaction.commandName} was found.`);
        return;
      }
      try {
        if (!command.autocomplete) return;
        command.autocomplete(interaction);
      } catch (err) {
        error(err);
      }
    }
  },
};

export default event;
