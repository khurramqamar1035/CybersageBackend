import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

/* =================================
   🔥 EXPRESS 5 PREFLIGHT FIX
================================= */
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return res.sendStatus(204);
  }
  next();
});

/* =================================
   CORS
================================= */
app.use(
  cors({
    origin: true, // allow all origins, or specify your frontend URL
    credentials: true,
  })
);

/* =================================
   BODY PARSER
================================= */
app.use(express.json());

/* =================================
   OPENAI CLIENT
================================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =================================
   CHAT ENDPOINT
================================= */
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

/* =================================
   CONTACT FORM (GMAIL)
================================= */
app.post("/api/contact", async (req, res) => {
  try {
    const { firstName, lastName, email, enquiry } = req.body;
    console.log("hello");

    if (!firstName || !lastName || !email || !enquiry) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Use environment variables for mail credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER, // your Gmail address
        pass: process.env.MAIL_PASS, // Gmail app password
      },
    });

    const mailOptions = {
      from: `"CyberSage AI" <${process.env.MAIL_USER}>`,
      to: process.env.MAIL_USER,
      subject: "New CyberSage Enquiry",
      text: `Name: ${firstName} ${lastName}\nEmail: ${email}\nEnquiry: ${enquiry}`,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Mail sent:", info.response);

    res.json({ success: true });
  } catch (err) {
    console.error("Mail Error Full:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =================================
   ROOT
================================= */
app.get("/", (_, res) => {
  res.send("CyberSage AI backend running 🚀");
});

/* =================================
   START SERVER
================================= */
app.listen(port, () => {
  console.log(`✅ Backend running on port ${port}`);
});
