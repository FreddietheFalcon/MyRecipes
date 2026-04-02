import express from "express";
import {
  register,
  login,
  verifyOTP,
  logout,
  getMe,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

export default router;
