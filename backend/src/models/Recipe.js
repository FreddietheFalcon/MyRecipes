import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  { text: { type: String, required: true } },
  { timestamps: true }
);

const ingredientSchema = new mongoose.Schema({
  name:   { type: String, default: "" },
  amount: { type: String, default: "" },
});

const recipeSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    servings:    { type: Number },
    status:      { type: String, enum: ["keeper", "want_to_try"], default: "want_to_try" },
    ingredients: { type: [ingredientSchema], default: [] },
    steps:       { type: [String], default: [] },
    comments:    { type: [commentSchema], default: [] },

    // --- Soft-delete fields ---
    isDeleted:   { type: Boolean, default: false },
    deletedAt:   { type: Date, default: null },
  },
  { timestamps: true }
);

// TTL index: MongoDB automatically and permanently removes a document
// 30 days (2,592,000 seconds) after deletedAt is set.
// partialFilterExpression ensures only soft-deleted docs are affected —
// active recipes with deletedAt: null are never touched.
recipeSchema.index(
  { deletedAt: 1 },
  {
    expireAfterSeconds: 2592000,
    partialFilterExpression: { isDeleted: true },
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
