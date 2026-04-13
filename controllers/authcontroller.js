import User from "../models/User.js";
import Service from "../models/ServiceModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/sendEmail.js";
import UserService from "../models/UserService.js";

// ------------------ REGISTER ------------------
export const register = async (req, res) => {
  try {
    const { name, companyName, email, password, services } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const validServiceIds = [];
    if (services && Array.isArray(services)) {
      for (const id of services) {
        const service = await Service.findById(id);
        if (service) validServiceIds.push(service._id);
      }
    }

    const user = new User({
      name,
      companyName,
      email,
      password: hashedPassword,
      services: validServiceIds,
      verificationToken,
      verificationTokenExpires: Date.now() + 2 * 60 * 60 * 1000,
      isVerified: false,
    });

    await user.save();

    for (const serviceId of validServiceIds) {
      await UserService.create({
        user: user._id,
        service: serviceId,
        paymentStatus: "Unpaid",
        status: "Pending",
      });
    }

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailErr) {
      // Email failure is non-fatal; log server-side only
      console.error("[REGISTER] Verification email failed:", emailErr.message);
    }

    res.status(201).json({ message: "Account created. Please verify your email." });
  } catch (error) {
    console.error("[REGISTER] Error:", error.message);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

// ------------------ LOGIN ------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("services");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: "Account temporarily locked due to too many failed attempts. Please try again later.",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000;
      }
      await user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        companyName: user.companyName,
        role: user.role,
        services: user.services,
      },
    });
  } catch (err) {
    console.error("[LOGIN] Error:", err.message);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};

// ------------------ VERIFY EMAIL ------------------
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link." });
    }

    if (user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({ message: "Verification link has expired. Please register again." });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    console.error("[VERIFY EMAIL] Error:", err.message);
    res.status(500).json({ message: "Verification failed. Please try again." });
  }
};
