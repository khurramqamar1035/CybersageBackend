import express from "express";
import { applyInternship, getInterns, updateInternStatus, deleteIntern } from "../controllers/interncontroller.js";
import { verifyAdmin } from "../middlewares/verifyadmin.js";

const router = express.Router();

// Public — anyone can apply
router.post("/apply", applyInternship);

// Admin only
router.get("/", verifyAdmin, getInterns);
router.put("/:id/status", verifyAdmin, updateInternStatus);
router.delete("/:id", verifyAdmin, deleteIntern);

export default router;
