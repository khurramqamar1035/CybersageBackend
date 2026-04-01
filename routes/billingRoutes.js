import express from "express";
import {
  getBillingData,
  createPaymentIntent,
  createSubscription,
  stripeWebhook,
} from "../controllers/billingController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Webhook must be raw body — register BEFORE express.json()
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

router.get("/", protect, getBillingData);
router.post("/create-payment-intent", protect, createPaymentIntent);
router.post("/create-subscription", protect, createSubscription);

export default router;