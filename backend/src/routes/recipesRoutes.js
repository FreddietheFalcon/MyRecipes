import express from "express";
import {
  getAllRecipes,
  getTrashedRecipes,
  getRecipeByID,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  restoreRecipe,
  addComment,
  deleteComment,
} from "../controllers/recipesController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// All recipe routes require login
// No requireOwner here — every user owns their own recipes
router.use(requireAuth);

// IMPORTANT: /trash must come before /:id
router.get("/trash", getTrashedRecipes);

router.get("/", getAllRecipes);
router.get("/:id", getRecipeByID);
router.post("/", createRecipe);
router.put("/:id", updateRecipe);
router.delete("/:id", deleteRecipe);
router.put("/:id/restore", restoreRecipe);

router.post("/:id/comments", addComment);
router.delete("/:id/comments/:commentId", deleteComment);

export default router;
