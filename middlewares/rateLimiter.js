import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  // ✅ Use email as key, fallback to IP using the helper for IPv6 support
  keyGenerator: (req) => {
    return req.body.email || ipKeyGenerator(req);
  },
  message: {
    message: "Too many login attempts. Please try again in 15 minutes."
  },
  skip: (req) => {
    return process.env.NODE_ENV === 'development';
  }
});