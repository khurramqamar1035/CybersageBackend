import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("[AUTH] No token provided");
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Extract token
    const token = authHeader.split(" ")[1];
    console.log("[AUTH] Token received:", token ? "[PROVIDED]" : "[MISSING]");

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[AUTH] Token decoded:", decoded);

    // Find user from token
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.warn("[AUTH] No user found for token");
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      console.warn("[AUTH] User not verified:", user.email);
      return res.status(403).json({ message: "Please verify your email first" });
    }

    // Attach user to request
    req.user = user;
    console.log("[AUTH] User authenticated:", user.email);
    next();
  } catch (err) {
    console.error("[AUTH] Token verification failed:", err.message);
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

export const adminOnly = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.role !== "admin") return res.status(403).json({ message: "Access denied. Admins only." });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};