import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // --- Soft-delete fields ---
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// TTL index: MongoDB will automatically and permanently remove a document
// 30 days (2,592,000 seconds) after its deletedAt timestamp is set.
// The partialFilterExpression ensures this index only applies to soft-deleted
// documents, so active recipes with deletedAt: null are never affected.
recipeSchema.index(
  { deletedAt: 1 },
  {
    expireAfterSeconds: 2592000, // 30 days
    partialFilterExpression: { isDeleted: true },
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
