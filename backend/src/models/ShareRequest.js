import mongoose from "mongoose";

// A ShareRequest is created when a viewer wants a copy of a friend's recipe.
// requester = the viewer who wants the recipe
// recipeOwner = the user who owns the recipe
// recipeId = the recipe being requested
// status: pending → approved (recipe gets copied) or denied

const shareRequestSchema = new mongoose.Schema(
  {
    requester:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipeOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipeId:    { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
    recipeName:  { type: String, required: true }, // stored for display even if recipe changes
    status:      { type: String, enum: ["pending", "approved", "denied"], default: "pending" },
  },
  { timestamps: true }
);

// Prevent duplicate requests for the same recipe from the same user
shareRequestSchema.index({ requester: 1, recipeId: 1 }, { unique: true });

const ShareRequest = mongoose.model("ShareRequest", shareRequestSchema);
export default ShareRequest;
