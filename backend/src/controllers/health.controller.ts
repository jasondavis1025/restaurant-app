import type { Request, Response } from "express";

export function getHealth(req: Request, res: Response): void {
  console.log("hi");
  res.status(200).json({ status: "ok" });
}
