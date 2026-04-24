import DashboardData from "../models/DashboardData.js";
import User from "../models/User.js";

// ─── GET DASHBOARD (User) ─────────────────────────────────────────────────────
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate("services");
    if (!user) return res.status(404).json({ message: "User not found" });

    const dashboard = await DashboardData.findOne({ user: userId });

    if (!dashboard) {
      return res.json({
        companyName: user.companyName,
        services: user.services,
        securityScore: 0,
        threatLevel: "Low",
        resolvedIssues: 0,
        foundIssues: 0,
        blockedThreats: 0,
        latestReport: null,
        nextDelivery: null,
      });
    }

    res.json({
      companyName: user.companyName,
      services: user.services,
      securityScore: dashboard.securityScore,
      threatLevel: dashboard.threatLevel,
      resolvedIssues: dashboard.resolvedIssues,
      foundIssues: dashboard.foundIssues,
      blockedThreats: dashboard.blockedThreats,
      latestReport: dashboard.latestReport,
      nextDelivery: dashboard.nextDelivery,
    });
  } catch {
    res.status(500).json({ message: "Failed to load dashboard." });
  }
};

// ─── UPDATE DASHBOARD (Admin only) ───────────────────────────────────────────
export const updateDashboard = async (req, res) => {
  try {
    const {
      userId,
      securityScore,
      threatLevel,
      resolvedIssues,
      foundIssues,
      blockedThreats,
      latestReport,
      nextDelivery,
    } = req.body;

    if (!userId) return res.status(400).json({ message: "userId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const dashboard = await DashboardData.findOneAndUpdate(
      { user: userId },
      { securityScore, threatLevel, resolvedIssues, foundIssues, blockedThreats, latestReport, nextDelivery },
      { new: true, upsert: true }
    );

    res.json({ message: "Dashboard updated successfully", dashboard });
  } catch {
    res.status(500).json({ message: "Failed to update dashboard." });
  }
};
