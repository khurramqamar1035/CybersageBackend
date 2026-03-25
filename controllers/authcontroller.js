import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/SendEmail.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("[LOGIN] Attempting login for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("[LOGIN] User not found:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.log("[LOGIN] User found:", user.email);

    // account locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      console.log("[LOGIN] Account locked until:", new Date(user.lockUntil));
      return res.status(403).json({
        message: "Account locked due to too many failed attempts",
      });
    }

    // check password
    const match = await bcrypt.compare(password, user.password);
    console.log("[LOGIN] Password match:", match);

    if (!match) {
      user.failedLoginAttempts += 1;
      console.log(
        `[LOGIN] Failed login attempts: ${user.failedLoginAttempts}`
      );

      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // lock 30 mins
        console.log("[LOGIN] Account locked for 30 minutes");
      }

      await user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // check email verification
    if (!user.isVerified) {
      console.log("[LOGIN] Email not verified:", user.email);
      return res.status(403).json({
        message: "Please verify your email first",
      });
    }

    // reset attempts
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
    console.log("[LOGIN] Login successful for:", user.email);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        companyName: user.companyName,
      },
    });
  } catch (err) {
    console.error("[LOGIN] Server error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ------------------ VERIFY EMAIL ------------------
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log("[VERIFY EMAIL] Token received:", token);

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      console.log("[VERIFY EMAIL] Invalid token");
      return res.status(400).json({ message: "Invalid token" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();
    console.log("[VERIFY EMAIL] Email verified for:", user.email);

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("[VERIFY EMAIL] Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------ REGISTER ------------------
export const register = async (req, res) => {
  try {
    const { companyName, email, password } = req.body;
    console.log("[REGISTER] Attempting registration for:", email);

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("[REGISTER] Email already registered:", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user (password hashing handled by model pre-save hook)
    const user = new User({ companyName, email, password, verificationToken });
    await user.save();
    console.log("[REGISTER] User saved:", email);

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
      console.log("[REGISTER] Verification email sent:", email);
    } catch (emailErr) {
      console.error("[REGISTER] Email sending failed:", emailErr);
    }

    res.status(201).json({
      message: "Account created. Please verify your email.",
    });
  } catch (error) {
    console.error("[REGISTER] Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};