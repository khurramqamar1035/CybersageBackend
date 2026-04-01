import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    companyName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    stripeCustomerId: { type: String, default: null },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);