import express from "express";
import { createTestimonial, getTestimonials, updateTestimonial, deleteTestimonial } from "../controllers/testimonialcontroller.js";
import { adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getTestimonials);                         // Public — read
router.post("/", adminOnly, createTestimonial);           // Admin only
router.put("/:id", adminOnly, updateTestimonial);         // Admin only
router.delete("/:id", adminOnly, deleteTestimonial);      // Admin only

export default router;
