import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import { formatDate, formatDuration } from "../../../helpers";

const getHalvingMessage = async (
  height: number,
  blocksToNextHalving: number,
  estimatedDate: Date,
  timeToHalving: number
): Promise<{ embed: EmbedBuilder; file: AttachmentBuilder | null }> => {
  const embed = new EmbedBuilder()
    .setTitle(
      `Bloque ${height.toLocaleString("es-AR", {
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
    .setImage("https://pbs.twimg.com/media/GFHmzavW0AAw67p.jpg");

  const file = null;

  return { embed, file };
};

export default getHalvingMessage;
