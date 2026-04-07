import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const TestimonialSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4 },
  name: { type: String, required: true, trim: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
  content: { type: String, required: true },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  avatar: { type: String, default: null },
  featured: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
}, { strict: true });

export default mongoose.model("Testimonial", TestimonialSchema);
