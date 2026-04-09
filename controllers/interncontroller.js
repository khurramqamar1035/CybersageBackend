import Intern from "../models/InternModel.js";
import { Resend } from "resend";

export const applyInternship = async (req, res) => {
  try {
    const { name, email, phone, degree, universityYear, university } = req.body;

    if (!name || !email || !phone || !degree || !universityYear) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    // Save to DB
    const intern = await Intern.create({ name, email, phone, degree, universityYear, university });

    // Send notification email
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.MAIL_FROM,
        to: "cybersageuk@gmail.com",
        subject: `New Internship Application — ${name}`,
        html: `
          <h2>New Internship Application</h2>
          <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px">
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #ddd">${name}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd">${email}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:8px;border:1px solid #ddd">${phone}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Degree</td><td style="padding:8px;border:1px solid #ddd">${degree}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">University Year</td><td style="padding:8px;border:1px solid #ddd">${universityYear}</td></tr>
            ${university ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">University</td><td style="padding:8px;border:1px solid #ddd">${university}</td></tr>` : ''}
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Applied At</td><td style="padding:8px;border:1px solid #ddd">${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}</td></tr>
          </table>
          <p style="margin-top:16px;color:#666;font-size:12px">This application was submitted via the CyberSage website.</p>
        `,
      });
    } catch (emailErr) {
      console.error("[INTERN] Email send failed:", emailErr.message);
      // Don't fail the request if email fails
    }

    res.status(201).json({ success: true, message: "Application submitted successfully.", id: intern.id });
  } catch (err) {
    console.error("[INTERN] Error:", err.message);
    res.status(500).json({ error: "Failed to submit application." });
  }
};

export const getInterns = async (req, res) => {
  try {
    const interns = await Intern.find().sort({ applied_at: -1 });
    res.json(interns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateInternStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const intern = await Intern.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status } },
      { new: true }
    );
    if (!intern) return res.status(404).json({ error: "Intern not found" });
    res.json(intern);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteIntern = async (req, res) => {
  try {
    const intern = await Intern.findOneAndDelete({ id: req.params.id });
    if (!intern) return res.status(404).json({ error: "Intern not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
