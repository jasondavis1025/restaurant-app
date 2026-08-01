import type { Request, Response } from "express";
import {
  createCustomerAccount,
  authenticateCustomer,
  getCustomerByUserId,
} from "../services/auth.service.js";
import { error } from "node:console";

export async function signUp(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName, phone, birthday, zipCode } =
      req.body;

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !birthday ||
      !zipCode
    ) {
      res.status(400).json({
        message: "Required signup fields are missing",
      });
      return;
    }

    const customer = await createCustomerAccount({
      email: email.trim().toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim(),
      birthday,
      zipCode: zipCode.trim(),
    });

    res.status(201).json(customer);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      res.status(409).json({
        message: "An account with that email already exists",
      });
      return;
    }

    console.error(error);

    res.status(500).json({
      message: "Unable to create account",
    });
  }
}

export async function signIn(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        message: "Email and password are required",
      });
      return;
    }

    const customer = await authenticateCustomer(
      email.trim().toLowerCase(),
      password,
    );
    if (!customer) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }
    req.session.userId = customer.userId;

    res.status(200).json(customer);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to sign in",
    });
  }
}

export async function getCurrentUser(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.session.userId;

    if (!userId) {
      res.status(401).json({
        message: "Not authenticated!",
      });
      return;
    }

    const customer = await getCustomerByUserId(userId);

    if (!customer) {
      res.status(401).json({
        message: "Not authenticated!",
      });
      return;
    }
    res.set("Cache-Control", "no-store");
    res.status(200).json(customer);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to retrieve current user",
    });
  }
}

export function signOut(req: Request, res: Response): void {
  req.session.destroy((error) => {
    if (error) {
      console.error(error);

      res.status(500).json({
        message: "Unable to sign out",
      });
      return;
    }

    res.clearCookie("connect.sid");
    res.status(204).send();
  });
}
