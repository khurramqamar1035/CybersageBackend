import Report from "../models/Report.js";
import UserService from "../models/UserService.js";

// ─── GET USER REPORTS ─────────────────────────────────────────────────────────
export const getUserReports = async (req, res) => {
  try {
    const userId = req.user._id;

    const paidUserServices = await UserService.find({
      user: userId,
      paymentStatus: "Paid",
    }).select("service");

    const paidServiceIds = paidUserServices.map((us) => us.service);

    const reports = await Report.find({
      user: userId,
      service: { $in: paidServiceIds },
    }).populate("service", "name");

    res.json(reports);
  } catch {
    res.status(500).json({ message: "Failed to load reports." });
  }
};

// ─── ADMIN: CREATE REPORT ─────────────────────────────────────────────────────
export const adminCreateReport = async (req, res) => {
  try {
    const { userId, serviceId, title, date, riskLevel, executiveSummary, details, pdfUrl } = req.body;

    const report = await Report.create({
      user: userId,
      service: serviceId,
      title,
      date,
      riskLevel,
      executiveSummary,
      details,
      pdfUrl,
    });

    res.status(201).json({ message: "Report created successfully", report });
  } catch {
    res.status(500).json({ message: "Failed to create report." });
  }
};

// ─── ADMIN: DELETE REPORT ─────────────────────────────────────────────────────
export const adminDeleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    await Report.findByIdAndDelete(reportId);
    res.json({ message: "Report deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete report." });
  }
};
