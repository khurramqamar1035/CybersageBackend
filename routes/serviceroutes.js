import express from "express";
import { createService, getServices, getServiceById, updateService, deleteService } from "../controllers/servicecontroller.js";
import { adminOnly } from "../middlewares/authMiddleware.js";
import { validateBody } from "../middlewares/validateBody.js";
import { serviceCreateSchema, serviceUpdateSchema } from "../validators/serviceschema.js";
import { publicReadLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Every route in this file is rate limited.
router.use(publicReadLimiter);

router.get("/", getServices);                           // Public — read
router.get("/:id", getServiceById);                     // Public — read
router.post("/", adminOnly, validateBody(serviceCreateSchema), createService);             // Admin only
router.put("/:id", adminOnly, validateBody(serviceUpdateSchema), updateService);           // Admin only
router.delete("/:id", adminOnly, deleteService);        // Admin only

export default router;
