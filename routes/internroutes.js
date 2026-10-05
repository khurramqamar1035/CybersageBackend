import express from "express";
import { applyInternship, getInterns, updateInternStatus, deleteIntern, getAcceptedInterns, getAcceptedInternEmails } from "../controllers/interncontroller.js";
import { adminOnly } from "../middlewares/authMiddleware.js";
import { publicWriteLimiter } from "../middlewares/rateLimiter.js";
import { validateBody } from "../middlewares/validateBody.js";
import { internApplySchema, internStatusSchema } from "../validators/internschema.js";

const router = express.Router();

// Public — rate limited to prevent spam applications
router.post("/apply", publicWriteLimiter, validateBody(internApplySchema), applyInternship);

// Admin only (JWT-based, same as all other /admink routes)
router.get("/", adminOnly, getInterns);
router.get("/accepted", adminOnly, getAcceptedInterns);
router.get("/accepted/emails", adminOnly, getAcceptedInternEmails);
router.put("/:id/status", adminOnly, validateBody(internStatusSchema), updateInternStatus);
router.delete("/:id", adminOnly, deleteIntern);

export default router;
