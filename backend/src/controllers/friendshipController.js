import Friendship from "../models/Friendship.js";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";

// ── POST /api/friends/request ─────────────────────────────────────────────────
export async function sendRequest(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const recipient = await User.findOne({ email: email.toLowerCase().trim() });
    if (!recipient) return res.status(404).json({ message: "No user found with that email" });
    if (recipient._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    const existing = await Friendship.findOne({
      $or: [
        { requester: req.user.id, recipient: recipient._id },
        { requester: recipient._id, recipient: req.user.id },
      ],
    });

    if (existing) {
      if (existing.status === "accepted") return res.status(409).json({ message: "You are already friends" });
      if (existing.status === "pending") return res.status(409).json({ message: "A friend request already exists" });
    }

    const friendship = await Friendship.create({
      requester: req.user.id,
      recipient: recipient._id,
    });

    res.status(201).json({ message: `Friend request sent to ${recipient.email}`, friendship });
  } catch (error) {
    console.error("Error in sendRequest", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── PUT /api/friends/:id/accept ───────────────────────────────────────────────
export async function acceptRequest(req, res) {
  try {
    const friendship = await Friendship.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id, status: "pending" },
      { status: "accepted" },
      { new: true }
    );
    if (!friendship) return res.status(404).json({ message: "Friend request not found" });
    res.status(200).json({ message: "Friend request accepted", friendship });
  } catch (error) {
    console.error("Error in acceptRequest", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── DELETE /api/friends/:id ───────────────────────────────────────────────────
export async function removeOrDeny(req, res) {
  try {
    const friendship = await Friendship.findOneAndDelete({
      _id: req.params.id,
      $or: [{ requester: req.user.id }, { recipient: req.user.id }],
    });
    if (!friendship) return res.status(404).json({ message: "Friendship not found" });
    res.status(200).json({ message: "Friendship removed" });
  } catch (error) {
    console.error("Error in removeOrDeny", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── GET /api/friends ──────────────────────────────────────────────────────────
export async function getFriends(req, res) {
  try {
    const friendships = await Friendship.find({
      $or: [{ requester: req.user.id }, { recipient: req.user.id }],
    })
      .populate("requester", "email")
      .populate("recipient", "email")
      .sort({ createdAt: -1 });

    const shaped = friendships.map((f) => {
      const isRequester = f.requester._id.toString() === req.user.id;
      return {
        _id: f._id,
        status: f.status,
        direction: isRequester ? "sent" : "received",
        friend: isRequester ? f.recipient : f.requester,
        createdAt: f.createdAt,
      };
    });

    res.status(200).json(shaped);
  } catch (error) {
    console.error("Error in getFriends", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── GET /api/friends/:friendId/recipes ───────────────────────────────────────
export async function getFriendRecipes(req, res) {
  try {
    const friendId = req.params.friendId;


    const friendship = await Friendship.findOne({
      status: "accepted",
      $or: [
        { requester: req.user.id, recipient: friendId },
        { requester: friendId, recipient: req.user.id },
      ],
    });


    if (!friendship) {
      return res.status(403).json({ message: "You are not friends with this user" });
    }

    const recipes = await Recipe.find({
      userId: friendId,
      isDeleted: { $ne: true },
    }).sort({ createdAt: -1 }).lean();

    const friend = await User.findById(friendId).select("email").lean();

    res.status(200).json({ friend, recipes });
  } catch (error) {
    console.error("Error in getFriendRecipes", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── GET /api/friends/:friendId/recipes/:recipeId ──────────────────────────────
export async function getFriendRecipeById(req, res) {
  try {
    const { friendId, recipeId } = req.params;

    const friendship = await Friendship.findOne({
      status: "accepted",
      $or: [
        { requester: req.user.id, recipient: friendId },
        { requester: friendId, recipient: req.user.id },
      ],
    });

    if (!friendship) {
      return res.status(403).json({ message: "You are not friends with this user" });
    }

    const recipe = await Recipe.findOne({
      _id: recipeId,
      userId: friendId,
      isDeleted: { $ne: true },
    }).lean();

    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const friend = await User.findById(friendId).select("email").lean();

    res.status(200).json({ friend, recipe });
  } catch (error) {
    console.error("Error in getFriendRecipeById", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
