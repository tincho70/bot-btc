/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import { Debugger } from "debug";
import { logger } from "../helpers";

const error: Debugger = logger.extend("help").extend("error");

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

      const commands: SlashCommandBuilder[] = interaction.client.slashCommands
        .filter((cmd: SlashCommand) => cmd.command.name !== "help")
        .map((cmd: { command: SlashCommand }) => cmd.command);

      const embed = new EmbedBuilder()
        .setAuthor(author)
        .setTitle("AYUDA")
        .setDescription(
          `Soy un simple bot de Discord que muestra en forma de ticker el precio de 1 Bitcoin en dólares Americano.\n(*buscame en el lateral derecho del servidor*)\n\nLos **comandos** que podés usar conmigo son:\n
          ${commands
            .map(
              (cmd: SlashCommandBuilder) =>
                `* \`/${cmd.name}\`: ${cmd.description}`
            )
            .join("\n")}`
        )
        .setColor("#f99823");

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      error(err);
      interaction.editReply({ content: "Algo salió mal..." });
    }
  },
};

export default command;
