import Friendship from "../models/Friendship.js";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";

// ── POST /api/friends/request ─────────────────────────────────────────────────
// Send a friend request by email
export async function sendRequest(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const recipient = await User.findOne({ email: email.toLowerCase().trim() });
    if (!recipient) return res.status(404).json({ message: "No user found with that email" });
    if (recipient._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot send a friend request to yourself" });
    }

    // Check if friendship already exists in either direction
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
// Accept a pending friend request
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
// Deny a pending request OR remove an existing friendship
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
// Get all friendships for the logged-in user (accepted + pending)
export async function getFriends(req, res) {
  try {
    const friendships = await Friendship.find({
      $or: [{ requester: req.user.id }, { recipient: req.user.id }],
    })
      .populate("requester", "email")
      .populate("recipient", "email")
      .sort({ createdAt: -1 });

    // Shape the response so the frontend always knows who "the other person" is
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

// ── GET /api/friends/:id/recipes ──────────────────────────────────────────────
// Browse a friend's recipes (only works if friendship is accepted)
export async function getFriendRecipes(req, res) {
  try {
    const friendId = req.params.id;

    // Verify an accepted friendship exists between the two users
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
    }).sort({ createdAt: -1 });

    const friend = await User.findById(friendId).select("email");

    res.status(200).json({ friend, recipes });
  } catch (error) {
    console.error("Error in getFriendRecipes", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
