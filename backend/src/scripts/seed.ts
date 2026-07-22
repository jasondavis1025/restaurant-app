import "dotenv/config";
import { pool } from "../config/database.js";

async function seed(): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query(`BEGIN`);

    const morningMenu = await client.query<{ id: string }>(
      `
            INSERT INTO "menus" ("name", "slug", "start_time", "end_time")
            VALUES ($1, $2, $3, $4)
            ON CONFLICT ("slug") 
            DO UPDATE SET 
            "name" = EXCLUDED."name", 
            "start_time" = EXCLUDED."start_time", 
            "end_time" = EXCLUDED."end_time"
            RETURNING "id"
        `,
      ["Morning Cafe Menu", "morning", "07:00", "16:00"],
    );

    const lateNightMenu = await client.query<{ id: string }>(
      `
            INSERT INTO "menus" ("name", "slug", "start_time", "end_time")
            VALUES ($1, $2, $3, $4)
            ON CONFLICT ("slug") 
            DO UPDATE SET 
            "name" = EXCLUDED."name", 
            "start_time" = EXCLUDED."start_time", 
            "end_time" = EXCLUDED."end_time"
            RETURNING "id"
        `,
      ["Late Night Menu", "late-night", "19:00", "00:00"],
    );
    const morningMenuId = morningMenu.rows[0].id;
    const lateNightMenuId = lateNightMenu.rows[0].id;
    console.log({ morningMenuId, lateNightMenuId });

    const savoryEats = await client.query<{ id: string }>(
      `
            INSERT INTO "menu_categories"  ("menu_id", "name")
            VALUES ($1, $2)
            ON CONFLICT ("menu_id", "name")
            DO UPDATE SET "name" = EXCLUDED."name"
            RETURNING "id"
        `,
      [morningMenuId, "Savory Eats"],
    );

    const sweetBites = await client.query<{ id: string }>(
      `
            INSERT INTO "menu_categories" ("menu_id", "name")
            VALUES ($1, $2)
            ON CONFLICT ("menu_id", "name")
            DO UPDATE SET "name" = EXCLUDED."name"
            RETURNING "id"
        `,
      [morningMenuId, "Sweet Bites"],
    );
    const lateNightEats = await client.query<{ id: string }>(
      `
                INSERT INTO "menu_categories"  ("menu_id", "name")
                VALUES ($1, $2)
                ON CONFLICT ("menu_id", "name")
                DO UPDATE SET "name" = EXCLUDED."name"
                RETURNING "id"
            `,
      [lateNightMenuId, "Late Night Eats"],
    );
    await client.query(
      `
            INSERT INTO "menu_items" 
           ("category_id", "name", "description", "item_type", "base_price", "image_url")
            VALUES
            ($1, $2, $3, $4, $5, $6),
            ($7, $8, $9, $10, $11, $12),
            ($13, $14, $15, $16, $17, $18)
            ON CONFLICT ("category_id", "name")
            DO UPDATE SET 
            "description" = EXCLUDED."description",
            "item_type" = EXCLUDED."item_type",
            "base_price" = EXCLUDED."base_price",
            "image_url" = EXCLUDED."image_url"
        `,
      [
        savoryEats.rows[0].id,
        "Grandma's Porridge",
        "Ground pork, celery, rice",
        "dish",
        9.5,
        "https://res.cloudinary.com/zo058cum/image/upload/f_auto,q_auto,w_200/v1784488148/comfort_bowl_hgwpsl.png",
        sweetBites.rows[0].id,
        "Kai Breakfast Set",
        "Poached eggs with seasoning, baguette, with your choice of drink",
        "dish",
        12.99,
        "https://res.cloudinary.com/zo058cum/image/upload/f_auto,q_auto,w_200/v1784488147/breakf_set_ynlqdz.png",
        lateNightEats.rows[0].id,

        "Chef Chris Concoction",
        "Mystery ingredients...",
        "drink",
        15.5,
        "https://res.cloudinary.com/zo058cum/image/upload/f_auto,q_auto,w_200/v1784488146/drink7_ytmsj6.png",
      ],
    );

    await client.query(`COMMIT`);
    console.log("Seeding completed successfully.");
  } catch (error) {
    await client.query(`ROLLBACK`);
    console.error("Seeding failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error: unknown) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
