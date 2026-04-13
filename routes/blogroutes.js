import express from "express";
import { createBlog, getBlogs, getBlogBySlug, updateBlog, deleteBlog } from "../controllers/blogpostcontroller.js";
import { adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getBlogs);                          // Public — read
router.get("/:slug", getBlogBySlug);                // Public — read
router.post("/", adminOnly, createBlog);            // Admin only
router.put("/:id", adminOnly, updateBlog);          // Admin only
router.delete("/:id", adminOnly, deleteBlog);       // Admin only

export default router;
