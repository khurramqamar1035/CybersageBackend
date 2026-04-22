import express from "express";
import {
  getEnrollmentStatus,
  setEnrollmentStatus,
  joinWaitlist,
  getWaitlist,
  deleteWaitlistEntry,
} from "../controllers/enrollmentcontroller.js";
import { adminOnly } from "../middlewares/authMiddleware.js";
import { publicWriteLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Public
router.get("/status",           getEnrollmentStatus);
router.post("/waitlist",        publicWriteLimiter, joinWaitlist);

// Admin only
router.put("/status",           adminOnly, setEnrollmentStatus);
router.get("/waitlist",         adminOnly, getWaitlist);
router.delete("/waitlist/:id",  adminOnly, deleteWaitlistEntry);

export default router;
