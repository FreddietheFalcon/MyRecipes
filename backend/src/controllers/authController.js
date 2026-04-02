import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import User from "../models/User.js";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTPEmail = async (email, otp) => {
  await resend.emails.send({
    from: "My Recipes <noreply@kaebauder.com>",
    to: email,
    subject: "Your My Recipes login code",
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:auto">
        <h2 style="color:#5aaa10">My Recipes 🍳</h2>
        <p>Your verification code is:</p>
        <div style="font-size:40px;font-weight:800;letter-spacing:10px;color:#2c3e50;margin:24px 0">${otp}</div>
        <p style="color:#b0b8c1;font-size:13px">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const issueJWT = (user) =>
  jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ── POST /api/auth/register ───────────────────────────────────────────────────
export async function register(req, res) {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({ email, passwordHash });

    const otp = generateOTP();
    await redis.set(`otp:${email}`, otp, { ex: 600 });
    await sendOTPEmail(email, otp);

    res.status(201).json({ message: "Account created. Check your email for a verification code.", email });
  } catch (error) {
    console.error("Error in register controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── POST /api/auth/login ─────────────────────────────────────────────────────
export async function login(req, res) {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isVerified) return res.status(403).json({ message: "Please verify your email first", email });

    const otp = generateOTP();
    await redis.set(`otp:${email}`, otp, { ex: 600 });
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "Check your email for a login code.", email });
  } catch (error) {
    console.error("Error in login controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── POST /api/auth/verify-otp ────────────────────────────────────────────────
export async function verifyOTP(req, res) {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const otp = req.body.otp?.trim();
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const stored = await redis.get(`otp:${email}`);
    if (!stored || String(stored) !== String(otp)) {
      return res.status(401).json({ message: "Invalid or expired code" });
    }

    await redis.del(`otp:${email}`);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const token = issueJWT(user);
    res.cookie("token", token, cookieOptions);
    res.status(200).json({ message: "Logged in successfully", user: { email: user.email } });
  } catch (error) {
    console.error("Error in verifyOTP controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── POST /api/auth/logout ────────────────────────────────────────────────────
export async function logout(req, res) {
  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "Logged out" });
}

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
export async function getMe(req, res) {
  res.status(200).json({ email: req.user.email });
}
