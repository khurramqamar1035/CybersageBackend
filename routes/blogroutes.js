import express from "express";
import {
  createBlog,
  getBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} from "../controllers/blogpostcontroller.js";

const router = express.Router();

router.post("/", createBlog);          // POST /api/blogs
router.get("/", getBlogs);              // GET  /api/blogs
router.get("/:slug", getBlogBySlug);    // GET  /api/blogs/:slug
router.put("/:id", updateBlog);         // PUT  /api/blogs/:id
router.delete("/:id", deleteBlog);      // DELETE /api/blogs/:id

export default router;
