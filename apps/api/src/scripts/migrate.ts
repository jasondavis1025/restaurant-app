import "dotenv/config";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDirectory = path.resolve(__dirname, "../db/migrations");

async function migrate(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query(`
        CREATE TABLE IF NOT EXISTS "schema_migrations" (
        "id" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        "filename" VARCHAR NOT NULL UNIQUE,
        "applied_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `);
    const migrationFiles = (await readdir(migrationsDirectory))
      .filter((file) => file.endsWith("up.sql"))
      .sort();

    const appliedResults = await client.query<{ filename: string }>(
      `SELECT filename FROM "schema_migrations"`,
    );

    const appliedMigrations = new Set(
      appliedResults.rows.map((row) => row.filename),
    );

    for (const filename of migrationFiles) {
      const migrationName = filename.replace(".up.sql", "");

      if (appliedMigrations.has(migrationName)) {
        console.log(`Skipping already applied migration: ${migrationName}`);
        continue;
      }
      const migrationPath = path.join(migrationsDirectory, filename);
      const sql = await readFile(migrationPath, "utf-8");
      console.log(`Applying migration: ${migrationName}`);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          `INSERT INTO "schema_migrations" (filename) VALUES ($1)`,
          [migrationName],
        );
        await client.query("COMMIT");
        console.log(`Applied ${migrationName}`);
      } catch (error) {
        await client.query("ROLLBACK");
        console.error(`Failed to apply migration ${migrationName}:`, error);
        throw error;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error: unknown) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
