import Stripe from "stripe";
import UserService from "../models/UserService.js";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ------------------ GET BILLING DATA ------------------
export const getBillingData = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("[BILLING] Fetching billing data for user:", userId);

    const userServices = await UserService.find({ user: userId })
      .populate("service", "name description");

    const paid = userServices.filter(s => s.paymentStatus === "Paid");
    const unpaid = userServices.filter(s => s.paymentStatus === "Unpaid" && s.price > 0);

    console.log("[BILLING] Paid services:", paid.length);
    console.log("[BILLING] Unpaid services:", unpaid.length);

    res.json({ paid, unpaid });
  } catch (err) {
    console.error("[BILLING] Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------ CREATE PAYMENT INTENT (one-time) ------------------
export const createPaymentIntent = async (req, res) => {
  try {
    const { userServiceId } = req.body;
    const userId = req.user._id;

    const userService = await UserService.findOne({
      _id: userServiceId,
      user: userId,
    }).populate("service", "name");

    if (!userService) return res.status(404).json({ message: "Service not found" });
    if (userService.paymentStatus === "Paid") return res.status(400).json({ message: "Already paid" });
    if (userService.paymentType !== "one-time") return res.status(400).json({ message: "Use subscription endpoint for monthly payments" });

    const user = await User.findById(userId);

    console.log("[BILLING] Creating payment intent for:", userService.service.name, "Amount:", userService.price);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(userService.price * 100), // Stripe uses pence/cents
      currency: "gbp",
      metadata: {
        userId: userId.toString(),
        userServiceId: userServiceId.toString(),
        serviceName: userService.service.name,
      },
      description: `CyberSage — ${userService.service.name}`,
      receipt_email: user.email,
    });

    console.log("[BILLING] Payment intent created:", paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: userService.price,
      serviceName: userService.service.name,
    });
  } catch (err) {
    console.error("[BILLING] Payment intent error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------ CREATE SUBSCRIPTION (monthly) ------------------
export const createSubscription = async (req, res) => {
  try {
    const { userServiceId } = req.body;
    const userId = req.user._id;

    const userService = await UserService.findOne({
      _id: userServiceId,
      user: userId,
    }).populate("service", "name");

    if (!userService) return res.status(404).json({ message: "Service not found" });
    if (userService.paymentStatus === "Paid") return res.status(400).json({ message: "Already subscribed" });
    if (userService.paymentType !== "monthly") return res.status(400).json({ message: "Use payment intent for one-time payments" });

    const user = await User.findById(userId);

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.companyName || user.name,
        metadata: { userId: userId.toString() },
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
      console.log("[BILLING] Stripe customer created:", customerId);
    }

    // Create price on the fly
    const price = await stripe.prices.create({
      unit_amount: Math.round(userService.price * 100),
      currency: "gbp",
      recurring: { interval: "month" },
      product_data: { name: `CyberSage — ${userService.service.name}` },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price.id }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        userId: userId.toString(),
        userServiceId: userServiceId.toString(),
      },
    });

    console.log("[BILLING] Subscription created:", subscription.id);

    res.json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
      amount: userService.price,
      serviceName: userService.service.name,
    });
  } catch (err) {
    console.error("[BILLING] Subscription error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------ STRIPE WEBHOOK ------------------
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[WEBHOOK] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("[WEBHOOK] Event received:", event.type);

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const { userServiceId } = paymentIntent.metadata;

    await UserService.findByIdAndUpdate(userServiceId, {
      paymentStatus: "Paid",
      stripePaymentIntentId: paymentIntent.id,
      invoiceDate: new Date(),
    });
    console.log("[WEBHOOK] Payment succeeded for userService:", userServiceId);
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object;
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const { userServiceId } = subscription.metadata;

    await UserService.findByIdAndUpdate(userServiceId, {
      paymentStatus: "Paid",
      stripeSubscriptionId: invoice.subscription,
      invoiceUrl: invoice.hosted_invoice_url,
      invoiceDate: new Date(),
    });
    console.log("[WEBHOOK] Subscription invoice paid for userService:", userServiceId);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const { userServiceId } = subscription.metadata;

    await UserService.findByIdAndUpdate(userServiceId, {
      paymentStatus: "Unpaid",
      stripeSubscriptionId: null,
    });
    console.log("[WEBHOOK] Subscription cancelled for userService:", userServiceId);
  }

  res.json({ received: true });
};