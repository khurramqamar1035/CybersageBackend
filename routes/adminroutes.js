import express from "express";
import { adminLogin } from "../controllers/admincontroller.js";
import { adminLoginValidator } from "../validators/adminschema.js";
import { validate }  from "../middlewares/validate.js";
import { verifyAdmin } from "../middlewares/verifyadmin.js";
import { adminOnly } from "../middlewares/authMiddleware.js";
import {
  getAllCompanies, getCompany, updateUser, deleteUser,
  updateDashboardStats, updateUserService, addServiceToUser,
  removeServiceFromUser, createReport, updateReport,
  deleteReport, updatePaymentStatus,
} from "../controllers/admincontroller.js";

const router = express.Router();

// All routes protected by adminOnly
router.get("/companies", adminOnly, getAllCompanies);
router.get("/companies/:userId", adminOnly, getCompany);
router.put("/users/:userId", adminOnly, updateUser);
router.delete("/users/:userId", adminOnly, deleteUser);
router.put("/dashboard/:userId", adminOnly, updateDashboardStats);
router.post("/users/:userId/services", adminOnly, addServiceToUser);
router.put("/services/:userServiceId", adminOnly, updateUserService);
router.delete("/services/:userServiceId", adminOnly, removeServiceFromUser);
router.post("/users/:userId/reports", adminOnly, createReport);
router.put("/reports/:reportId", adminOnly, updateReport);
router.delete("/reports/:reportId", adminOnly, deleteReport);
router.put("/payments/:userServiceId", adminOnly, updatePaymentStatus);



// Public login route
router.post("/login", adminLoginValidator, validate, adminLogin);

// Example protected route
router.post("/create-post", verifyAdmin, (req, res) => {
  res.json({ message: "Admin created a post successfully!" });
});

export default router;
