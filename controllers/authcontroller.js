import User from "../models/User.js";
import Service from "../models/ServiceModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/sendEmail.js";

// ------------------ REGISTER ------------------
export const register = async (req, res) => {
  try {
    const { name, companyName, email, password, services } = req.body;

    // Log all incoming request data
    console.log("[REGISTER] Incoming request body:", {
      name,
      companyName,
      email,
      password: password ? `[PROVIDED - ${password.length} chars]` : "[MISSING]",
      services,
    });

    // Validate required fields
    if (!name || !email || !password) {
      console.warn("[REGISTER] Missing required fields:", {
        name: !!name,
        email: !!email,
        password: !!password,
      });
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    console.log("[REGISTER] Attempting registration for:", email);

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("[REGISTER] Email already registered:", email);
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("[REGISTER] Password hashed successfully");

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    console.log("[REGISTER] Verification token generated:", verificationToken);

    // Convert selected service IDs to ObjectId and verify they exist
    const validServiceIds = [];
    if (services && Array.isArray(services)) {
      console.log("[REGISTER] Validating services:", services);
      for (const id of services) {
        const service = await Service.findById(id);
        if (service) {
          validServiceIds.push(service._id);
          console.log("[REGISTER] Valid service found:", id);
        } else {
          console.warn("[REGISTER] Service not found for ID:", id);
        }
      }
    }
    console.log("[REGISTER] Valid service IDs:", validServiceIds);

    // Create user
    const user = new User({
      name,
      companyName,
      email,
      password: hashedPassword,
      services: validServiceIds,
      verificationToken: verificationToken, // ✅ Fixed: was incorrectly set to process.env.JWT_SECRET
      verificationTokenExpires: Date.now() + 2 * 60 * 60 * 1000,
      isVerified: false,
    });

    await user.save();
    console.log("[REGISTER] User saved successfully:", {
      id: user._id,
      email: user.email,
      verificationToken: user.verificationToken,
      verificationTokenExpires: user.verificationTokenExpires,
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
      console.log("[REGISTER] Verification email sent to:", email);
    } catch (emailErr) {
      console.error("[REGISTER] Email sending failed:", emailErr);
    }

    res.status(201).json({
      message: "Account created. Please verify your email.",
    });
  } catch (error) {
    console.error("[REGISTER] Unexpected error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------ LOGIN ------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("[LOGIN] Attempting login for:", email);

    const user = await User.findOne({ email }).populate("services");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Account locked check
    if (user.lockUntil && user.lockUntil > Date.now()) {
      console.warn("[LOGIN] Account locked:", email);
      return res.status(403).json({
        message: "Account locked due to too many failed attempts",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      console.warn("[LOGIN] Wrong password, failed attempts:", user.failedLoginAttempts);
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000;
        console.warn("[LOGIN] Account locked for 30 mins:", email);
      }
      await user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      console.warn("[LOGIN] Email not verified:", email);
      return res.status(403).json({ message: "Please verify your email first" });
    }

    // Reset failed attempts
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    console.log("[LOGIN] Login successful for:", email);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        services: user.services,
      },
    });
  } catch (err) {
    console.error("[LOGIN] Server error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------ VERIFY EMAIL ------------------
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log("[VERIFY EMAIL] Token received:", token);

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      console.warn("[VERIFY EMAIL] No user found for token:", token);
      return res.status(400).json({ message: "Invalid token" });
    }

    if (user.verificationTokenExpires < Date.now()) {
      console.warn("[VERIFY EMAIL] Token expired for:", user.email);
      return res.status(400).json({ message: "Verification token has expired. Please register again." });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    console.log("[VERIFY EMAIL] Email verified successfully for:", user.email);
    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("[VERIFY EMAIL] Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};