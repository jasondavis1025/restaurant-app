import type { Request, Response } from "express";
import { createOrderRecord } from "../services/order.service.js";

export async function createOrder(req: Request, res: Response): Promise<void> {
  console.log("hello world", req, res);

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
      customerName: customerName.traim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      orderType,
      scheduledFor,
      items,
    });

    res.status(201).json(order);
  } catch (error) {
    console.log("Error creating order", error);
    res.status(500).json({ message: "Failed to create order" });
  }
}
