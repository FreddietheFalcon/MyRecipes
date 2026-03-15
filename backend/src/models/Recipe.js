import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["keeper", "want_to_try"],
      default: "want_to_try",
    },
    name: {
      type: String,
      required: true,
    },
    servings: {
      type: Number,
    },
    ingredients: [
      {
        name: { type: String },
        amount: { type: String },
      },
    ],
    steps: [String],
    comments: [
      {
        text: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;