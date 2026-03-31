import Ingredient from "../models/Ingredient.js";

// ── Input validation ──────────────────────────────────────────────────────────
const SAFE_TEXT_REGEX = /^[a-zA-Z0-9\u00C0-\u024F\s'"!?.,\-_()\&@#%+=*/~]+$/;

function validateName(text, fieldName = "Name") {
  if (!text?.trim()) return { valid: false, message: `${fieldName} cannot be empty` };
  if (text.length > 100) return { valid: false, message: `${fieldName} must be 100 characters or less` };
  if (!SAFE_TEXT_REGEX.test(text)) return { valid: false, message: `${fieldName} contains invalid characters` };
  return { valid: true };
}

// ── Controllers ───────────────────────────────────────────────────────────────

export async function getAllIngredients(_, res) {
  try {
    const ingredients = await Ingredient.find().sort({ name: 1 });
    res.status(200).json(ingredients);
  } catch (error) {
    console.error("Error in getAllIngredients", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getIngredientById(req, res) {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) return res.status(404).json({ message: "Ingredient not found" });
    res.status(200).json(ingredient);
  } catch (error) {
    console.error("Error in getIngredientById", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createIngredient(req, res) {
  try {
    const { name, amount, unit, status } = req.body;

    const nameCheck = validateName(name, "Ingredient name");
    if (!nameCheck.valid) return res.status(400).json({ message: nameCheck.message });

    const ingredient = new Ingredient({ name, amount, unit, status });
    const saved = await ingredient.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Error in createIngredient", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateIngredient(req, res) {
  try {
    const { name, amount, unit, status } = req.body;

    const nameCheck = validateName(name, "Ingredient name");
    if (!nameCheck.valid) return res.status(400).json({ message: nameCheck.message });

    const updated = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { name, amount, unit, status },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Ingredient not found" });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error in updateIngredient", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteIngredient(req, res) {
  try {
    const deleted = await Ingredient.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Ingredient not found" });
    res.status(200).json({ message: "Ingredient deleted successfully" });
  } catch (error) {
    console.error("Error in deleteIngredient", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
