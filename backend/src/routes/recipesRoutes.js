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

const router = express.Router();

// IMPORTANT: /trash must come before /:id so Express does not
// match the string "trash" as a dynamic :id parameter.
router.get("/trash", getTrashedRecipes);

router.get("/", getAllRecipes);
router.get("/:id", getRecipeByID);
router.post("/", createRecipe);
router.put("/:id", updateRecipe);
router.delete("/:id", deleteRecipe);
router.put("/:id/restore", restoreRecipe);

// Comments
router.post("/:id/comments", addComment);
router.delete("/:id/comments/:commentId", deleteComment);

export default router;
