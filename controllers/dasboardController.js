import DashboardData from "../models/DashboardData.js";
import User from "../models/User.js";

// ------------------ GET DASHBOARD (User) ------------------
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("[DASHBOARD] Fetching dashboard for user:", userId);

    // Get user info
    const user = await User.findById(userId).populate("services");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get dashboard data
    let dashboard = await DashboardData.findOne({ user: userId });

    // If no dashboard data yet, return defaults
    if (!dashboard) {
      console.log("[DASHBOARD] No dashboard data found, returning defaults");
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

    console.log("[DASHBOARD] Dashboard data found:", dashboard);

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
  } catch (err) {
    console.error("[DASHBOARD] Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------ UPDATE DASHBOARD (Admin only) ------------------
export const updateDashboard = async (req, res) => {
  try {
    const { userId, securityScore, threatLevel, resolvedIssues, foundIssues, blockedThreats, latestReport, nextDelivery } = req.body;

    console.log("[ADMIN DASHBOARD] Updating dashboard for user:", userId);
    console.log("[ADMIN DASHBOARD] Data:", req.body);

    if (!userId) return res.status(400).json({ message: "userId is required" });

    // Check user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Upsert dashboard data
    const dashboard = await DashboardData.findOneAndUpdate(
      { user: userId },
      {
        securityScore,
        threatLevel,
        resolvedIssues,
        foundIssues,
        blockedThreats,
        latestReport,
        nextDelivery,
      },
      { new: true, upsert: true }
    );

    console.log("[ADMIN DASHBOARD] Dashboard updated:", dashboard);
    res.json({ message: "Dashboard updated successfully", dashboard });
  } catch (err) {
    console.error("[ADMIN DASHBOARD] Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};