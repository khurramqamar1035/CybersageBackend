import express from "express";
import { getUserServices, requestService, requestPricing, adminUpdateUserService } from "../controllers/myServicesController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { validateBody } from "../middlewares/validateBody.js";
import { serviceRequestSchema, pricingRequestSchema, adminServiceUpdateSchema } from "../validators/myservicesschema.js";
import { appLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Every route in this file is rate limited.
router.use(appLimiter);

router.get("/", protect, getUserServices);
router.post("/request", protect, validateBody(serviceRequestSchema), requestService);
router.post("/admin/update", adminOnly, validateBody(adminServiceUpdateSchema), adminUpdateUserService);
router.post("/request-price", protect, validateBody(pricingRequestSchema), requestPricing);

export default router;