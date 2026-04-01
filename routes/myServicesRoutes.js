import express from "express";
import { getUserServices, requestService, adminUpdateUserService } from "../controllers/myServicesController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { adminAuth } from "../middlewares/adminAuth.js";

const router = express.Router();

router.get("/", protect, getUserServices);
router.post("/request", protect, requestService);
router.post("/admin/update", adminAuth, adminUpdateUserService);

export default router;