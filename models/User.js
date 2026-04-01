import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    companyName: { type: String }, // optional
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },

    // Array of references to Service model
    services: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Service" }
    ],
    stripeCustomerId: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);