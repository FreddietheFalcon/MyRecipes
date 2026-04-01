import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role:         { type: String, enum: ["owner", "viewer"], default: "viewer" },
    isVerified:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
