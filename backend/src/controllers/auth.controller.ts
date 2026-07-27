import type { Request, Response } from "express";
import {
  createCustomerAccount,
  authenticateCustomer,
} from "../services/auth.service.js";

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

    res.status(200).json(customer);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unable to sign in",
    });
  }
}
