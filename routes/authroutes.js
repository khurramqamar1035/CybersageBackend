import express from "express";
import { login, register, verifyEmail } from "../controllers/authcontroller.js";
import { validate } from "../middlewares/validator2.js";
import { loginLimiter, registerLimiter } from "../middlewares/rateLimiter.js";
import { loginSchema, registerSchema } from "../validators/authvalidator.js";

const router = express.Router();

// REGISTER — rate limited to 5 accounts/hour per IP
router.post("/register", registerLimiter, validate(registerSchema), register);

// LOGIN — rate limited to 10 attempts/15 min per email+IP
router.post("/login", loginLimiter, validate(loginSchema), login);

router.get("/verify-email/:token", verifyEmail);

export default router;
