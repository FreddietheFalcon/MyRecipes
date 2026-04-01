import express from "express";
import {
  register,
  login,
  verifyOTP,
  logout,
  getMe,
  getAllUsers,
  updateUserRole,
} from "../controllers/authController.js";
import { requireAuth, requireOwner } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

// Owner-only user management
router.get("/users", requireAuth, requireOwner, getAllUsers);
router.put("/users/:id/role", requireAuth, requireOwner, updateUserRole);

export default router;
