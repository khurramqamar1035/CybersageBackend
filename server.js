import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { Resend } from "resend";
import connectDB from "./config/db.js";
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
connectDB();


const app = express();
const port = process.env.PORT || 5001;

/* ================================
   MIDDLEWARE
================================ */
app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use("/api/blogs",blogRoutes);
app.use("/api/faq",faqRoutes);
app.use("/api/admink",adminRoutes);
app.use("/api/about",aboutRoutes);
app.use('/api/services', serviceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/my-services", myServicesRoutes);
app.use("/api/reports", reportsRoutes);


// ✅ Register billing BEFORE express.json() so webhook raw body works
app.use("/api/billing", billingRoutes);


app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

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
app.post("/api/chat", async (req, res) => {
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
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ error: "AI response failed" });
  }
});

/* ================================
   CONTACT FORM (RESEND)
================================ */
app.post("/api/contact", async (req, res) => {
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
  } catch (err) {
    console.error("Resend Error:", err);
    res.status(500).json({ error: "Email failed" });
  }
});

/* ================================
   ROOT
================================ */
app.get("/", (_, res) => {
  res.send("CyberSage AI backend running 🚀");
});

/* ================================
   START SERVER
================================ */
app.listen(port, () => {
  console.log(`✅ Backend running on port ${port}`);
});
