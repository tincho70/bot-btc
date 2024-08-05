/* eslint-disable @typescript-eslint/no-unused-vars */
import { AttachmentBuilder, EmbedBuilder } from "discord.js";
import { formatDate } from "../../../helpers";
import Jimp from "jimp";

const getHalvingMessage = async (
  height: number,
  blocksToNextHalving: number,
  estimatedDate: Date,
  timeToHalving: number
): Promise<{ embed: EmbedBuilder; file: AttachmentBuilder | null }> => {
  const image = await createRedGraphic(
    `Faltan ${blocksToNextHalving.toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })} bloques`
  );

  const file = new AttachmentBuilder(image, { name: "faltan.jpg" });

  const embed = new EmbedBuilder()
    .setTitle(
      `Bloque ${height.toLocaleString("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })} minado`
    )
    //.setDescription("# Halving")
    .addFields(
      {
        name: "Siguiente halving",
        value: (height + blocksToNextHalving).toLocaleString("es-AR", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }),
        inline: true,
      },
      {
        name: "Fecha estimada",
        value: formatDate(estimatedDate),
        inline: true,
      }
    )
    .setImage(`attachment://faltan.jpg`);

  return { embed, file };
};
const createRedGraphic = async (message: string) => {
  // Text position
  const x: number = 20;
  const y: number = 20;

  const image = await Jimp.read("assets/placa.jpg");

  return Jimp.loadFont(Jimp.FONT_SANS_64_WHITE).then((font) => {
    image.print(
      font,
      x,
      y,
      {
        text: message,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      image.bitmap.width - x, // Max text width
      image.bitmap.height - y // Max text height
    );
    return image.getBufferAsync(Jimp.MIME_JPEG);
  });
};

export default getHalvingMessage;
