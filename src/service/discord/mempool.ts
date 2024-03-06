import { Block } from "@mempool/mempool.js/lib/interfaces/bitcoin/blocks";
import { Client } from "discord.js";
import watchMempool from "../mempool";
import reportHalving from "./halving";
import { guildRepository } from "../../database/repositories/GuildRepository";
import { Guild as GuildConfig } from "../../database/entities/Guild";

const mempool = (client: Client) => {
  client.updateLastBlock = async (block: Block) => {
    client.lastBlock = block;

    const announcements = await guildRepository.getAnnouncements();

    if (announcements)
      announcements
        .filter((a: GuildConfig) => a.next_announcement! <= block.height)
        .forEach(async (a: GuildConfig) => {
          console.log(
            `SENDING HALVING REPORT AT BLOCK ${block.height} to ${a.id}`
          );
          const guild = client.guilds.cache.get(a.id);
          if (guild) {
            const response = await reportHalving(guild);
            if (response) {
              console.error(
                `ERROR sending halving to guild ${guild.id}`,
                response
              );
            } else {
              const interval =
                typeof a.interval === "string"
                  ? Number.parseInt(a.interval)
                  : Number.parseInt(process.env.HALVING_ANNOUNCEMENT_INTERVAL!);
              guildRepository.updateHalvingNextAnnouncement(
                a.id,
                block.height + interval
              );
            }
          }
        });
  };
  watchMempool(client);
};

export default mempool;
