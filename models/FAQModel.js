import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const FAQSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    strict: true,
  }
);

export default mongoose.model("FAQ", FAQSchema);
