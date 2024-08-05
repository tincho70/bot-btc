import { Guild, GuildTextBasedChannel } from "discord.js";
import { guildRepository } from "../../database/repositories/GuildRepository";
import calculateHalvingData from "../bitcoin/halvingData";
//import getHalvingMessage from "./halvingMessages/halvingSeAcerca";
import getHalvingMessage from "./halvingMessages/faltan";

import { Debugger } from "debug";
import { logger } from "../../helpers";

const error: Debugger = logger.extend("halving").extend("error");

const reportHalving = async (guild: Guild): Promise<string | null> => {
  const guildConfig = await guildRepository.getById(guild.id);
  if (!guildConfig) {
    return `Problema para obtener la configuración.\nVuelva a invitar al bot al servidor.`;
  }

  const channel_id = guildConfig.channel_id;

  if (!channel_id) {
    return `No hay canal de reporte configurado!\nUtilice /halving_channel para configurarlo.`;
  }

  const channel = guild.channels.cache.get(channel_id) as GuildTextBasedChannel;
  if (!channel) {
    return `Hay algún problema con el canal de reportes configurado!\nUtilice /halving_channel para solucionarlo.`;
  }

  const lastBlock = guild.client.lastBlock;
  if (!lastBlock) return null;

  const { blocksToNextHalving, timeToHalving, estimatedDate } =
    calculateHalvingData(guild.client.averageBlockTime, lastBlock.height);

  const { embed, file } = await getHalvingMessage(
    lastBlock.height,
    blocksToNextHalving,
    estimatedDate,
    timeToHalving
  );
  embed
    .setColor("#f55600")
    .setFooter({
      text: "Bot BTC",
      iconURL: channel.guild.members.me?.displayAvatarURL(),
    })
    .setTimestamp();
  try {
    file
      ? await channel.send({ embeds: [embed], files: [file] })
      : await channel.send({ embeds: [embed] });
  } catch (err) {
    error(err);
  }
  return null;
};

export default reportHalving;
