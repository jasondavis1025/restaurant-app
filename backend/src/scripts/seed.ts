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
          ($13, $14, $15, $16, $17, $18),
          ($19, $20, $21, $22, $23, $24),
          ($25, $26, $27, $28, $29, $30),
          ($31, $32, $33, $34, $35, $36),
          ($37, $38, $39, $40, $41, $42),
          ($43, $44, $45, $46, $47, $48),
          ($49, $50, $51, $52, $53, $54)
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
        savoryEats.rows[0].id,
        "Kai Kata",
        "Thai style poached egg, sweet sausage, ground pork, green onions and baguette",
        "dish",
        10.99,
        "https://res.cloudinary.com/zo058cum/image/upload/f_auto,q_auto,w_200/v1784488144/kai_kata_amiyb7.png",
        savoryEats.rows[0].id,
        "Moo Ping",
        "Thai street style grilled pork and sticky rice wrapped in banana leaf, dipping sauce",
        "dish",
        12.99,
        "https://res.cloudinary.com/zo058cum/image/upload/f_auto,q_auto,w_200/v1784488145/moo_ping_utk82e.png",
        savoryEats.rows[0].id,
        "Kai Jiew Rice Bowl",
        "Thai style omelette, ground pork, fish sauce, over rice",
        "dish",
        8.99,
        "https://res.cloudinary.com/zo058cum/image/upload/f_auto,q_auto,w_200/v1784488144/kai_jeaw_ktdoq6.png",
        savoryEats.rows[0].id,
        "Pad Thai Omelette",
        "Pad Thai wrapped in egg omelette, thin rice noodles, egg, bean sprouts, green onions, crushed peanuts (tofu/chicken)",
        "dish",
        15.99,
        "https://res.cloudinary.com/zo058cum/image/upload/f_auto,q_auto,w_200/v1784488145/pad_thao_oqv2xc.png",
        savoryEats.rows[0].id,
        "Samui Salmon Bowl",
        "cooked salmon mixed with rice berry, shallots, garlic, lime, thai chilli, fish sauce, palm sugar w/ cucumbers and mint",
        "dish",
        17.48,
        "https://res.cloudinary.com/zo058cum/image/upload/f_auto,q_auto,w_200/v1784488146/salmon_salad_ipdbkg.png",
        savoryEats.rows[0].id,
        "Kai Breakfast Set",
        "Poached eggs with seasoning, baguette, with your choice of drink",
        "dish",
        12.99,
        "https://res.cloudinary.com/zo058cum/image/upload/f_auto,q_auto,w_200/v1784488147/breakf_set_ynlqdz.png",
        sweetBites.rows[0].id,
        "French Toast",
        "choose one: original (seasonal fruit, vanilla cream, maple syrup) or mango sticky rice (mango, sticky rice topped w coconut ice cream and mung bean, coconut sauce, maple syrup)",
        "dish",
        19.48,
        "https://res.cloudinary.com/zo058cum/image/upload/f_auto,q_auto,w_200/v1784488144/french_toast_zmuutf.png",
        lateNightEats.rows[0].id,
        "Chef Chris' Concoction",
        "Mystery Ingredients...",
        "drink",
        7.5,
        "https://res.cloudinary.com/zo058cum/image/upload/f_auto,q_auto,w_200/v1784488147/drink7_ytmsj6.png",
      ],
    );

    const ingredients = [
      "Egg",
      "Bean Sprouts",
      "Green Onions",
      "Crushed Peanuts",
      "Chicken",
      "Tofu",
    ];

    for (const ingredient of ingredients) {
      await client.query(
        `
          INSERT INTO "ingredients" ("name")
          VALUES ($1)
          ON CONFLICT ("name") DO NOTHING
        `,
        [ingredient],
      );
    }

    await client.query(
      `
        INSERT INTO "menu_item_ingredients" ("menu_item_id", "ingredient_id")
        SELECT
          mi.id,
          i.id
        FROM "menu_items" mi
        CROSS JOIN "ingredients" i
        WHERE mi.name = $1
          AND i.name = ANY($2::varchar[])
        ON CONFLICT DO NOTHING
      `,
      ["Pad Thai Omelette", ingredients],
    );
    //the JOIN (...) ON TRUE takes the temporary table of Values named customization and connects it Pad Thai Omelette
    await client.query(
      `
        INSERT INTO "menu_item_customizations"
          ("menu_item_id", "ingredient_id", "modifier_type", "price_adjustment")
        SELECT
          mi.id,
          i.id,
          customization.modifier_type,
          customization.price_adjustment
        FROM "menu_items" mi
        JOIN (
          VALUES
            ('Crushed Peanuts', 'remove', 0.00),
            ('Green Onions', 'remove', 0.00),
            ('Green Onions', 'extra', 0.50),
            ('Egg', 'extra', 2.00),
            ('Chicken', 'add', 3.00),
            ('Tofu', 'add', 2.00)
        ) AS customization(
          ingredient_name,
          modifier_type,
          price_adjustment
        )
          ON TRUE
        JOIN "ingredients" i
          ON i.name = customization.ingredient_name
        WHERE mi.name = 'Pad Thai Omelette'
        ON CONFLICT ("menu_item_id", "ingredient_id", "modifier_type")
        DO UPDATE SET
          "price_adjustment" = EXCLUDED."price_adjustment"
      `,
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
