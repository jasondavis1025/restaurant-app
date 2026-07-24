import type { Request, Response } from "express";
import { pool } from "../config/database.js";

interface MenuRow {
  menu_id: string;
  menu_name: string;
  menu_slug: string;
  start_time: string;
  end_time: string;
  allows_preorder: boolean;
  order_ahead_days: number;

  category_id: string | null;
  category_name: string | null;

  item_id: string | null;
  item_name: string | null;
  item_description: string | null;
  item_type: string | null;
  item_price: string | null;
  item_image_url: string | null;

  customization_id: string | null;
  customization_modifier_type: string | null;
  customization_price_adjustment: string | null;
  customization_ingredient_id: string | null;
  customization_ingredient_name: string | null;
}

//select menus, categories, items.
//group rows by menu - morning v night menu
//group categories inside each menu
//push items into each category
//convert categoy Maps into arrays
//return JSON

export async function getMenu(_req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query<MenuRow>(`
        SELECT 
         m.id AS menu_id,
         m.name AS menu_name, 
         m.slug AS menu_slug, 
         m.start_time, 
         m.end_time, 
         m.allows_preorder,
         m.order_ahead_days,

         mc.id AS category_id, 
         mc.name AS category_name,

         mi.id AS item_id, 
         mi.name AS item_name,
         mi.description AS item_description, 
         mi.item_type,
         mi.base_price AS item_price, 
         mi.image_url AS item_image_url,

         mic.id AS customization_id,
         mic.modifier_type AS customization_modifier_type,
         mic.price_adjustment AS customization_price_adjustment,
         i.id AS customization_ingredient_id,
         i.name AS customization_ingredient_name

        FROM "menus" m

        LEFT JOIN "menu_categories" mc
          on mc.menu_id = m.id

        LEFT JOIN "menu_items" mi
          on mi.category_id = mc.id

        LEFT JOIN "menu_item_customizations" mic
          on mic.menu_item_id = mi.id

        LEFT JOIN "ingredients" i
          on i.id = mic.ingredient_id

        ORDER BY 
          m.id,
          mc.id,
          mi.id,
          mic.id
    `);

    const menus = new Map<
      string,
      {
        id: string;
        name: string;
        slug: string;
        startTime: string;
        endTime: string;
        allowsPreorder: boolean;
        orderAheadDays: number;
        categories: Map<
          string,
          {
            id: string;
            name: string;
            items: Map<
              string,
              {
                id: string;
                name: string;
                description: string | null;
                itemType: string;
                basePrice: number;
                imageUrl: string | null;
                menuSlug: "morning" | "late-night";
                customizations: {
                  id: string;
                  ingredientId: string;
                  ingredientName: string;
                  modifierType: string;
                  priceAdjustment: number;
                }[];
              }
            >;
          }
        >;
      }
    >();
    //iterate over "results" returned from the above query and add to menus Map Object with .set()
    for (const row of result.rows) {
      if (!menus.has(row.menu_id)) {
        menus.set(row.menu_id, {
          id: row.menu_id,
          name: row.menu_name,
          slug: row.menu_slug,
          startTime: row.start_time,
          endTime: row.end_time,
          allowsPreorder: row.allows_preorder,
          orderAheadDays: row.order_ahead_days,
          categories: new Map(),
        });
      }
      // console.log("menus", menus);
      //get the menu we're currently working with - something like id: 1, name 'morning cafe menu', categories: new map()
      const menu = menus.get(row.menu_id)!;
      // the ! is Typescript's non-null assertion operator
      // console.log("menu", menu);
      //will prevent attempt to create a nonexistent category. Example of category: "Savory Eats"
      if (row.category_id && row.category_name) {
        //checking if category has already been created for current menu
        if (!menu.categories.has(row.category_id)) {
          //example output: id: 1, name: Savory Eats, items: []
          menu.categories.set(row.category_id, {
            id: row.category_id,
            name: row.category_name,
            items: new Map(),
          });
        }

        const category = menu.categories.get(row.category_id)!;
        // pushing items into the current category
        if (row.item_id && row.item_name && row.item_type && row.item_price) {
          if (!category.items.has(row.item_id)) {
            category.items.set(row.item_id, {
              id: row.item_id,
              name: row.item_name,
              description: row.item_description,
              itemType: row.item_type,
              basePrice: Number(row.item_price),
              imageUrl: row.item_image_url,
              menuSlug: row.menu_slug,
              customizations: [],
            });
          }
          const item = category.items.get(row.item_id)!;

          if (
            row.customization_id &&
            row.customization_ingredient_id &&
            row.customization_ingredient_name &&
            row.customization_modifier_type &&
            row.customization_price_adjustment
          ) {
            item.customizations.push({
              id: row.customization_id,
              ingredientId: row.customization_ingredient_id,
              ingredientName: row.customization_ingredient_name,
              modifierType: row.customization_modifier_type,
              priceAdjustment: Number(row.customization_price_adjustment),
            });
          }
        }
      }
    }
    //converting Map object "menus" to Array then mapping it to an object with a category array of objects
    const response = Array.from(menus.values()).map((menu) => ({
      ...menu,
      categories: Array.from(menu.categories.values()).map((category) => ({
        ...category,
        items: Array.from(category.items.values()),
      })),
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ message: "Failed to fetch menu" });
  }
}
