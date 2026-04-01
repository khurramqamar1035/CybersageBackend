import express from "express";
import { getDashboard, updateDashboard } from "../controllers/dashboardController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { adminAuth } from "../middlewares/adminAuth.js";

const router = express.Router();

// User route — get their own dashboard
router.get("/", protect, getDashboard);

// Admin route — manually update any user's dashboard
router.post("/admin/update", adminAuth, updateDashboard);

export default router;