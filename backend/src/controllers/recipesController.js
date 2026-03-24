import Recipe from "../models/Recipe.js";

// GET /api/recipes
export async function getAllRecipes(_, res) {
  try {
    const recipes = await Recipe.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error in getAllRecipes controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/recipes/trash
export async function getTrashedRecipes(_, res) {
  try {
    const trashed = await Recipe.find({ isDeleted: true }).sort({ deletedAt: -1 });
    const now = Date.now();
    const THIRTY_DAYS_MS = 2592000 * 1000;
    const withDaysRemaining = trashed.map((recipe) => {
      const elapsed = now - new Date(recipe.deletedAt).getTime();
      const daysRemaining = Math.max(0, Math.ceil((THIRTY_DAYS_MS - elapsed) / (1000 * 60 * 60 * 24)));
      return { ...recipe.toObject(), daysRemaining };
    });
    res.status(200).json(withDaysRemaining);
  } catch (error) {
    console.error("Error in getTrashedRecipes controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/recipes/:id
export async function getRecipeByID(req, res) {
  try {
    const recipe = await Recipe.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error in getRecipeByID controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/recipes
export async function createRecipe(req, res) {
  try {
    const { name, servings, status, ingredients, steps } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Recipe name is required" });
    const recipe = new Recipe({ name, servings, status, ingredients, steps });
    const saved = await recipe.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error in createRecipe controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// PUT /api/recipes/:id
// Accepts full recipe object or partial (e.g. status-only toggle).
// Only updates fields that were actually sent — never wipes fields not included.
export async function updateRecipe(req, res) {
  try {
    const { name, servings, status, ingredients, steps, comments } = req.body;

    const update = {};
    if (name !== undefined)        update.name        = name;
    if (servings !== undefined)    update.servings    = servings;
    if (status !== undefined)      update.status      = status;
    if (ingredients !== undefined) update.ingredients = ingredients;
    if (steps !== undefined)       update.steps       = steps;
    if (comments !== undefined)    update.comments    = comments;

    const updated = await Recipe.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      update,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error in updateRecipe controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// DELETE /api/recipes/:id — soft delete
export async function deleteRecipe(req, res) {
  try {
    const deleted = await Recipe.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!deleted) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json({ message: "Recipe moved to trash. It will be permanently deleted in 30 days." });
  } catch (error) {
    console.error("Error in deleteRecipe controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// PUT /api/recipes/:id/restore
export async function restoreRecipe(req, res) {
  try {
    const restored = await Recipe.findOneAndUpdate(
      { _id: req.params.id, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );
    if (!restored) return res.status(404).json({ message: "Recipe not found in trash or already restored" });
    res.status(200).json({ message: "Recipe restored successfully", recipe: restored });
  } catch (error) {
    console.error("Error in restoreRecipe controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/recipes/:id/comments
export async function addComment(req, res) {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Comment text is required" });
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { $push: { comments: { text } } },
      { new: true }
    );
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error in addComment controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// DELETE /api/recipes/:id/comments/:commentId
export async function deleteComment(req, res) {
  try {
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true }
    );
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error in deleteComment controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
