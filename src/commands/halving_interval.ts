import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { guildRepository } from "../database/repositories/GuildRepository";
import { SlashCommand } from "../types";
import { Debugger } from "debug";
import { logger } from "../helpers";

const log: Debugger = logger.extend("halving_interval");
const error: Debugger = log.extend("error");

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("halving_interval")
    .setDescription(
      "Cambia el intervalo en que se mandan los mensajes del halving (0 = pausa)"
    )
    .addIntegerOption((option) =>
      option
        .setName("interval")
        .setDescription("Intervalo en bloques")
        .setMinValue(0)
        .setMaxValue(9999)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {
    try {
      await interaction.deferReply({ ephemeral: true });

      const interval = interaction.options.getInteger("interval", true);
      const lastBlock = interaction.client.lastBlock!;

      const updatedGuild = await guildRepository.updateHalvingInterval(
        interaction.guild!.id,
        interval,
        lastBlock.height
      );

      if (updatedGuild) {
        interval == 0
          ? await interaction.editReply({
              content: `Se pausó el envío automático de mensajes del halving`,
            })
          : await interaction.editReply({
              content: `El mensaje automático se mostrará cada \`${interval}\` bloque${
                interval === 1 ? "" : "s"
              }`,
            });
        log(`Guild updated: ${updatedGuild}`);
      } else {
        error(`ERROR in havling_interval command: ${updatedGuild}`);
        await interaction.editReply({
          content: "Hubo un error al intentar cambiar el intervalo...",
        });
      }
    } catch (err) {
      error(err);
      await interaction.editReply({ content: "Algo salió mal..." });
    }
  },
};

export default command;
