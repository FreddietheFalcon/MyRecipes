import express from "express";
import {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../controllers/inventoryController.js";
import { requireAuth, requireOwner } from "../middleware/authMiddleware.js";

const router = express.Router();

// All inventory routes require login AND owner role
router.use(requireAuth);
router.use(requireOwner);

router.get("/", getAllIngredients);
router.get("/:id", getIngredientById);
router.post("/", createIngredient);
router.put("/:id", updateIngredient);
router.delete("/:id", deleteIngredient);

export default router;
