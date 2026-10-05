import express from "express";
import { createFAQ, getFAQs, updateFAQ, deleteFAQ } from "../controllers/faqcontroller.js";
import { adminOnly } from "../middlewares/authMiddleware.js";
import { publicReadLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Every route in this file is rate limited.
router.use(publicReadLimiter);

router.get("/", getFAQs);                           // Public — read
router.post("/", adminOnly, createFAQ);             // Admin only
router.put("/:id", adminOnly, updateFAQ);           // Admin only
router.delete("/:id", adminOnly, deleteFAQ);        // Admin only

export default router;
