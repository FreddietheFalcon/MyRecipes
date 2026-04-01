import mongoose from "mongoose";

// A Friendship document represents a connection request between two users.
// requester = the user who sent the request
// recipient = the user who received the request
// status: pending → accepted (or denied, which deletes the doc)

const friendshipSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status:    { type: String, enum: ["pending", "accepted"], default: "pending" },
  },
  { timestamps: true }
);

// Prevent duplicate friendship documents between the same two users
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

const Friendship = mongoose.model("Friendship", friendshipSchema);
export default Friendship;
