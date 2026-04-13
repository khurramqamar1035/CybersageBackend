import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const InternSchema = new mongoose.Schema({
  id:               { type: String, default: uuidv4, index: true },
  name:             { type: String, required: true, trim: true },
  email:            { type: String, required: true, trim: true, lowercase: true },
  phone:            { type: String, required: true, trim: true },
  degree:           { type: String, required: true, trim: true },
  universityYear:   { type: String, required: true },
  university:       { type: String, trim: true, default: null },
  skills:           { type: [String], default: [] },
  status:           { type: String, enum: ['pending', 'reviewed', 'accepted', 'rejected'], default: 'pending' },
  statusUpdatedAt:  { type: Date, default: null },
  applied_at:       { type: Date, default: Date.now },
}, { strict: true, id: false }); // id:false prevents Mongoose virtual from shadowing the custom UUID id field

export default mongoose.model("Intern", InternSchema);
