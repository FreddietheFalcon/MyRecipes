import express from "express";
import {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../controllers/inventoryController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// All inventory routes require login only — every user manages their own inventory
router.use(requireAuth);

router.get("/", getAllIngredients);
router.get("/:id", getIngredientById);
router.post("/", createIngredient);
router.put("/:id", updateIngredient);
router.delete("/:id", deleteIngredient);

export default router;
