import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const ClientSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4 },
  name: { type: String, required: true, trim: true },
  logo: { type: String, default: null },
  website: { type: String, default: null },
  industry: { type: String, default: null },
  featured: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
}, { strict: true });

export default mongoose.model("Client", ClientSchema);
