import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { Resend } from "resend";
import connectDB from "./config/db.js";
import { chatLimiter, publicWriteLimiter } from "./middlewares/rateLimiter.js";
import blogRoutes from "./routes/blogroutes.js";
import faqRoutes from "./routes/faqroutes.js";
import adminRoutes from "./routes/adminroutes.js";
import aboutRoutes from "./routes/aboutroutes.js";
import authRoutes from "./routes/authroutes.js";
import serviceRoutes from "./routes/serviceroutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js";
import myServicesRoutes from "./routes/myServicesRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import testimonialRoutes from "./routes/testimonialroutes.js";
import clientRoutes from "./routes/clientroutes.js";
import internRoutes from "./routes/internroutes.js";
import enrollmentRoutes from "./routes/enrollmentroutes.js";
connectDB();

const app = express();
const port = process.env.PORT || 5001;

/* ================================
   SECURITY HEADERS (manual helmet)
================================ */
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self'"
  );
  // Remove header that reveals Express
  res.removeHeader("X-Powered-By");
  next();
});

/* ================================
   CORS — explicit allowlist only
================================ */
const buildAllowedOrigins = () => {
  const origins = new Set();

  // 1. Explicit comma-separated list (highest priority)
  (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
    .forEach((o) => origins.add(o));

  // 2. Build from CLIENT_URL (supports bare domain or full URL)
  const clientUrl = (process.env.CLIENT_URL || "").trim();
  if (clientUrl) {
    // Already has a protocol
    if (clientUrl.startsWith("http")) {
      origins.add(clientUrl.replace(/\/$/, ""));
    } else {
      // Bare domain — add both https variants
      const bare = clientUrl.replace(/^www\./, "");
      origins.add(`https://${bare}`);
      origins.add(`https://www.${bare}`);
    }
  }

  // 3. Always allow localhost for development
  origins.add("http://localhost:3000");

  return [...origins];
};

const ALLOWED_ORIGINS = buildAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server / curl / Render health checks (no origin header)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-admin-key"],
  })
);

/* ================================
   BODY SIZE LIMIT
================================ */
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

app.use("/api/blogs",blogRoutes);
app.use("/api/faq",faqRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/about",aboutRoutes);
app.use('/api/services', serviceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/my-services", myServicesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/interns",     internRoutes);
app.use("/api/enrollment", enrollmentRoutes);


// ✅ Register billing BEFORE express.json() so webhook raw body works
app.use("/api/billing", billingRoutes);


app.use("/api/auth", authRoutes);
/* ================================
   OPENAI CLIENT
================================ */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ================================
   RESEND CLIENT
================================ */


/* ================================
   CHAT API
================================ */
app.post("/api/chat", chatLimiter, async (req, res) => {
  try {
    let { messages, questionCount } = req.body;

    if (!Array.isArray(messages)) messages = [];
    if (typeof questionCount !== "number") questionCount = 0;

    if (questionCount >= 3) {
      return res.json({
        reply:
          "🔒 You've reached the free AI limit.\n\nClick below to contact our team.",
        limitReached: true,
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are CyberSage AI, a professional cybersecurity assistant.",
        },
        ...messages,
      ],
      temperature: 0.4,
      max_tokens: 500,
    });

    res.json({
      reply: completion.choices[0].message.content,
      limitReached: false,
    });
  } catch {
    res.status(500).json({ error: "AI response failed" });
  }
});

/* ================================
   CONTACT FORM (RESEND)
================================ */
app.post("/api/contact", publicWriteLimiter, async (req, res) => {
  try {
    const { firstName, lastName, email, enquiry } = req.body;

    if (!firstName || !lastName || !email || !enquiry) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      subject: "New CyberSage Enquiry",
      html: `
        <h3>New Enquiry</h3>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${enquiry}</p>
      `,
    });

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Email failed" });
  }
});

/* ================================
   ROOT — no version/tech disclosure
================================ */
app.get("/", (_, res) => res.status(200).json({ status: "ok" }));

/* ================================
   404 handler
================================ */
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

/* ================================
   GLOBAL ERROR HANDLER
   Never expose stack traces or
   raw error messages in production
================================ */
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Log full details server-side only
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  // CORS errors
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Forbidden" });
  }

  // JSON parse errors
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid request body" });
  }

  // Payload too large
  if (err.status === 413) {
    return res.status(413).json({ message: "Request too large" });
  }

  // Never send stack traces or raw err.message to clients
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: status < 500 ? err.message : "An unexpected error occurred",
  });
});

/* ================================
   START SERVER
================================ */
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
