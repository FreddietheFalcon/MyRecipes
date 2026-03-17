import Recipe from "../models/Recipe.js";

// GET /api/recipes
// Returns all active (non-deleted) recipes, newest first.
export async function getAllRecipes(_, res) {
  try {
    const recipes = await Recipe.find({ isDeleted: { $ne: true } }).sort({
      createdAt: -1,
    });
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error in getAllRecipes controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/recipes/trash
// Returns all soft-deleted recipes along with how many days remain before
// permanent deletion.
export async function getTrashedRecipes(_, res) {
  try {
    const trashed = await Recipe.find({ isDeleted: true }).sort({
      deletedAt: -1,
    });

    const now = Date.now();
    const THIRTY_DAYS_MS = 2592000 * 1000;

    const withDaysRemaining = trashed.map((recipe) => {
      const elapsed = now - new Date(recipe.deletedAt).getTime();
      const daysRemaining = Math.max(
        0,
        Math.ceil((THIRTY_DAYS_MS - elapsed) / (1000 * 60 * 60 * 24))
      );
      return { ...recipe.toObject(), daysRemaining };
    });

    res.status(200).json(withDaysRemaining);
  } catch (error) {
    console.error("Error in getTrashedRecipes controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/recipes/:id
// Returns a single active recipe by ID.
export async function getRecipeByID(req, res) {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      isDeleted: { $ne: true },
    });
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error in getRecipeByID controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/recipes
// Creates a new recipe.
export async function createRecipe(req, res) {
  try {
    const { title, content } = req.body;
    const recipe = new Recipe({ title, content });
    const savedRecipe = await recipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    console.error("Error in createRecipe controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// PUT /api/recipes/:id
// Updates an active recipe's title and content.
export async function updateRecipe(req, res) {
  try {
    const { title, content } = req.body;
    const updated = await Recipe.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { title, content },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error in updateRecipe controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// DELETE /api/recipes/:id
// Soft-deletes a recipe by marking it as deleted and stamping deletedAt.
// The document is NOT removed from the database — MongoDB's TTL index will
// permanently delete it 30 days after deletedAt is set.
export async function deleteRecipe(req, res) {
  try {
    const deleted = await Recipe.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!deleted) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.status(200).json({
      message: "Recipe moved to trash. It will be permanently deleted in 30 days.",
    });
  } catch (error) {
    console.error("Error in deleteRecipe controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// PUT /api/recipes/:id/restore
// Restores a soft-deleted recipe by clearing the deletion flags.
// Only works if the recipe is currently in the trash (before TTL expiry).
export async function restoreRecipe(req, res) {
  try {
    const restored = await Recipe.findOneAndUpdate(
      { _id: req.params.id, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );
    if (!restored) {
      return res
        .status(404)
        .json({ message: "Recipe not found in trash or already restored" });
    }
    res.status(200).json({ message: "Recipe restored successfully", recipe: restored });
  } catch (error) {
    console.error("Error in restoreRecipe controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
