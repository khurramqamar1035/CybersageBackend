import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const isDev = process.env.NODE_ENV === "development";

/* ── Login — per email + IP, 10 attempts / 15 min ── */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.body.email || ipKeyGenerator(req),
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
});

/* ── Registration — per IP, 5 accounts / hour ── */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => ipKeyGenerator(req),
  message: { message: "Too many accounts created from this IP. Please try again later." },
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
});

/* ── Admin login — per IP, 5 attempts / 15 min (stricter) ── */
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => ipKeyGenerator(req),
  message: { message: "Too many admin login attempts. Please try again in 15 minutes." },
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
});

/* ── Public write endpoints (contact, intern apply) — per IP, 10 / 30 min ── */
export const publicWriteLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => ipKeyGenerator(req),
  message: { message: "Too many requests. Please slow down and try again later." },
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
});

/* ── Chat / AI — per IP, 20 / 10 min ── */
export const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => ipKeyGenerator(req),
  message: { message: "Too many AI requests. Please wait a moment." },
  skip: () => isDev,
  standardHeaders: true,
  legacyHeaders: false,
});