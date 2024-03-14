import { Pool } from "pg";

class Database {
  private pool!: Pool;

  constructor() {
    try {
      this.pool = new Pool({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: process.env.POSTGRES_PORT
          ? parseInt(process.env.POSTGRES_PORT, 10)
          : 5432, // Default
      });
      console.log(`💾 Database ${process.env.POSTGRES_DB}`);
    } catch (error) {
      console.error(
        `💾 Connection to database ${process.env.POSTGRES_DB} failed, skipping...`
      );
    }
  }

  async query(text: string, params?: unknown[]) {
    const start = Date.now();
    const res = await this.pool.query(text, params);
    const duration = Date.now() - start;
    console.debug("executed query", {
      text: text,
      duration: duration,
      count: res.rowCount,
    });
    return res;
  }

  async end() {
    await this.pool.end();
  }
}

export const db = new Database();
