import express from "express";
import { applyInternship, getInterns, updateInternStatus, deleteIntern } from "../controllers/interncontroller.js";
import { adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public — anyone can apply
router.post("/apply", applyInternship);

// Admin only (JWT-based, same as all other /admink routes)
router.get("/", adminOnly, getInterns);
router.put("/:id/status", adminOnly, updateInternStatus);
router.delete("/:id", adminOnly, deleteIntern);

export default router;
