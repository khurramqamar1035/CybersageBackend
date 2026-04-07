// scripts/createAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const hashedPassword = await bcrypt.hash("asdfghjklmn", 12);

await User.create({
  name: "Admin",
  companyName: "CyberSage",
  email: "@gmail.com",
  password: hashedPassword,
  role: "admin",
  isVerified: true,
});

console.log("Admin created!");
process.exit();