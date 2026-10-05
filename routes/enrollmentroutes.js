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
import { validateBody } from "../middlewares/validateBody.js";
import { waitlistSchema, enrollmentStatusSchema } from "../validators/enrollmentschema.js";

const router = express.Router();

// Public
router.get("/status",           getEnrollmentStatus);
router.post("/waitlist",        publicWriteLimiter, validateBody(waitlistSchema), joinWaitlist);

// Admin only
router.put("/status",           adminOnly, validateBody(enrollmentStatusSchema), setEnrollmentStatus);
router.get("/waitlist",         adminOnly, getWaitlist);
router.delete("/waitlist/:id",  adminOnly, deleteWaitlistEntry);

export default router;
