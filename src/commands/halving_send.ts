import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import reportHalving from "../service/discord/halving";
import { Debugger } from "debug";
import { logger } from "../helpers";

const error: Debugger = logger.extend("halving_send").extend("error");

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("halving_send")
    .setDescription("Envía el mensaje para avisar cuánto falta para el halving")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const response = await reportHalving(interaction.guild);

      if (response) {
        await interaction.editReply(response);
      } else {
        interaction.editReply("Aviso enviado");
      }
    } catch (err) {
      error(err);
      await interaction.editReply("Algo salió mal...");
    }
  },
};

export default command;
