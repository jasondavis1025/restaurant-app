import type { Request, Response } from "express";
import {
  createOrderRecord,
  getOrderById as getOrderByIdRecord,
} from "../services/order.service.js";

export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      orderType,
      scheduledFor,
      items,
    } = req.body;
    if (
      !customerName ||
      !customerPhone ||
      !customerEmail ||
      !orderType ||
      !scheduledFor ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      res.status(400).json({
        message: "Required order information is missing",
      });
      return;
    }

    const order = await createOrderRecord({
      userId: req.session.userId ?? null,
      customerName,
      customerPhone,
      customerEmail,
      orderType,
      scheduledFor,
      items,
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order", error);
    res.status(500).json({ message: "Failed to create order" });
  }
}

export async function getOrderById(
  req: Request<{ orderId: string }>,
  res: Response,
): Promise<void> {
  try {
    const { orderId } = req.params;
    const userId = req.session.userId ?? null;

    const guestAccessToken =
      typeof req.query.guestAccessToken === "string"
        ? req.query.guestAccessToken
        : null;
    if (!userId && !guestAccessToken) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    if (!orderId) {
      res.status(400).json({
        message: "Order ID is required",
      });
      return;
    }

    const order = await getOrderByIdRecord(orderId, userId, guestAccessToken);

    if (!order) {
      res.status(404).json({
        message: "Order not found",
      });
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order", error);

    res.status(500).json({
      message: "Failed to fetch order",
    });
  }
}
