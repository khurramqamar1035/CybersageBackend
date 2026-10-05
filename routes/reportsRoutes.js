import express from "express";
import { getUserReports, adminCreateReport, adminDeleteReport } from "../controllers/reportsController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { validateBody } from "../middlewares/validateBody.js";
import { reportCreateSchema } from "../validators/reportschema.js";
import { appLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Every route in this file is rate limited.
router.use(appLimiter);

router.get("/", protect, getUserReports);
router.post("/admin/create", adminOnly, validateBody(reportCreateSchema), adminCreateReport);
router.delete("/admin/delete/:reportId", adminOnly, adminDeleteReport);

export default router;