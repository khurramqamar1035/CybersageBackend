import express from "express";
import { adminLogin } from "../controllers/admincontroller.js";
import { adminLoginValidator } from "../validators/adminschema.js";
import validate from "../middlewares/validate.js";
import { verifyAdmin } from "../middlewares/verifyadmin.js";

const router = express.Router();

// Public login route
router.post("/login", adminLoginValidator, validate, adminLogin);

// Example protected route
router.post("/create-post", verifyAdmin, (req, res) => {
  res.json({ message: "Admin created a post successfully!" });
});

export default router;
