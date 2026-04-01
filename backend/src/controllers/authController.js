import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"My Recipes" <${process.env.EMAIL_USER}>`,
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
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req, res) {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const { password, role } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 12);
    const userCount = await User.countDocuments();
    const assignedRole = userCount === 0 ? "owner" : (role || "viewer");

    await User.create({ email, passwordHash, role: assignedRole });

    const otp = generateOTP();
    const redisKey = `otp:${email}`;
    
    // DEBUG — remove after fixing
    console.log("REGISTER — email:", email);
    console.log("REGISTER — redis key:", redisKey);
    console.log("REGISTER — otp generated:", otp);
    
    await redis.set(redisKey, otp, { ex: 600 });
    
    // Verify it was stored correctly
    const storedCheck = await redis.get(redisKey);
    console.log("REGISTER — otp stored in redis:", storedCheck);
    
    await sendOTPEmail(email, otp);

    res.status(201).json({ message: "Account created. Check your email for a verification code.", email });
  } catch (error) {
    console.error("Error in register controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

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
    const redisKey = `otp:${email}`;
    
    console.log("LOGIN — email:", email);
    console.log("LOGIN — redis key:", redisKey);
    console.log("LOGIN — otp generated:", otp);
    
    await redis.set(redisKey, otp, { ex: 600 });
    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "Check your email for a login code.", email });
  } catch (error) {
    console.error("Error in login controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function verifyOTP(req, res) {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const otp = req.body.otp?.trim();
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const redisKey = `otp:${email}`;
    const stored = await redis.get(redisKey);
    
    // DEBUG — remove after fixing
    console.log("VERIFY — email:", email);
    console.log("VERIFY — redis key:", redisKey);
    console.log("VERIFY — otp entered:", otp);
    console.log("VERIFY — otp in redis:", stored);
    console.log("VERIFY — stored type:", typeof stored);
    console.log("VERIFY — otp type:", typeof otp);
    console.log("VERIFY — match?", String(stored) === String(otp));

    if (!stored || String(stored) !== String(otp)) return res.status(401).json({ message: "Invalid or expired code" });

    await redis.del(redisKey);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const token = issueJWT(user);
    res.cookie("token", token, cookieOptions);
    res.status(200).json({ message: "Logged in successfully", user: { email: user.email, role: user.role } });
  } catch (error) {
    console.error("Error in verifyOTP controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function logout(req, res) {
  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "Logged out" });
}

export async function getMe(req, res) {
  res.status(200).json({ email: req.user.email, role: req.user.role });
}

export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error in getAllUsers controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { role } = req.body;
    if (!["owner", "viewer"].includes(role)) return res.status(400).json({ message: "Invalid role" });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-passwordHash");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in updateUserRole controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
