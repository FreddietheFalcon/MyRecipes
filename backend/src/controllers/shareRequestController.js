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

    // Get original owner email — the person who OWNS the recipe (not the requester)
    // recipeOwner is the user who received the request and is now approving it
    // which is req.user — so use req.user.email directly for reliability
    const originalOwnerUser = await User.findById(request.recipeOwner).select("email");
    const copiedFromEmail = originalOwnerUser?.email || null;
    console.log("approveRequest — recipeOwner:", request.recipeOwner, "email:", copiedFromEmail, "requester:", request.requester);

    // The originalRecipeId always points to the root recipe —
    // if the recipe being copied is itself a copy, use its originalRecipeId
    const originalRecipeId = original.originalRecipeId || original._id;

    // Copy the recipe into the requester's collection
    const copy = await Recipe.create({
      userId: request.requester,
      name: original.name,
      servings: original.servings,
      status: "want_to_try",
      ingredients: original.ingredients.map((i) => ({ name: i.name, amount: i.amount })),
      steps: [...original.steps],
      comments: [],
      copiedFromEmail,
      originalRecipeId,
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

// ── POST /api/share-requests/migrate ─────────────────────────────────────────
// Fixes ALL copies missing originalRecipeId by tracing back through share requests
export async function migratecopiedFromEmail(req, res) {
  try {
    // Find all approved share requests — each has the true originalRecipeId
    const approved = await ShareRequest.find({ status: "approved" })
      .populate("recipeOwner", "email");

    // Build a map: recipeName -> { originalRecipeId, ownerEmail }
    const recipeMap = {};
    for (const sr of approved) {
      if (!recipeMap[sr.recipeName]) {
        recipeMap[sr.recipeName] = {
          originalRecipeId: sr.recipeId,
          ownerEmail: sr.recipeOwner?.email,
        };
      }
    }

    // Find ALL recipes that are copies (have copiedFromEmail) but missing originalRecipeId
    const copiesToFix = await Recipe.find({
      copiedFromEmail: { $exists: true, $ne: null },
      $or: [
        { originalRecipeId: null },
        { originalRecipeId: { $exists: false } },
      ],
    });

    let updated = 0;
    const results = [];

    for (const copy of copiesToFix) {
      const mapEntry = recipeMap[copy.name];
      if (mapEntry) {
        copy.originalRecipeId = mapEntry.originalRecipeId;
        await copy.save();
        updated++;
        results.push({ recipe: copy.name, originalRecipeId: mapEntry.originalRecipeId });
      }
    }

    res.status(200).json({ message: `Migration complete. Updated ${updated} recipes.`, results });
  } catch (error) {
    console.error("Error in migration", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
