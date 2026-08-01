import { Router } from "express";
import {
  signUp,
  signIn,
  getCurrentUser,
  signOut,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/me", getCurrentUser);
router.post("/signout", signOut);

export default router;
