import Recipe from "../models/Recipe.js";

// ── Input validation ──────────────────────────────────────────────────────────
// Includes Japanese: Hiragana, Katakana, Kanji, punctuation, fullwidth forms
const SAFE_TEXT_REGEX = /^[a-zA-Z0-9\u00C0-\u024F\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff\uff00-\uffef\s'"!?.,\-_()\&@#%+=*/~]+$/;
const MAX_COMMENT_LENGTH = 500;
const MAX_NAME_LENGTH = 100;
const MAX_STEP_LENGTH = 1000;

function validateComment(text) {
  if (!text?.trim()) return { valid: false, message: "Comment cannot be empty" };
  if (text.length > MAX_COMMENT_LENGTH) return { valid: false, message: `Comment must be ${MAX_COMMENT_LENGTH} characters or less` };
  if (!SAFE_TEXT_REGEX.test(text)) return { valid: false, message: "Comment contains invalid characters." };
  return { valid: true };
}

function validateName(text, fieldName = "Name") {
  if (!text?.trim()) return { valid: false, message: `${fieldName} cannot be empty` };
  if (text.length > MAX_NAME_LENGTH) return { valid: false, message: `${fieldName} must be ${MAX_NAME_LENGTH} characters or less` };
  if (!SAFE_TEXT_REGEX.test(text)) return { valid: false, message: `${fieldName} contains invalid characters` };
  return { valid: true };
}

function validateStep(text) {
  if (!text?.trim()) return { valid: true };
  if (text.length > MAX_STEP_LENGTH) return { valid: false, message: `Step must be ${MAX_STEP_LENGTH} characters or less` };
  if (!SAFE_TEXT_REGEX.test(text)) return { valid: false, message: "Step contains invalid characters" };
  return { valid: true };
}

// ── Controllers ───────────────────────────────────────────────────────────────

export async function getAllRecipes(req, res) {
  try {
    const recipes = await Recipe.find({
      userId: req.user.id,
      isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });
    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error in getAllRecipes controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getTrashedRecipes(req, res) {
  try {
    const trashed = await Recipe.find({
      userId: req.user.id,
      isDeleted: true,
    }).sort({ deletedAt: -1 });

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

export async function getRecipeByID(req, res) {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isDeleted: { $ne: true },
    });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error in getRecipeByID controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createRecipe(req, res) {
  try {
    const { name, servings, status, ingredients, steps, sourceUrl } = req.body;

    const nameCheck = validateName(name, "Recipe name");
    if (!nameCheck.valid) return res.status(400).json({ message: nameCheck.message });

    if (ingredients?.length) {
      for (const ing of ingredients) {
        if (ing.name?.trim()) {
          const ingCheck = validateName(ing.name, "Ingredient name");
          if (!ingCheck.valid) return res.status(400).json({ message: ingCheck.message });
        }
      }
    }

    if (steps?.length) {
      for (const step of steps) {
        const stepCheck = validateStep(step);
        if (!stepCheck.valid) return res.status(400).json({ message: stepCheck.message });
      }
    }

    const recipe = new Recipe({
      userId: req.user.id,
      name,
      servings,
      status,
      ingredients,
      steps,
      sourceUrl: sourceUrl || null,
    });
    const saved = await recipe.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error in createRecipe controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateRecipe(req, res) {
  try {
    const { name, servings, status, ingredients, steps, comments, sourceUrl } = req.body;

    if (name !== undefined) {
      const nameCheck = validateName(name, "Recipe name");
      if (!nameCheck.valid) return res.status(400).json({ message: nameCheck.message });
    }

    if (ingredients?.length) {
      for (const ing of ingredients) {
        if (ing.name?.trim()) {
          const ingCheck = validateName(ing.name, "Ingredient name");
          if (!ingCheck.valid) return res.status(400).json({ message: ingCheck.message });
        }
      }
    }

    if (steps?.length) {
      for (const step of steps) {
        const stepCheck = validateStep(step);
        if (!stepCheck.valid) return res.status(400).json({ message: stepCheck.message });
      }
    }

    const update = {};
    if (name !== undefined)        update.name        = name;
    if (servings !== undefined)    update.servings    = servings;
    if (status !== undefined)      update.status      = status;
    if (ingredients !== undefined) update.ingredients = ingredients;
    if (steps !== undefined)       update.steps       = steps;
    if (comments !== undefined)    update.comments    = comments;
    if (sourceUrl !== undefined)   update.sourceUrl   = sourceUrl;

    const updated = await Recipe.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: { $ne: true } },
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

export async function deleteRecipe(req, res) {
  try {
    const deleted = await Recipe.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: { $ne: true } },
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

export async function restoreRecipe(req, res) {
  try {
    const restored = await Recipe.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: true },
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

export async function addComment(req, res) {
  try {
    const { text } = req.body;
    const check = validateComment(text);
    if (!check.valid) return res.status(400).json({ message: check.message });

    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: { $ne: true } },
      { $push: { comments: { text: text.trim() } } },
      { new: true }
    );
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error in addComment controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteComment(req, res) {
  try {
    const recipe = await Recipe.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, isDeleted: { $ne: true } },
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
