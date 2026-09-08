import { Router } from "express";
import {
  createOrder,
  getOrderById,
  getKitchenOrders,
} from "../controllers/order.controller.js";

export const orderRouter = Router();

orderRouter.post("/", createOrder);
orderRouter.get("/", getKitchenOrders);
orderRouter.get("/:orderId", getOrderById);
