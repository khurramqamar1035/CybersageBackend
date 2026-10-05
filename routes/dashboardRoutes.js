import express from "express";
import { getDashboard, updateDashboard } from "../controllers/dashboardController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { validateBody } from "../middlewares/validateBody.js";
import { dashboardUpdateSchema } from "../validators/dashboardschema.js";
import { appLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Every route in this file is rate limited.
router.use(appLimiter);

// User route — get their own dashboard
router.get("/", protect, getDashboard);

// Admin route — manually update any user's dashboard
router.post("/admin/update", adminOnly, validateBody(dashboardUpdateSchema), updateDashboard);

export default router;