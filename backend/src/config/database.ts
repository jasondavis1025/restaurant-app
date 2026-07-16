import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export async function connectDatabase(): Promise<void> {
  try {
    await pool.query("SELECT NOW()");
    console.log("Postgresql connected");
  } catch (err) {
    console.error("Postgres connection failed");
    console.error(err);
    process.exit(1);
  }
}
