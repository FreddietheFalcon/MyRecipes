import ShareRequest from "../models/ShareRequest.js";
import Recipe from "../models/Recipe.js";
import Friendship from "../models/Friendship.js";
import User from "../models/User.js";

// ── POST /api/share-requests ──────────────────────────────────────────────────
// Viewer requests a copy of a friend's recipe
export async function createRequest(req, res) {
  try {
    const { recipeId, recipeOwnerId } = req.body;

    // Verify friendship exists
    const friendship = await Friendship.findOne({
      status: "accepted",
      $or: [
        { requester: req.user.id, recipient: recipeOwnerId },
        { requester: recipeOwnerId, recipient: req.user.id },
      ],
    });
    if (!friendship) return res.status(403).json({ message: "You are not friends with this user" });

    // Get the recipe name for display
    const recipe = await Recipe.findOne({ _id: recipeId, userId: recipeOwnerId, isDeleted: { $ne: true } });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    // Check if already requested
    const existing = await ShareRequest.findOne({ requester: req.user.id, recipeId });
    if (existing) {
      if (existing.status === "pending") return res.status(409).json({ message: "You already requested this recipe" });
      if (existing.status === "approved") return res.status(409).json({ message: "You already have a copy of this recipe" });
      // If denied, allow re-request by updating status back to pending
      existing.status = "pending";
      await existing.save();
      return res.status(200).json({ message: "Copy request sent!", request: existing });
    }

    const request = await ShareRequest.create({
      requester: req.user.id,
      recipeOwner: recipeOwnerId,
      recipeId,
      recipeName: recipe.name,
    });

    res.status(201).json({ message: "Copy request sent!", request });
  } catch (error) {
    console.error("Error in createRequest", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── GET /api/share-requests/incoming ─────────────────────────────────────────
// Owner sees pending copy requests for their recipes
export async function getIncomingRequests(req, res) {
  try {
    const requests = await ShareRequest.find({
      recipeOwner: req.user.id,
      status: "pending",
    })
      .populate("requester", "email")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getIncomingRequests", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── GET /api/share-requests/my ────────────────────────────────────────────────
// Viewer sees the status of their own requests
export async function getMyRequests(req, res) {
  try {
    const requests = await ShareRequest.find({ requester: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getMyRequests", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── PUT /api/share-requests/:id/approve ──────────────────────────────────────
// Owner approves — copies the recipe into requester's collection
export async function approveRequest(req, res) {
  try {
    const request = await ShareRequest.findOne({
      _id: req.params.id,
      recipeOwner: req.user.id,
      status: "pending",
    });
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Fetch the original recipe
    const original = await Recipe.findOne({ _id: request.recipeId, isDeleted: { $ne: true } });
    if (!original) return res.status(404).json({ message: "Original recipe no longer exists" });

    // Get original owner email
    const originalOwner = await User.findById(request.recipeOwner).select("email");

    // Copy the recipe into the requester's collection
    const copy = await Recipe.create({
      userId: request.requester,
      name: original.name,
      servings: original.servings,
      status: "want_to_try", // default to Save for Later — requester can change it
      ingredients: original.ingredients.map((i) => ({ name: i.name, amount: i.amount })),
      steps: [...original.steps],
      comments: [], // start fresh
      copiedFromEmail: originalOwner?.email || null,
    });

    // Mark request as approved
    request.status = "approved";
    await request.save();

    res.status(200).json({ message: "Recipe shared! A copy has been added to their collection.", copy });
  } catch (error) {
    console.error("Error in approveRequest", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── PUT /api/share-requests/:id/deny ─────────────────────────────────────────
// Owner denies the request
export async function denyRequest(req, res) {
  try {
    const request = await ShareRequest.findOneAndUpdate(
      { _id: req.params.id, recipeOwner: req.user.id, status: "pending" },
      { status: "denied" },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Request denied", request });
  } catch (error) {
    console.error("Error in denyRequest", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── GET /api/share-requests/incoming-all ─────────────────────────────────────
// Returns ALL share requests (any status) where current user is the owner
// Used to hide copies of your own recipes from your friends view
export async function getAllIncomingRequests(req, res) {
  try {
    const requests = await ShareRequest.find({
      recipeOwner: req.user.id,
    }).select("recipeId status");
    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getAllIncomingRequests", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
