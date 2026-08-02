import { pool } from "../config/database.js";

interface CreateOrderModifierInput {
  customizationId: string;
}

interface CreateOrderItemInput {
  menuItemId: string;
  quantity: number;
  additionalInstructions: string;
  modifiers: CreateOrderModifierInput[];
}
interface CreateOrderInput {
  userId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderType: "pickup";
  scheduledFor: string;
  items: CreateOrderItemInput[];
}

interface MenuItemRow {
  id: string;
  name: string;
  description: string | null;
  base_price: string;
}

interface CustomizationRow {
  id: string;
  menu_item_id: string;
  ingredient_id: string;
  ingredient_name: string;
  modifier_type: string;
  price_adjustment: string;
}

export async function createOrderRecord({
  userId,
  customerName,
  customerPhone,
  customerEmail,
  orderType,
  scheduledFor,
  items,
}: CreateOrderInput) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    //1. Resolve the authenticated customer, if userId is provided. Guest orders will keep customerId as null.
    let customerId: string | null = null;

    if (userId) {
      const customerResult = await client.query<{ id: string }>(
        `
            SELECT id
            FROM customers
            WHERE user_id = $1
        `,
        [userId],
      );

      const customer = customerResult.rows[0];

      if (!customer) {
        throw new Error("Authenticated customer profile not found");
      }

      customerId = customer.id;
    }

    //2. Validate the submitted order structure

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("Order must contain at least one item");
    }

    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new Error(
          `Invalid item quantity for menu item ${item.menuItemId}`,
        );
      }

      if (!Array.isArray(item.modifiers)) {
        throw new Error(`Invalid modifiers for menu item ${item.menuItemId}`);
      }

      const customizationIds = item.modifiers.map(
        (modifier) => modifier.customizationId,
      );

      if (new Set(customizationIds).size !== customizationIds.length) {
        throw new Error(
          `Duplicate customizations for menu item ${item.menuItemId}`,
        );
      }
    }

    //collect all IDs first so they can be loaded in batches...
    const menuItemIds = [...new Set(items.map((item) => item.menuItemId))];

    const customizationIds = [
      ...new Set(
        items.flatMap((item) =>
          item.modifiers.map((modifier) => modifier.customizationId),
        ),
      ),
    ];
    const menuItemsResult = await client.query<MenuItemRow>(
      `
                SELECT id, name, description, base_price
                FROM menu_items
                WHERE id = ANY($1::bigint[])
            `,
      [menuItemIds],
    );

    let customizationRows: CustomizationRow[] = [];

    if (customizationIds.length > 0) {
      const customizationResult = await client.query<CustomizationRow>(
        `
                SELECT 
                    mic.id,
                    mic.menu_item_id,
                    mic.ingredient_id,
                    i.name AS ingredient_name,
                    mic.modifier_type,
                    mic.price_adjustment
                FROM menu_item_customizations mic
                JOIN ingredients i ON i.id= mic.ingredient_id
                WHERE mic.id = ANY($1::bigint[])
            `,
        [customizationIds],
      );

      customizationRows = customizationResult.rows;
    }

    const menuItemsById = new Map(
      menuItemsResult.rows.map((menuItem) => [String(menuItem.id), menuItem]),
    );

    const customizationsById = new Map(
      customizationRows.map((customization) => [
        String(customization.id),
        customization,
      ]),
    );

    const validatedItems = items.map((item) => {
      const menuItem = menuItemsById.get(item.menuItemId);

      if (!menuItem) {
        throw new Error(`Menu Item ${item.menuItemId} was not found`);
      }

      const validatedModifiers = item.modifiers.map((modifier) => {
        const customization = customizationsById.get(modifier.customizationId);

        if (!customization) {
          throw new Error(
            `Customization ${modifier.customizationId} was not found`,
          );
        }

        if (String(customization.menu_item_id) !== item.menuItemId) {
          throw new Error(
            `Customization ${modifier.customizationId} is not valid for menu item ${item.menuItemId}`,
          );
        }

        return {
          customizationId: customization.id,
          ingredientId: customization.ingredient_id,
          ingredientName: customization.ingredient_name,
          modifierType: customization.modifier_type,
          priceAdjustmentCents: dollarsToCents(customization.price_adjustment),
        };
      });

      const basePriceCents = dollarsToCents(menuItem.base_price);

      const modifierTotalCents = validatedModifiers.reduce(
        (sum, modifier) => sum + modifier.priceAdjustmentCents,
        0,
      );

      const unitPriceCents = basePriceCents + modifierTotalCents;

      const lineTotalCents = unitPriceCents * item.quantity;

      return {
        menuItemId: menuItem.id,
        itemName: menuItem.name,
        itemDescription: menuItem.description,
        quantity: item.quantity,
        basePriceCents,
        modifierTotalCents,
        unitPriceCents,
        lineTotalCents,
        additionalInstructions: item.additionalInstructions?.trim() ?? "",
        modifiers: validatedModifiers,
      };
    });

    const subtotalCents = validatedItems.reduce(
      (sum, item) => sum + item.lineTotalCents,
      0,
    );

    const taxRateBasisPoints = 825;

    const taxCents = Math.round((subtotalCents * taxRateBasisPoints) / 10_000);
    const totalCents = subtotalCents + taxCents;

    const subtotal = fromCents(subtotalCents);
    const tax = fromCents(taxCents);
    const total = fromCents(totalCents);

    await client.query("COMMIT");

    return {
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      orderType,
      scheduledFor,
      status: "pending",
      items: validatedItems.map((item) => ({
        menuItemId: item.menuItemId,
        itemName: item.itemName,
        itemDescription: item.itemDescription,
        quantity: item.quantity,
        basePrice: fromCents(item.basePriceCents),
        modifierTotal: fromCents(item.modifierTotalCents),
        unitPrice: fromCents(item.unitPriceCents),
        lineTotal: fromCents(item.lineTotalCents),
        additionalInstructions: item.additionalInstructions,
        modifiers: item.modifiers.map((modifier) => ({
          customizationId: modifier.customizationId,
          ingredientId: modifier.ingredientId,
          ingredientName: modifier.ingredientName,
          modifierType: modifier.modifierType,
          priceAdjustment: fromCents(modifier.priceAdjustmentCents),
        })),
      })),
      subtotal,
      tax,
      total,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function dollarsToCents(value: string | number): number {
  return Math.round(Number(value) * 100);
}

function fromCents(value: number): number {
  return value / 100;
}
