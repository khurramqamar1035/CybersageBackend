import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const InternSchema = new mongoose.Schema({
  id:             { type: String, default: uuidv4 },
  name:           { type: String, required: true, trim: true },
  email:          { type: String, required: true, trim: true, lowercase: true },
  phone:          { type: String, required: true, trim: true },
  degree:         { type: String, required: true, trim: true },
  universityYear: { type: String, required: true },
  university:     { type: String, trim: true, default: null },
  status:         { type: String, enum: ['pending', 'reviewed', 'accepted', 'rejected'], default: 'pending' },
  applied_at:     { type: Date, default: Date.now },
}, { strict: true });

export default mongoose.model("Intern", InternSchema);
