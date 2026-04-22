import mongoose from "mongoose";

const EnrollmentWaitlistSchema = new mongoose.Schema({
  email:   { type: String, required: true, trim: true, lowercase: true, unique: true },
  addedAt: { type: Date, default: Date.now },
});

export default mongoose.model("EnrollmentWaitlist", EnrollmentWaitlistSchema);
