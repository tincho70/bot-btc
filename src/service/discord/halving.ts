import { EmbedBuilder, Guild, GuildTextBasedChannel } from "discord.js";
import { guildRepository } from "../../database/repositories/GuildRepository";
import calculateHalvingData from "../bitcoin/halvingData";
import { formatDuration, formatDate } from "../../helpers";

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

  const embed = new EmbedBuilder()
    .setTitle(
      `Bloque ${lastBlock.height.toLocaleString("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })} minado`
    )
    .setDescription(
      `# ¡¡¡El halving está cerca!!!\n# Faltan ${blocksToNextHalving.toLocaleString(
        "es-AR",
        { minimumFractionDigits: 0, maximumFractionDigits: 0 }
      )} bloques`
    )
    .addFields(
      {
        name: "Fecha estimada",
        value: formatDate(estimatedDate),
        inline: true,
      },
      {
        name: "Faltan apróximadamente",
        value: formatDuration(timeToHalving),
        inline: true,
      }
    )
    .setImage("https://pbs.twimg.com/media/GFHmzavW0AAw67p.jpg")
    .setColor("#f55600")
    .setFooter({
      text: "Bot BTC",
      iconURL: channel.guild.members.me?.displayAvatarURL(),
    })
    .setTimestamp();

  try {
    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(error);
  }
  return null;
};

export default reportHalving;
