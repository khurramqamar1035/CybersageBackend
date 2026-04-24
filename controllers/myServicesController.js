import UserService from "../models/UserService.js";
import Service from "../models/ServiceModel.js";
import User from "../models/User.js";
import { sendServiceRequestEmail, sendPricingRequestEmail } from "../utils/sendEmail.js";

// ------------------ GET USER SERVICES ------------------
export const getUserServices = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all services
    const allServices = await Service.find();

    // Get user's purchased services with payment info
    const userServices = await UserService.find({ user: userId }).populate("service");

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
  } catch {
    res.status(500).json({ message: "Failed to load services. Please try again." });
  }
};

// ------------------ REQUEST A SERVICE ------------------
export const requestService = async (req, res) => {
  try {
    const userId = req.user._id;
    const { serviceId } = req.body;

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

    res.json({ message: "Service request sent successfully" });
  } catch {
    res.status(500).json({ message: "Failed to send service request. Please try again." });
  }
};

// ------------------ ADMIN: UPDATE USER SERVICE ------------------
export const adminUpdateUserService = async (req, res) => {
  try {
    const { userId, serviceId, paymentStatus, status, price, deliveryDate, riskLevel } = req.body;

    const userService = await UserService.findOneAndUpdate(
      { user: userId, service: serviceId },
      { paymentStatus, status, price, deliveryDate, riskLevel },
      { new: true, upsert: true }
    );

    res.json({ message: "User service updated successfully", userService });
  } catch {
    res.status(500).json({ message: "Failed to update service. Please try again." });
  }
};

export const requestPricing = async (req, res) => {
  try {
    const userId = req.user._id;
    const { serviceId } = req.body;

    const user = await User.findById(userId);
    const service = await Service.findById(serviceId);

    if (!user || !service) return res.status(404).json({ message: "Not found" });

    await sendPricingRequestEmail({
      userName: user.name,
      companyName: user.companyName,
      email: user.email,
      serviceName: service.name,
    });

    res.json({ message: "Pricing request sent successfully" });
  } catch {
    res.status(500).json({ message: "Failed to send pricing request. Please try again." });
  }
};