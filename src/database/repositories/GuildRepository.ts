import { Collection } from "discord.js";
import { db } from "../database";
import { Guild, Partial } from "../entities/Guild";
import { IRepository } from "./IRepository";

class GuildRepository implements IRepository<Guild> {
  private guilds: Collection<string, Guild> = new Collection();
  private announcements: Collection<number, Guild> = new Collection();

  async getById(id: string): Promise<Guild | null> {
    try {
      // Get cached (if exists)
      if (this.guilds.has(id)) return this.guilds.get(id) as Guild;

      const query = "SELECT * FROM guild WHERE id = $1";
      const values = [id];
      const { rows } = await db.query(query, values);
      if (rows.length === 0) return null;
      this.guilds.set(id, rows[0]);
      return rows[0];
    } catch (error) {
      console.error("ERROR in Guild.getById:", error);
      return null;
    }
  }

  async create(guild: Guild): Promise<Guild | null> {
    try {
      const query =
        "INSERT INTO guild (id, joined_at, channel_id, interval, next_announcement) VALUES ($1, $2, $3, $4, $5) RETURNING *";
      const values = [
        guild.id,
        guild.joined_at,
        guild.channel_id,
        guild.interval,
        guild.next_announcement,
      ];
      const { rows } = await db.query(query, values);
      if (rows.length === 0) return null;

      // Cache guild
      this.guilds.set(guild.id, rows[0]);
      return rows[0];
    } catch (error) {
      console.error("ERROR in Guild.create:", error);
      return null;
    }
  }

  async update(id: string, data: Partial<Guild>): Promise<Guild | null> {
    try {
      const updateFields: string[] = [];
      const values: unknown[] = [];
      let paramCount = 1;

      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          updateFields.push(`${key} = $${paramCount}`);
          values.push(data[key]);
          paramCount++;
        }
      }

      if (updateFields.length === 0) {
        console.warn("No fields specified to update.");
        return null;
      }

      const query = `UPDATE guild SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`;
      values.push(id);
      const { rows } = await db.query(query, values);
      if (rows.length === 0) return null;

      // Update cache
      this.guilds.set(id, rows[0]);
      return rows[0];
    } catch (error) {
      console.error("ERROR in Guild.update:", error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const query = "DELETE FROM guild WHERE id = $1";
      const values = [id];
      await db.query(query, values);
      return true;
    } catch (error) {
      console.error("ERROR in Guild.delete:", error);
      return false;
    }
  }

  async updateHalvingChannel(
    id: string,
    channel_id: string,
    lastBlock: number
  ): Promise<Guild | null> {
    try {
      let updated = null;
      const old = await this.getById(id);

      // If already exists, update channel_id and next_announcement
      if (old) {
        updated = await this.update(id, {
          channel_id: channel_id,
          next_announcement:
            lastBlock +
            Number.parseInt(process.env.HALVING_ANNOUNCEMENT_INTERVAL!),
        });
      }

      // If not exists or not updated, create new guild
      if (!updated) {
        const guild = this.create({
          id,
          joined_at: new Date(),
          channel_id: channel_id,
          next_announcement:
            lastBlock +
            Number.parseInt(process.env.HALVING_ANNOUNCEMENT_INTERVAL!),
        });
        return guild || null;
      }
      return updated || null;
    } catch (error) {
      console.error("ERROR in Guild.updateHalvingChannel:", error);
      return null;
    }
  }

  async updateHalvingInterval(
    id: string,
    interval: number,
    lastBlock: number
  ): Promise<Guild | null> {
    try {
      const updated = await this.update(id, {
        interval: interval,
        next_announcement: interval == 0 ? undefined : lastBlock + interval,
      });
      if (!updated) {
        const guild = this.create({
          id,
          joined_at: new Date(),
          interval: interval,
          next_announcement: lastBlock + interval,
        });
        return guild || null;
      }
      return updated || null;
    } catch (error) {
      console.error("ERROR in Guild.updateHalvingInterval:", error);
      return null;
    }
  }

  async updateHalvingNextAnnouncement(
    id: string,
    next_announcement: number
  ): Promise<Guild | null> {
    try {
      const updated = await this.update(id, {
        next_announcement: next_announcement,
      });
      if (!updated) {
        const guild = this.create({
          id,
          joined_at: new Date(),
          next_announcement: next_announcement,
        });
        return guild || null;
      }
      return updated || null;
    } catch (error) {
      console.error("ERROR in Guild.updateHalvingNextAnnouncement:", error);
      return null;
    }
  }

  async getAnnouncements(): Promise<Guild[] | null> {
    try {
      // Get cached (if exists)
      //if (this.guilds.has(id)) return this.guilds.get(id) as Guild;

      // Get all guilds to announce
      const query =
        "SELECT id, channel_id, interval, next_announcement FROM guild WHERE next_announcement IS NOT NULL";
      const { rows } = await db.query(query);
      if (rows.length === 0) return null;
      rows.map((row) => {
        this.announcements.set(row.next_announcement, row);
      });
      return rows;
    } catch (error) {
      console.error("ERROR in Guild.getById:", error);
      return null;
    }
  }
}

export const guildRepository = new GuildRepository();
