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
import { requireAuth, requireOwner } from "../middleware/authMiddleware.js";

const router = express.Router();

// All recipe routes require login
router.use(requireAuth);

// IMPORTANT: /trash must come before /:id
router.get("/trash", getTrashedRecipes);

// Both owners and viewers can read
router.get("/", getAllRecipes);
router.get("/:id", getRecipeByID);

// Only owners can write
router.post("/", requireOwner, createRecipe);
router.put("/:id", requireOwner, updateRecipe);
router.delete("/:id", requireOwner, deleteRecipe);
router.put("/:id/restore", requireOwner, restoreRecipe);

// Comments — viewers can add comments, only owners can delete them
router.post("/:id/comments", addComment);
router.delete("/:id/comments/:commentId", requireOwner, deleteComment);

export default router;
