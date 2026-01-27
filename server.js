import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { Resend } from "resend";

dotenv.config();

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

/* ================================
   OPENAI CLIENT
================================ */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ================================
   RESEND CLIENT
================================ */
const resend = new Resend(process.env.RESEND_API_KEY);

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
