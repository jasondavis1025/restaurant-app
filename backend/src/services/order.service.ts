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

interface OrderDetailsRow {
  order_id: string;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  scheduled_for: string;
  subtotal: string;
  tax: string;
  total: string;

  order_item_id: string | null;
  menu_item_id: string | null;
  item_name: string | null;
  quantity: number | null;
  unit_price: string | null;
  line_total: string | null;
  additional_instructions: string | null;

  modifier_id: string | null;
  ingredient_name: string | null;
  modifier_type: string | null;
  price_adjustment: string | null;
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
  customerName = customerName.trim();
  customerPhone = customerPhone.trim();
  customerEmail = customerEmail.trim();

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

    // Temporary value until checkout has a real address to work with.
    const locationId = "1";

    const orderResult = await client.query<{
      id: string;
      status: string;
      scheduled_for: string;
    }>(
      `
            INSERT INTO orders (
                location_id,
                customer_id,
                customer_name,
                customer_phone,
                customer_email,
                status,
                order_type,
                subtotal,
                tax,
                total,
                scheduled_for
            )
            VALUES (
                $1, $2, $3, $4, $5, 'pending', $6, $7, $8, $9, $10
            )
            RETURNING
                id, status, scheduled_for
        `,
      [
        locationId,
        customerId,
        customerName,
        customerPhone,
        customerEmail,
        orderType,
        subtotal,
        tax,
        total,
        scheduledFor,
      ],
    );
    const order = orderResult.rows[0];

    if (!order) {
      throw new Error("Failed to create order");
    }
    //temporary method for getting 20 minute estimate. to be updated later
    const estimatedReadyAt = new Date(order.scheduled_for);
    estimatedReadyAt.setMinutes(estimatedReadyAt.getMinutes() + 20);

    for (const item of validatedItems) {
      const orderItemResult = await client.query<{ id: string }>(
        `
                INSERT INTO order_items (
                    order_id, menu_item_id, item_name, item_description, quantity,
                    unit_price, base_price, modifier_total, line_total, additional_instructions
                )
                VALUES (
                    $1, $2, $3, $4, $5, 
                    $6, $7, $8, $9, $10
                )
                RETURNING id
            `,
        [
          order.id,
          item.menuItemId,
          item.itemName,
          item.itemDescription,
          item.quantity,
          fromCents(item.unitPriceCents),
          fromCents(item.basePriceCents),
          fromCents(item.modifierTotalCents),
          fromCents(item.lineTotalCents),
          item.additionalInstructions || null,
        ],
      );
      const orderItem = orderItemResult.rows[0];

      if (!orderItem) {
        throw new Error("Failed to create order item");
      }

      for (const modifier of item.modifiers) {
        await client.query(
          `
                    INSERT INTO order_item_modifiers (
                        order_item_id, ingredient_id, ingredient_name, modifier_type, price_adjustment
                    )
                    VALUES ($1, $2, $3, $4, $5)
                `,
          [
            orderItem.id,
            modifier.ingredientId,
            modifier.ingredientName,
            modifier.modifierType,
            fromCents(modifier.priceAdjustmentCents),
          ],
        );
      }
    }

    await client.query("COMMIT");

    return {
      id: order.id,
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      orderType,
      scheduledFor: order.scheduled_for,
      estimatedReadyAt: estimatedReadyAt.toISOString(),
      status: order.status,
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
          id: modifier.customizationId,
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

export async function getOrderById(orderId: string, userId: string) {
  const result = await pool.query<OrderDetailsRow>(
    `
            SELECT
            o.id AS order_id, o.status, o.customer_name, o.customer_phone, o.customer_email, o.scheduled_for, 
            o.subtotal, o.tax, o.total,
            
            oi.id AS order_item_id, oi.menu_item_id, oi.item_name, oi.quantity, oi.unit_price, oi.line_total,
            oi.additional_instructions,

            oim.id AS modifier_id, oim.ingredient_name, oim.modifier_type, oim.price_adjustment

            FROM orders o

            JOIN customers c
                ON c.id = o.customer_id
            LEFT JOIN order_items oi 
                ON oi.order_id = o.id
            LEFT JOIN order_item_modifiers oim
                ON oim.order_item_id = oi.id

            WHERE o.id = $1
                AND c.user_id = $2

            ORDER BY
                oi.id,
                oim.id
        `,
    [orderId, userId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const firstRow = result.rows[0];

  const itemsById = new Map<
    string,
    {
      orderItemId: string;
      menuItemId: string;
      itemName: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      additionalInstructions: string | null;
      modifiers: {
        id: string;
        ingredientName: string;
        modifierType: string;
        priceAdjustment: number;
      }[];
    }
  >();

  for (const row of result.rows) {
    if (!row.order_item_id || !row.menu_item_id || !row.item_name) {
      continue;
    }

    if (!itemsById.has(row.order_item_id)) {
      itemsById.set(row.order_item_id, {
        orderItemId: row.order_item_id,
        menuItemId: row.menu_item_id,
        itemName: row.item_name,
        quantity: row.quantity ?? 0,
        unitPrice: Number(row.unit_price ?? 0),
        lineTotal: Number(row.line_total ?? 0),
        additionalInstructions: row.additional_instructions,
        modifiers: [],
      });
    }

    const item = itemsById.get(row.order_item_id)!;

    if (
      row.modifier_id &&
      row.ingredient_name &&
      row.modifier_type &&
      row.price_adjustment !== null
    ) {
      item.modifiers.push({
        id: row.modifier_id,
        ingredientName: row.ingredient_name,
        modifierType: row.modifier_type,
        priceAdjustment: Number(row.price_adjustment),
      });
    }
  }

  //temporary method for getting 20 minute estimate. to be updated later
  const estimatedReadyAt = new Date(firstRow.scheduled_for);
  estimatedReadyAt.setMinutes(estimatedReadyAt.getMinutes() + 20);

  return {
    id: firstRow.order_id,
    status: firstRow.status,
    customerName: firstRow.customer_name,
    customerPhone: firstRow.customer_phone,
    customerEmail: firstRow.customer_email,
    scheduledFor: firstRow.scheduled_for,
    items: Array.from(itemsById.values()),
    subtotal: Number(firstRow.subtotal),
    tax: Number(firstRow.tax),
    total: Number(firstRow.total),
    estimatedReadyAt: estimatedReadyAt.toISOString(),
  };
}
