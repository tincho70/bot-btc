import {
  ChannelType,
  ChatInputCommandInteraction,
  Guild,
  GuildTextBasedChannel,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { guildRepository } from "../database/repositories/GuildRepository";
import { SlashCommand } from "../types";
import { Debugger } from "debug";
import { logger } from "../helpers";

const log: Debugger = logger.extend("halving_channel");
const error: Debugger = log.extend("error");

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("halving_channel")
    .setDescription(
      "Cambia o muestra el canal en que se mandan los avisos del halving"
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Canal donde se mandan los mensajes del bot")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: ChatInputCommandInteraction) => {
    try {
      await interaction.deferReply({ ephemeral: true });

      if (!interaction.guild) {
        await interaction.editReply({
          content: "No se pudo obtener el servidor asociado a la interacción.",
        });
        return;
      }

      const guild = interaction.guild;
      const channel = interaction.options.getChannel(
        "channel"
      ) as GuildTextBasedChannel;

      if (channel) {
        const lastBlock = interaction.client.lastBlock!;
        const result = await changeHalvingChannel(
          guild,
          channel,
          lastBlock.height
        );

        await interaction.editReply({
          content: `${result.success ? `✅` : `❌`} ${result.message}`,
        });
      } else {
        const result = await showHalvingChannel(guild);
        await interaction.editReply({
          content: `${result.success ? `✅` : `❌`} ${result.message}`,
        });
      }
    } catch (err) {
      error(err);
      await interaction.editReply({ content: "Algo salió mal..." });
    }
  },
};

const changeHalvingChannel = async (
  guild: Guild,
  channel: GuildTextBasedChannel,
  blockHeight: number
) => {
  const updatedGuild = await guildRepository.updateHalvingChannel(
    guild.id,
    channel.id,
    blockHeight
  );

  if (updatedGuild) {
    log(`Guild updated: ${updatedGuild}`);
    return {
      success: true,
      message: `Canal de reportes cambiado a \`${channel.name}\``,
    };
  } else {
    error(`ERROR in havling_channel command: ${updatedGuild}`);
    return {
      success: false,
      message: "Hubo un error al intentar cambiar el canal...",
    };
  }
};
const showHalvingChannel = async (
  guild: Guild
): Promise<{ success: boolean; message: string }> => {
  const channel_id = await guildRepository.getHalvingChannel(guild.id);

  if (!channel_id) {
    return {
      success: false,
      message: "No hay canal de halving configurado",
    };
  } else {
    const halving_channel = guild.channels.cache.get(channel_id);

    if (halving_channel) {
      return {
        success: true,
        message: `Canal de reportes: \`${halving_channel.name}\``,
      };
    } else {
      return {
        success: false,
        message: `No se encontró el canal con el id \`${channel_id}\``,
      };
    }
  }
};

export default command;
