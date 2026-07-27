import cors from "cors";
import express from "express";
import { healthRouter } from "./routes/health.routes.js";
import { menuRouter } from "./routes/menu.routes.js";
import authRoutes from "./routes/auth.routes.js";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./config/database.js";

export const app = express();
const PgSession = connectPgSimple(session);

app.use(cors());
app.use(express.json());

app.use(
  session({
    store: new PgSession({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  }),
);

app.use("/api/health", healthRouter);
app.use("/api/menu", menuRouter);
app.use("/api/auth", authRoutes);
