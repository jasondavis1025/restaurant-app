import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDirectory = path.resolve(__dirname, "../db/migrations");

async function migrateDown(): Promise<void> {
  const client = await pool.connect();

  try {
    const result = await client.query<{ filename: string }>(`
       SELECT "filename" 
       FROM "schema_migrations" 
       ORDER BY "id" DESC 
       LIMIT 1
    `);

    if (result.rows.length === 0) {
      console.log("No migrations to roll back.");
      return;
    }

    const migrationName = result.rows[0].filename;
    const downFilename = `${migrationName}.down.sql`;
    const migrationPath = path.join(migrationsDirectory, downFilename);

    const sql = await readFile(migrationPath, "utf-8");
    console.log(`Rolling back migration: ${migrationName}`);

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        `DELETE FROM "schema_migrations" WHERE "filename" = $1`,
        [migrationName],
      );
      await client.query("COMMIT");
      console.log(`Rolled back ${migrationName}`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(`Failed to roll back migration ${migrationName}:`, error);
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

migrateDown().catch((error: unknown) => {
  console.error("Migration roll back failed:", error);
  process.exit(1);
});
