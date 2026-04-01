import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    riskLevel: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    executiveSummary: { type: String, required: true },
    details: { type: [String], default: [] },
    pdfUrl: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);