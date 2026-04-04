import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:   { type: String, required: true },
    amount: { type: Number, default: 0 },
    unit:   { type: String, default: "" },
    status: { type: String, enum: ["ok", "low", "out"], default: "ok" },
  },
  { timestamps: true }
);

const Ingredient = mongoose.model("Ingredient", ingredientSchema);
export default Ingredient;
