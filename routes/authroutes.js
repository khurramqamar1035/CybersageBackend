import express from "express";
import { login, register, verifyEmail } from "../controllers/authcontroller.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { loginLimiter, registerLimiter } from "../middlewares/rateLimiter.js";
import { loginSchema, registerSchema } from "../validators/authvalidator.js";

const router = express.Router();

// REGISTER — rate limited to 5 accounts/hour per IP
router.post("/register", registerLimiter, validateSchema(registerSchema), register);

// LOGIN — rate limited to 10 attempts/15 min per email+IP
router.post("/login", loginLimiter, validateSchema(loginSchema), login);

router.get("/verify-email/:token", verifyEmail);

export default router;
