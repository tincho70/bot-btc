import {
  ChatInputCommandInteraction,
  Guild,
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
      "Cambia o muestra el intervalo en que se mandan los mensajes del halving (0 = pausa)"
    )
    .addIntegerOption((option) =>
      option
        .setName("interval")
        .setDescription("Intervalo en bloques")
        .setMinValue(0)
        .setMaxValue(9999)
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
      const interval = interaction.options.getInteger("interval");

      if (interval) {
        const lastBlock = interaction.client.lastBlock!;
        const result = await changeInterval(guild, interval, lastBlock.height);
        await interaction.editReply({
          content: `${result.success ? `✅` : `❌`} ${result.message}`,
        });
      } else {
        const result = await showInterval(guild);
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

const changeInterval = async (
  guild: Guild,
  interval: number,
  blockHeight: number
) => {
  const updatedGuild = await guildRepository.updateHalvingInterval(
    guild.id,
    interval,
    blockHeight
  );

  if (updatedGuild) {
    log(`Guild updated: ${updatedGuild}`);
    if (interval == 0) {
      return {
        success: true,
        message: `Se pausó el envío automático de mensajes del halving`,
      };
    } else {
      return {
        success: true,
        message: `El mensaje automático se mostrará cada \`${interval}\` bloque${
          interval === 1 ? "" : "s"
        }`,
      };
    }
  } else {
    error(`ERROR in havling_interval command: ${updatedGuild}`);
    return {
      success: false,
      message: "Hubo un error al intentar cambiar el intervalo...",
    };
  }
};

const showInterval = async (
  guild: Guild
): Promise<{ success: boolean; message: string }> => {
  const interval = await guildRepository.getInterval(guild.id);

  if (!interval) {
    return {
      success: false,
      message: "No hay intervalo definido",
    };
  } else {
    if (interval == 0) {
      return {
        success: true,
        message: `El intervalo está en 0 (pausa)`,
      };
    } else {
      return {
        success: true,
        message: `Intervalo definido en \`${interval}\` bloques`,
      };
    }
  }
};

export default command;
