import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { guildRepository } from "../database/repositories/GuildRepository";
import { SlashCommand } from "../types";

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("halving_channel")
    .setDescription(
      "Cambia el canal y el intevalo en que se mandan los avisos del halving"
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Canal donde se mandan los mensajes del bot")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {
    try {
      await interaction.deferReply({ ephemeral: true });

      const channel = interaction.options.getChannel("channel")!;

      const lastBlock = interaction.client.lastBlock!;
      const updatedGuild = await guildRepository.updateHalvingChannel(
        interaction.guild!.id,
        channel.id,
        lastBlock.height
      );

      if (updatedGuild) {
        await interaction.editReply({
          content: `Canal de reportes cambiado a \`${channel.name}\``,
        });
        console.info(`Guild updated: ${updatedGuild}`);
      } else {
        console.error(`ERROR in havling_channel command: ${updatedGuild}`);
        await interaction.editReply({
          content: "Hubo un error al intentar cambiar el canal...",
        });
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: "Algo salió mal..." });
    }
  },
};

export default command;
