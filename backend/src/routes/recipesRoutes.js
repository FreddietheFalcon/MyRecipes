import express from "express";
import {
  getAllRecipes,
  getTrashedRecipes,
  getRecipeByID,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  restoreRecipe,
} from "../controllers/recipesController.js";

const router = express.Router();

// Trash routes — these MUST come before /:id routes so Express does not
// interpret the literal string "trash" as a dynamic :id parameter.
router.get("/trash", getTrashedRecipes);
router.put("/:id/restore", restoreRecipe);

// Active recipe CRUD
router.get("/", getAllRecipes);
router.get("/:id", getRecipeByID);
router.post("/", createRecipe);
router.put("/:id", updateRecipe);
router.delete("/:id", deleteRecipe);

export default router;
