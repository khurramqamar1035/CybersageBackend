import express from "express";
import { login, register, verifyEmail } from "../controllers/authcontroller.js";
import { validate } from "../middlewares/validator2.js";
import { loginLimiter } from "../middlewares/rateLimiter.js";
import { loginSchema, registerSchema } from "../validators/authValidator.js";

const router = express.Router();

// REGISTER NEW USER
router.post(
  "/register",
  validate(registerSchema), // Use Joi register schema
  register
);

// LOGIN ROUTE
router.post(
  "/login",
  loginLimiter, // Apply rate limiter here
  validate(loginSchema), // Use Joi login schema
  login
);

export default router;