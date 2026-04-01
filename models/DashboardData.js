import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  riskLevel: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
  summary: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const deliverySchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  deliveryDate: { type: Date, required: true },
  status: { type: String, enum: ["In Progress", "Completed", "Scheduled"], default: "Scheduled" },
});

const dashboardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    securityScore: { type: Number, default: 0, min: 0, max: 100 },
    threatLevel: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    resolvedIssues: { type: Number, default: 0 },
    foundIssues: { type: Number, default: 0 },
    blockedThreats: { type: Number, default: 0 },
    latestReport: { type: reportSchema, default: null },
    nextDelivery: { type: deliverySchema, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("DashboardData", dashboardSchema);