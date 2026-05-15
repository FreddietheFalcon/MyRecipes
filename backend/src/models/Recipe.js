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
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    name:        { type: String, required: true },
    servings:    { type: Number },
    status:      { type: String, enum: ["keeper", "want_to_try"], default: "want_to_try" },
    ingredients: { type: [ingredientSchema], default: [] },
    steps:       { type: [String], default: [] },
    comments:    { type: [commentSchema], default: [] },

    // --- Source tracking ---
    sourceUrl: { type: String, default: null }, // original URL if imported

    // --- Copy tracking ---
    copiedFromEmail:   { type: String, default: null }, // email of original owner if copied
    originalRecipeId: { type: mongoose.Schema.Types.ObjectId, default: null }, // points to the root original recipe

    // --- Soft-delete fields ---
    isDeleted:   { type: Boolean, default: false },
    deletedAt:   { type: Date, default: null },
  },
  { timestamps: true }
);

recipeSchema.index(
  { deletedAt: 1 },
  {
    expireAfterSeconds: 2592000,
    partialFilterExpression: { isDeleted: true },
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
