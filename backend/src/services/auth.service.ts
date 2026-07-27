import bcrypt from "bcrypt";
import { pool } from "../config/database.js";

interface CreateCustomerAccountInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  birthday: string;
  zipCode: string;
}

export async function createCustomerAccount({
  email,
  password,
  firstName,
  lastName,
  phone,
  birthday,
  zipCode,
}: CreateCustomerAccountInput) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const passwordHash = await bcrypt.hash(password, 12);

    const userResult = await client.query(
      `
                INSERT INTO users (
                    email, password_hash, role
                )
                VALUES ($1, $2, 'customer')
                RETURNING id, email, role
            `,
      [email, passwordHash],
    );

    const user = userResult.rows[0];

    const customerResult = await client.query(
      `
                INSERT INTO customers (
                    user_id,
                    first_name,
                    last_name,
                    phone,
                    birthday, 
                    zip_code
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING
                    id,
                    first_name,
                    last_name,
                    phone,
                    birthday,
                    zip_code
            `,
      [user.id, firstName, lastName, phone ?? null, birthday, zipCode],
    );

    const customer = customerResult.rows[0];

    await client.query("COMMIT");

    return {
      userId: user.id,
      customerId: customer.id,
      email: user.email,
      role: user.role,
      firstName: customer.first_name,
      lastName: customer.last_name,
      phone: customer.phone,
      birthday: customer.birthday,
      zipCode: customer.zip_code,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function authenticateCustomer(email: string, password: string) {
  const result = await pool.query(
    `
            SELECT
                users.id AS user_id,
                users.email,
                user.password_has,
                users.role,
                users.is_active,
                customers.id AS customer_id,
                customers.first_name,
                customers.last_name,
                customers.phone,
                customers.birthday,
                customers.zip_code
            FROM users
            JOIN customers
                ON customers.use_id = users.id
            WHERE users.email = $1
        `,
    [email],
  );

  const account = result.rows[0];

  if (!account || !account.is_active) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, account.password_hash);

  if (!passwordMatches) {
    return null;
  }

  return {
    userId: account.user_id,
    customerId: account.customer_id,
    email: account.email,
    role: account.role,
    firstName: account.first_name,
    lastName: account.last_name,
    phone: account.phone,
    birthday: account.birthday,
    zipCode: account.zip_code,
  };
}
