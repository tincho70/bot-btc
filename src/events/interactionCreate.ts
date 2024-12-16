import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonComponent,
  EmbedBuilder,
  Interaction,
} from "discord.js";
import { BotEvent } from "../types";

import { Debugger } from "debug";
import { formatAgo, logger } from "../helpers";

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
      const cooldown = interaction.client.cooldowns.get(
        `${interaction.commandName}-${interaction.guildId}-${interaction.user.username}`
      );
      if (!command) return;
      if (command.cooldown && cooldown) {
        if (Date.now() < cooldown) {
          const wait = formatAgo(Math.abs(Date.now() - cooldown) / 1000);

          interaction.reply(
            `Tiene que esperar ${wait} para volver a usar este comando.`
          );
          setTimeout(() => interaction.deleteReply(), 5000);
          return;
        }
        interaction.client.cooldowns.set(
          `${interaction.commandName}-${interaction.user.username}`,
          Date.now() + command.cooldown * 1000
        );
        setTimeout(() => {
          interaction.client.cooldowns.delete(
            `${interaction.commandName}-${interaction.user.username}`
          );
        }, command.cooldown * 1000);
      } else if (command.cooldown && !cooldown) {
        interaction.client.cooldowns.set(
          `${interaction.commandName}-${interaction.guildId}-${interaction.user.username}`,
          Date.now() + command.cooldown * 1000
        );
      }
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
    } else if (interaction.isButton() && interaction.customId === "publicar") {
      const originalChannel = interaction.channel;
      if (originalChannel) {
        const embed = new EmbedBuilder(interaction.message.embeds[0].toJSON());
        originalChannel.send({ embeds: [embed] });
      } else {
        console.error("Interaction is not in a guild.");
      }

      const button = interaction.message.components[0]
        .components[0] as ButtonComponent;
      const bb = ButtonBuilder.from(button).setDisabled(true);
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(bb);

      interaction.update({
        components: [row],
      });
    }
  },
};

export default event;
