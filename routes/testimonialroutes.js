import express from "express";
import {
  createTestimonial,
  getTestimonials,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonialcontroller.js";

const router = express.Router();

router.post("/", createTestimonial);
router.get("/", getTestimonials);
router.put("/:id", updateTestimonial);
router.delete("/:id", deleteTestimonial);

export default router;
