import mongoose from "mongoose";

const userServiceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid",
    },
    paymentType: {
      type: String,
      enum: ["one-time", "monthly"],
      default: "one-time",
    },
    price: { type: Number, default: 0 },
    deliveryDate: { type: Date, default: null },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    stripePaymentIntentId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    invoiceUrl: { type: String, default: null },
    invoiceDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("UserService", userServiceSchema);