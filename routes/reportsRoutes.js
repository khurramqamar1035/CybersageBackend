import express from "express";
import { getUserReports, adminCreateReport, adminDeleteReport } from "../controllers/reportsController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { adminAuth } from "../middlewares/adminAuth.js";

const router = express.Router();

router.get("/", protect, getUserReports);
router.post("/admin/create", adminAuth, adminCreateReport);
router.delete("/admin/delete/:reportId", adminAuth, adminDeleteReport);

export default router;