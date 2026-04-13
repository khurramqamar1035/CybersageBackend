import express from "express";
import { createService, getServices, getServiceById, updateService, deleteService } from "../controllers/servicecontroller.js";
import { adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getServices);                           // Public — read
router.get("/:id", getServiceById);                     // Public — read
router.post("/", adminOnly, createService);             // Admin only
router.put("/:id", adminOnly, updateService);           // Admin only
router.delete("/:id", adminOnly, deleteService);        // Admin only

export default router;
