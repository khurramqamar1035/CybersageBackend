import UserService from "../models/UserService.js";
import Service from "../models/ServiceModel.js";
import User from "../models/User.js";
import { sendServiceRequestEmail } from "../utils/sendEmail.js";

// ------------------ GET USER SERVICES ------------------
export const getUserServices = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("[MY SERVICES] Fetching services for user:", userId);

    // Get all services
    const allServices = await Service.find();

    // Get user's purchased services with payment info
    const userServices = await UserService.find({ user: userId }).populate("service");

    console.log("[MY SERVICES] All services:", allServices.length);
    console.log("[MY SERVICES] User services:", userServices.length);

    // Map user service IDs for quick lookup
    const userServiceMap = {};
    userServices.forEach((us) => {
      userServiceMap[us.service._id.toString()] = us;
    });

    // Build response
    const result = allServices.map((service) => {
      const userService = userServiceMap[service._id.toString()];

      if (userService) {
        // User selected this service
        return {
          _id: service._id,
          name: service.name,
          description: service.description,
          owned: true,
          paymentStatus: userService.paymentStatus,
          status: userService.status,
          riskLevel: userService.riskLevel,
          deliveryDate: userService.deliveryDate,
          price: userService.price,
          userServiceId: userService._id,
        };
      } else {
        // User does not own this service
        return {
          _id: service._id,
          name: service.name,
          description: service.description,
          owned: false,
          paymentStatus: null,
          status: null,
          riskLevel: null,
          deliveryDate: null,
          price: null,
        };
      }
    });

    res.json(result);
  } catch (err) {
    console.error("[MY SERVICES] Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------ REQUEST A SERVICE ------------------
export const requestService = async (req, res) => {
  try {
    const userId = req.user._id;
    const { serviceId } = req.body;

    console.log("[REQUEST SERVICE] User:", userId, "Service:", serviceId);

    const user = await User.findById(userId);
    const service = await Service.findById(serviceId);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!service) return res.status(404).json({ message: "Service not found" });

    // Send email to admin
    await sendServiceRequestEmail({
      userName: user.name,
      companyName: user.companyName,
      email: user.email,
      serviceName: service.name,
    });

    console.log("[REQUEST SERVICE] Email sent to admin for service:", service.name);
    res.json({ message: "Service request sent successfully" });
  } catch (err) {
    console.error("[REQUEST SERVICE] Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ------------------ ADMIN: UPDATE USER SERVICE ------------------
export const adminUpdateUserService = async (req, res) => {
  try {
    const { userId, serviceId, paymentStatus, status, price, deliveryDate, riskLevel } = req.body;

    console.log("[ADMIN UPDATE SERVICE] Updating for user:", userId, "service:", serviceId);

    const userService = await UserService.findOneAndUpdate(
      { user: userId, service: serviceId },
      { paymentStatus, status, price, deliveryDate, riskLevel },
      { new: true, upsert: true }
    );

    console.log("[ADMIN UPDATE SERVICE] Updated:", userService);
    res.json({ message: "User service updated successfully", userService });
  } catch (err) {
    console.error("[ADMIN UPDATE SERVICE] Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};