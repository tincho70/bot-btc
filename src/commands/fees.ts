/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  EmbedBuilder,
  SlashCommandBuilder,
  Client,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { SlashCommand } from "../types";
import { Debugger } from "debug";
import { formatAgo, formatPrice, logger } from "../helpers";

const error: Debugger = logger.extend("help").extend("error");

const AVERAGE_TX_SIZE = 140; // vB

const command: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("fees")
    .setDescription(
      "Obtiene las tarifas (fees) recomendadas para transacciones onchain."
    ),
  execute: async (interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });
      const client = interaction.client as Client;

      if (!client.fees) {
        await interaction.editReply("No hay fees disponibles todavía.");
        return;
      }

      const author = {
        name: "Bot BTC",
        iconURL: "",
      };

      if (interaction.guild?.members.me?.user.avatarURL()) {
        author.iconURL = interaction.guild?.members.me?.user.avatarURL() ?? "";
      }

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
        new ButtonBuilder()
          .setCustomId("publicar")
          .setEmoji({ name: `📤` })
          .setStyle(ButtonStyle.Primary)
          .setLabel("Publicar fees"),
      ]);

      const embed = new EmbedBuilder()
        .setAuthor(author)
        .setTitle("TASA DE TRANSACCIÓN")
        .setColor("#f99823")
        .setDescription(
          "Fees estimadas actualmente para una transacción onchain de 140 vBytes."
        )
        .addFields(
          {
            name: "Baja prioridad ⏬",
            //value: `${fee.fee}\n${fee.usd}`,
            value: `${client.fees.low} sat/vB\n$${formatPrice(
              (client.lastPrice * client.fees.low * AVERAGE_TX_SIZE) /
                100_000_000,
              true
            )}`,
            inline: true,
          },
          {
            name: "Media prioridad ↔️",
            value: `${client.fees.medium} sat/vB\n$${formatPrice(
              (client.lastPrice * client.fees.medium * AVERAGE_TX_SIZE) /
                100_000_000,
              true
            )}`,
            inline: true,
          },
          {
            name: "Alta prioridad ⏫",
            value: `${client.fees.high} sat/vB\n$${formatPrice(
              (client.lastPrice * client.fees.high * AVERAGE_TX_SIZE) /
                100_000_000,
              true
            )}`,
            inline: true,
          },
          {
            name: "Sin prioridad",
            value: `Si te sentís con suerte, tu fee es ${
              client.fees.economy
            } sat/vB ($${formatPrice(
              (client.lastPrice * client.fees.high * AVERAGE_TX_SIZE) /
                100_000_000,
              true
            )})`,
            inline: false,
          }
        )
        .setFooter({
          text: `Actualizado hace ${formatAgo(
            Date.now() - client.fees.timestamp
          )}.`,
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed], components: [row] });
    } catch (err) {
      error(err);
      interaction.editReply({ content: "Algo salió mal..." });
    }
  },
};

export default command;
