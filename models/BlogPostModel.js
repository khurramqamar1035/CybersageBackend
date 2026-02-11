import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const BlogPostSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: uuidv4,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    featured_image: {
      type: String,
      default: null,
    },
    published: {
      type: Boolean,
      default: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    strict: true, // ignores extra fields
  }
);

export default mongoose.model("BlogPost", BlogPostSchema);
