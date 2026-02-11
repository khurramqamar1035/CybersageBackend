import BlogPost from "../models/BlogPostModel.js";
import {
  blogPostCreateSchema,
  blogPostUpdateSchema,
} from "../validators/blogpostschema.js";

export const createBlog = async (req, res) => {
  try {
    
    const data = blogPostCreateSchema.parse(req.body);
    const blog = await BlogPost.create(data);
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getBlogs = async (req, res) => {
  const blogs = await BlogPost.find().sort({ created_at: -1 });
  res.json(blogs);
};

export const getBlogBySlug = async (req, res) => {
  const blog = await BlogPost.findOne({ slug: req.params.slug });
  if (!blog) return res.status(404).json({ error: "Blog not found" });
  res.json(blog);
};

export const updateBlog = async (req, res) => {
  try {
    console.log("update blog hit ----------");
    const data = blogPostUpdateSchema.parse(req.body);

    const blog = await BlogPost.findOneAndUpdate(
      { id: req.params.id }, // UUID field, NOT _id
      {
        $set: {
          ...data,
          updated_at: new Date(),
        },
      },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    console.log("delete blog hit ----------");
    console.log("UUID:", req.params.id);

    const blog = await BlogPost.findOneAndDelete({
      id: req.params.id, // UUID field
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};