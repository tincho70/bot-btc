/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Obtiene ayuda para los comandos del bot"),
  execute: async (interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const author = {
        name: "Bot BTC",
        iconURL: "",
      };

      if (interaction.guild?.members.me?.user.avatarURL()) {
        author.iconURL = interaction.guild?.members.me?.user.avatarURL() ?? "";
      }

      const commands = interaction.client.slashCommands
        .filter((cmd: any) => cmd.data.name !== "ayuda")
        .map((cmd: { data: any }) => cmd.data);
      const embed = new EmbedBuilder()
        .setAuthor(author)
        .setTitle("AYUDA")
        .setDescription(
          `Soy un simple bot de Discord que muestra en forma de ticker el precio de 1 Bitcoin en dólares Americano.\n(*buscame en el lateral derecho del servidor*)\n\nLos **comandos** que podés usar conmigo son:\n\n${commands.map(
            (cmd: { name: any; description: any }) =>
              `* \`/${cmd.name}\`: ${cmd.description}`
          )}`
        )
        .setColor("#f99823");

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      interaction.editReply({ content: "Algo salió mal..." });
    }
  },
};

export default command;
