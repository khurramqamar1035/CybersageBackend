import Report from "../models/Report.js";
import UserService from "../models/UserService.js";

// ------------------ GET USER REPORTS ------------------
export const getUserReports = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("[REPORTS] Fetching reports for user:", userId);

    // Get user's paid services only
    const paidUserServices = await UserService.find({
      user: userId,
      paymentStatus: "Paid",
    }).select("service");

    const paidServiceIds = paidUserServices.map((us) => us.service);
    console.log("[REPORTS] Paid service IDs:", paidServiceIds);

    // Get reports only for paid services
    const reports = await Report.find({
      user: userId,
      service: { $in: paidServiceIds },
    }).populate("service", "name");

    console.log("[REPORTS] Reports found:", reports.length);
    res.json(reports);
  } catch (err) {
    console.error("[REPORTS] Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------ ADMIN: CREATE REPORT ------------------
export const adminCreateReport = async (req, res) => {
  try {
    const { userId, serviceId, title, date, riskLevel, executiveSummary, details, pdfUrl } = req.body;

    console.log("[ADMIN REPORTS] Creating report for user:", userId);

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

    console.log("[ADMIN REPORTS] Report created:", report._id);
    res.status(201).json({ message: "Report created successfully", report });
  } catch (err) {
    console.error("[ADMIN REPORTS] Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------ ADMIN: DELETE REPORT ------------------
export const adminDeleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    await Report.findByIdAndDelete(reportId);
    console.log("[ADMIN REPORTS] Report deleted:", reportId);
    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error("[ADMIN REPORTS] Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};