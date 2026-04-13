import express from "express";
import { createFAQ, getFAQs, updateFAQ, deleteFAQ } from "../controllers/faqcontroller.js";
import { adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getFAQs);                           // Public — read
router.post("/", adminOnly, createFAQ);             // Admin only
router.put("/:id", adminOnly, updateFAQ);           // Admin only
router.delete("/:id", adminOnly, deleteFAQ);        // Admin only

export default router;
