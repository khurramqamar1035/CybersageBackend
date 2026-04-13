import User from "../models/User.js";
import UserService from "../models/UserService.js";
import Report from "../models/Report.js";
import DashboardData from "../models/DashboardData.js";
import Service from "../models/ServiceModel.js";


const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "cybersage_admin_2024_secure_token";

export const adminLogin = (req, res) => {
  const { username, password } = req.body;

  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    return res.json({ token: ADMIN_TOKEN, message: "Login successful" });
  }

  res.status(401).json({ message: "Invalid credentials" });
};


// ------------------ GET ALL COMPANIES ------------------
export const getAllCompanies = async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { role: "user" },       // explicitly has role user
        { role: { $exists: false } } // or role field doesn't exist
      ]
    })
    .select("-password -verificationToken")
    .populate("services");

    const companiesWithStats = await Promise.all(
      users.map(async (user) => {
        const userServices = await UserService.find({ user: user._id })
          .populate("service", "name");
        const reports = await Report.find({ user: user._id });
        const dashboard = await DashboardData.findOne({ user: user._id });

        return {
          ...user.toObject(),
          userServices,
          totalReports: reports.length,
          securityScore: dashboard?.securityScore || 0,
          threatLevel: dashboard?.threatLevel || "Low",
        };
      })
    );

    res.json(companiesWithStats);
  } catch (err) {
    console.error("[ADMIN]", err.message);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};

// ------------------ GET SINGLE COMPANY ------------------
export const getCompany = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password -verificationToken");
    if (!user) return res.status(404).json({ message: "User not found" });

    const userServices = await UserService.find({ user: userId }).populate("service");
    const reports = await Report.find({ user: userId }).populate("service", "name");
    const dashboard = await DashboardData.findOne({ user: userId });

    res.json({ user, userServices, reports, dashboard });
  } catch (err) {
    console.error("[ADMIN]", err.message);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};

// ------------------ UPDATE USER ------------------
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, companyName, email, isVerified } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, companyName, email, isVerified },
      { new: true }
    ).select("-password");

    res.json({ message: "User updated", user });
  } catch (err) {
    console.error("[ADMIN]", err.message);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};

// ------------------ DELETE USER ------------------
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    await UserService.deleteMany({ user: userId });
    await Report.deleteMany({ user: userId });
    await DashboardData.deleteOneAndDelete({ user: userId });
    res.json({ message: "User and all data deleted" });
  } catch (err) {
    console.error("[ADMIN]", err.message);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};

// ------------------ UPDATE DASHBOARD STATS ------------------
export const updateDashboardStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { securityScore, threatLevel, resolvedIssues, foundIssues, blockedThreats, latestReport, nextDelivery } = req.body;

    const dashboard = await DashboardData.findOneAndUpdate(
      { user: userId },
      { securityScore, threatLevel, resolvedIssues, foundIssues, blockedThreats, latestReport, nextDelivery },
      { new: true, upsert: true }
    );

    res.json({ message: "Dashboard updated", dashboard });
  } catch (err) {
    console.error("[ADMIN]", err.message);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};

// ------------------ UPDATE USER SERVICE ------------------
export const updateUserService = async (req, res) => {
  try {
    const { userServiceId } = req.params;
    const { paymentStatus, paymentType, status, price, deliveryDate, riskLevel } = req.body;

    const userService = await UserService.findByIdAndUpdate(
      userServiceId,
      { paymentStatus, paymentType, status, price, deliveryDate, riskLevel },
      { new: true }
    ).populate("service", "name");

    res.json({ message: "Service updated", userService });
  } catch (err) {
    console.error("[ADMIN]", err.message);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};

// ------------------ ADD SERVICE TO USER ------------------
export const addServiceToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { serviceId, paymentType, price, status, riskLevel, deliveryDate } = req.body;

    // Check already exists
    const existing = await UserService.findOne({ user: userId, service: serviceId });
    if (existing) return res.status(400).json({ message: "Service already added to this user" });

    const userService = await UserService.create({
      user: userId,
      service: serviceId,
      paymentType,
      price,
      status,
      riskLevel,
      deliveryDate,
      paymentStatus: "Unpaid",
    });

    // Update user's services array
    await User.findByIdAndUpdate(userId, { $addToSet: { services: serviceId } });

    const populated = await userService.populate("service", "name");
    res.status(201).json({ message: "Service added", userService: populated });
  } catch (err) {
    console.error("[ADMIN]", err.message);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};

// ------------------ REMOVE SERVICE FROM USER ------------------
export const removeServiceFromUser = async (req, res) => {
  try {
    const { userServiceId } = req.params;
    const userService = await UserService.findById(userServiceId);
    if (!userService) return res.status(404).json({ message: "Not found" });

    await UserService.findByIdAndDelete(userServiceId);
    await User.findByIdAndUpdate(userService.user, {
      $pull: { services: userService.service },
    });

    res.json({ message: "Service removed" });
  } catch (err) {
    console.error("[ADMIN]", err.message);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};

// ------------------ CREATE REPORT ------------------
export const createReport = async (req, res) => {
  try {
    const { userId } = req.params;
    const { serviceId, title, date, riskLevel, executiveSummary, details, pdfUrl } = req.body;

    const report = await Report.create({
      user: userId,
      service: serviceId,
      title, date, riskLevel, executiveSummary, details, pdfUrl,
    });

    const populated = await report.populate("service", "name");
    res.status(201).json({ message: "Report created", report: populated });
  } catch (err) {
    console.error("[ADMIN]", err.message);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};

// ------------------ UPDATE REPORT ------------------
export const updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { title, date, riskLevel, executiveSummary, details, pdfUrl } = req.body;

    const report = await Report.findByIdAndUpdate(
      reportId,
      { title, date, riskLevel, executiveSummary, details, pdfUrl },
      { new: true }
    ).populate("service", "name");

    res.json({ message: "Report updated", report });
  } catch (err) {
    console.error("[ADMIN]", err.message);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};

// ------------------ DELETE REPORT ------------------
export const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    await Report.findByIdAndDelete(reportId);
    res.json({ message: "Report deleted" });
  } catch (err) {
    console.error("[ADMIN]", err.message);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};

// ------------------ UPDATE PAYMENT STATUS ------------------
export const updatePaymentStatus = async (req, res) => {
  try {
    const { userServiceId } = req.params;
    const { paymentStatus, invoiceUrl, invoiceDate } = req.body;

    const userService = await UserService.findByIdAndUpdate(
      userServiceId,
      { paymentStatus, invoiceUrl, invoiceDate },
      { new: true }
    ).populate("service", "name");

    res.json({ message: "Payment updated", userService });
  } catch (err) {
    console.error("[ADMIN]", err.message);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};