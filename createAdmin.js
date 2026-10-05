// Create or update an admin account.
//
//   node createAdmin.js <email> <password> [name]
//
// Safe to re-run: an existing account with that email is promoted to admin and
// given the new password rather than failing on the unique email index.
// No credentials are hardcoded in this file — pass them on the command line.

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const [email, password, name = "Admin"] = process.argv.slice(2);

if (!email || !password) {
  console.error("Usage: node createAdmin.js <email> <password> [name]");
  process.exit(1);
}
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error(`Not a valid email address: ${email}`);
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not set. Check your .env file.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

const existing = await User.findOne({ email });
const hashedPassword = await bcrypt.hash(password, 12);

const user = await User.findOneAndUpdate(
  { email },
  {
    $set: {
      name,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      failedLoginAttempts: 0,
      lockUntil: null,
    },
    $setOnInsert: { companyName: "CyberSage" },
  },
  { new: true, upsert: true }
);

console.log(
  `${existing ? "Updated" : "Created"} admin: ${user.email}  (name: ${user.name}, role: ${user.role}, verified: ${user.isVerified})`
);

await mongoose.disconnect();
process.exit(0);
