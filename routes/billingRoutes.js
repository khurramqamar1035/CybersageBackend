import express from "express";
import {
  getBillingData,
  createPaymentIntent,
  createSubscription,
  stripeWebhook,
} from "../controllers/billingController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validateBody } from "../middlewares/validateBody.js";
import { userServiceRefSchema } from "../validators/billingschema.js";
import { appLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// Every route in this file is rate limited.
router.use(appLimiter);

// ✅ Webhook must be raw body — register BEFORE express.json()
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

router.get("/", protect, getBillingData);
router.post("/create-payment-intent", protect, validateBody(userServiceRefSchema), createPaymentIntent);
router.post("/create-subscription", protect, validateBody(userServiceRefSchema), createSubscription);

export default router;