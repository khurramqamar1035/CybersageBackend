import EnrollmentSettings from "../models/EnrollmentSettingsModel.js";
import EnrollmentWaitlist from "../models/EnrollmentWaitlistModel.js";

// ─── GET /api/enrollment/status  (public) ────────────────────────────────────
export const getEnrollmentStatus = async (req, res) => {
  try {
    const settings = await EnrollmentSettings.getSingleton();
    res.json({ enrollmentOpen: settings.enrollmentOpen });
  } catch {
    res.status(500).json({ error: "Failed to fetch enrollment status." });
  }
};

// ─── PUT /api/enrollment/status  (admin only) ────────────────────────────────
export const setEnrollmentStatus = async (req, res) => {
  try {
    const { enrollmentOpen } = req.body;
    if (typeof enrollmentOpen !== "boolean") {
      return res.status(400).json({ error: "enrollmentOpen must be a boolean." });
    }
    const settings = await EnrollmentSettings.getSingleton();
    settings.enrollmentOpen = enrollmentOpen;
    settings.updatedAt = new Date();
    await settings.save();
    res.json({ enrollmentOpen: settings.enrollmentOpen });
  } catch {
    res.status(500).json({ error: "Failed to update enrollment status." });
  }
};

// ─── POST /api/enrollment/waitlist  (public, rate-limited) ───────────────────
export const joinWaitlist = async (req, res) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    // Check enrollment is actually closed — don't accept waitlist entries when open
    const settings = await EnrollmentSettings.getSingleton();
    if (settings.enrollmentOpen) {
      return res.status(400).json({ error: "Enrollment is currently open. Please apply directly." });
    }

    await EnrollmentWaitlist.create({ email });
    res.status(201).json({ message: "You're on the waitlist! We'll notify you when enrollment opens." });
  } catch (err) {
    // Duplicate key = email already registered
    if (err.code === 11000) {
      return res.status(409).json({ error: "This email is already on the waitlist." });
    }
    res.status(500).json({ error: "Failed to join waitlist." });
  }
};

// ─── GET /api/enrollment/waitlist  (admin only) ──────────────────────────────
export const getWaitlist = async (req, res) => {
  try {
    const entries = await EnrollmentWaitlist.find().sort({ addedAt: -1 });
    res.json(entries);
  } catch {
    res.status(500).json({ error: "Failed to fetch waitlist." });
  }
};

// ─── DELETE /api/enrollment/waitlist/:id  (admin only) ───────────────────────
export const deleteWaitlistEntry = async (req, res) => {
  try {
    const entry = await EnrollmentWaitlist.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ error: "Entry not found." });
    res.json({ message: "Removed from waitlist." });
  } catch {
    res.status(500).json({ error: "Failed to delete waitlist entry." });
  }
};
