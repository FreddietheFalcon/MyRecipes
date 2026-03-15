import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, default: 0 },
    unit: { type: String, default: "" },
    status: {
      type: String,
      enum: ["ok", "low", "out"],
      default: "ok",
    },
  },
  { timestamps: true }
);

const Ingredient = mongoose.model("Ingredient", ingredientSchema);
export default Ingredient;
