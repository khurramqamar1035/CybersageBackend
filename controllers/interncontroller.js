import Intern from "../models/InternModel.js";
import SibApiV3Sdk from "sib-api-v3-sdk";

// Configure Brevo client once at module level
const sibClient = SibApiV3Sdk.ApiClient.instance;
sibClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// ─── Reusable email sender ────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  const msg = new SibApiV3Sdk.SendSmtpEmail();
  msg.sender  = { name: "CyberSage", email: process.env.BREVO_SENDER_EMAIL };
  msg.to      = [{ email: to }];
  msg.subject = subject;
  msg.htmlContent = html;
  await emailApi.sendTransacEmail(msg);
};

// ─── Status metadata used in emails ──────────────────────────────────────────
const STATUS_META = {
  pending:  { label: "Pending Review",  color: "#d97706", message: "Your application has been received and is currently awaiting review by our team." },
  reviewed: { label: "Under Review",    color: "#2563eb", message: "Great news! Our team is actively reviewing your application. We'll be in touch soon." },
  accepted: { label: "Accepted 🎉",     color: "#16a34a", message: "Congratulations! We are delighted to inform you that your application has been <strong>accepted</strong>. A member of our team will contact you shortly with next steps." },
  rejected: { label: "Unsuccessful",    color: "#dc2626", message: "Thank you for your interest in CyberSage. After careful consideration, we regret to inform you that we are unable to move forward with your application at this time. We encourage you to apply again in the future." },
};

// ─── Apply for internship ─────────────────────────────────────────────────────
export const applyInternship = async (req, res) => {
  try {
    const { name, email, phone, degree, universityYear, university, skills } = req.body;

    if (!name || !email || !phone || !degree || !universityYear) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    // Sanitise skills — ensure it's an array of non-empty strings, max 12
    const cleanSkills = Array.isArray(skills)
      ? skills.map(s => String(s).trim()).filter(Boolean).slice(0, 12)
      : [];

    // Save to DB
    const intern = await Intern.create({ name, email, phone, degree, universityYear, university, skills: cleanSkills });

    // 1️⃣  Notify admin
    try {
      await sendEmail({
        to: "cybersageuk@gmail.com",
        subject: `New Internship Application — ${name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#2563eb;">New Internship Application</h2>
            <p>A new applicant has submitted an internship application via the CyberSage website.</p>
            <table style="width:100%;border-collapse:collapse;margin-top:16px;">
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:12px;font-weight:bold;color:#475569;">Name</td>
                <td style="padding:12px;color:#1e293b;">${name}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:12px;font-weight:bold;color:#475569;">Email</td>
                <td style="padding:12px;color:#1e293b;">${email}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:12px;font-weight:bold;color:#475569;">Phone</td>
                <td style="padding:12px;color:#1e293b;">${phone}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:12px;font-weight:bold;color:#475569;">Degree / Course</td>
                <td style="padding:12px;color:#1e293b;">${degree}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:12px;font-weight:bold;color:#475569;">University Year</td>
                <td style="padding:12px;color:#1e293b;">${universityYear}</td>
              </tr>
              ${university ? `
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:12px;font-weight:bold;color:#475569;">University</td>
                <td style="padding:12px;color:#1e293b;">${university}</td>
              </tr>` : ''}
            ${cleanSkills.length > 0 ? `
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:12px;font-weight:bold;color:#475569;vertical-align:top;">Skills</td>
                <td style="padding:12px;color:#1e293b;">${cleanSkills.map(s => `<span style="display:inline-block;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:4px;padding:2px 8px;font-size:12px;margin:2px;">${s}</span>`).join(' ')}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:12px;font-weight:bold;color:#475569;">Applied At</td>
                <td style="padding:12px;color:#1e293b;">${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}</td>
              </tr>
            </table>
            <p style="margin-top:24px;color:#64748b;font-size:13px;">
              Review and manage this application in the <strong>Admin Dashboard → Intern Applications</strong>.
            </p>
          </div>
        `,
      });
      console.log("[INTERN] Admin notification sent to cybersageuk@gmail.com");
    } catch (err) {
      console.error("[INTERN] Admin email failed:", err.message);
    }

    // 2️⃣  Confirmation email to the applicant
    try {
      await sendEmail({
        to: email,
        subject: "Your CyberSage Internship Application — Received",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:32px;">
            <div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">

              <div style="text-align:center;margin-bottom:28px;">
                <h1 style="margin:0;font-size:24px;color:#0f172a;">Application Received</h1>
                <p style="margin:8px 0 0;color:#64748b;font-size:15px;">CyberSage Internship Programme</p>
              </div>

              <p style="color:#334155;font-size:15px;line-height:1.6;">Hi <strong>${name}</strong>,</p>
              <p style="color:#334155;font-size:15px;line-height:1.6;">
                Thank you for applying to the <strong>CyberSage Internship Programme</strong>. We have successfully received your application and our team will review it shortly.
              </p>

              <div style="background:#f1f5f9;border-left:4px solid #2563eb;border-radius:6px;padding:16px 20px;margin:24px 0;">
                <p style="margin:0;color:#475569;font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:0.05em;">What happens next?</p>
                <ul style="margin:10px 0 0;padding-left:20px;color:#334155;font-size:14px;line-height:1.8;">
                  <li>Our team will review your application within <strong>5–7 business days</strong>.</li>
                  <li>You will receive an email at this address whenever your application status is updated.</li>
                  <li>If shortlisted, we will reach out to discuss the next steps.</li>
                </ul>
              </div>

              <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:14px;">
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px 12px;color:#64748b;font-weight:600;">Name</td>
                  <td style="padding:10px 12px;color:#1e293b;">${name}</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px 12px;color:#64748b;font-weight:600;">Degree</td>
                  <td style="padding:10px 12px;color:#1e293b;">${degree}</td>
                </tr>
                ${university ? `
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:10px 12px;color:#64748b;font-weight:600;">University</td>
                  <td style="padding:10px 12px;color:#1e293b;">${university}</td>
                </tr>` : ''}
                <tr style="${cleanSkills.length > 0 ? 'border-bottom:1px solid #e2e8f0;' : ''}">
                  <td style="padding:10px 12px;color:#64748b;font-weight:600;">Year of Study</td>
                  <td style="padding:10px 12px;color:#1e293b;">${universityYear}</td>
                </tr>
                ${cleanSkills.length > 0 ? `
                <tr>
                  <td style="padding:10px 12px;color:#64748b;font-weight:600;vertical-align:top;">Skills</td>
                  <td style="padding:10px 12px;">${cleanSkills.map(s => `<span style="display:inline-block;background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;border-radius:4px;padding:2px 8px;font-size:12px;margin:2px;">${s}</span>`).join(' ')}</td>
                </tr>` : ''}
              </table>

              <p style="margin-top:28px;color:#334155;font-size:15px;line-height:1.6;">
                We look forward to reviewing your application.<br/>
                <strong>The CyberSage Team</strong>
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />
              <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
                This is an automated confirmation. Please do not reply to this email.<br/>
                © CyberSage · <a href="https://www.cybersage.uk" style="color:#2563eb;text-decoration:none;">cybersage.uk</a>
              </p>
            </div>
          </div>
        `,
      });
      console.log(`[INTERN] Confirmation email sent to applicant: ${email}`);
    } catch (err) {
      console.error("[INTERN] Applicant confirmation email failed:", err.message);
    }

    res.status(201).json({ success: true, message: "Application submitted successfully.", id: intern.id });
  } catch (err) {
    console.error("[INTERN] Error:", err.message);
    res.status(500).json({ error: "Failed to submit application." });
  }
};

// ─── Get all interns ──────────────────────────────────────────────────────────
export const getInterns = async (req, res) => {
  try {
    const interns = await Intern.find().sort({ applied_at: -1 });
    res.json(interns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Update status + notify applicant ────────────────────────────────────────
export const updateInternStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'reviewed', 'accepted', 'rejected'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(', ')}` });
    }

    const intern = await Intern.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status, statusUpdatedAt: new Date() } },
      { new: true, runValidators: true }
    );
    if (!intern) return res.status(404).json({ error: "Intern not found" });

    console.log(`[INTERN] Status updated → ${intern.name}: ${status}`);

    // 3️⃣  Status update email to the applicant
    try {
      const meta = STATUS_META[status] || STATUS_META.pending;
      await sendEmail({
        to: intern.email,
        subject: `CyberSage Internship — Application Status Update`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:32px;">
            <div style="background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">

              <div style="text-align:center;margin-bottom:28px;">
                <h1 style="margin:0;font-size:24px;color:#0f172a;">Application Status Update</h1>
                <p style="margin:8px 0 0;color:#64748b;font-size:15px;">CyberSage Internship Programme</p>
              </div>

              <p style="color:#334155;font-size:15px;line-height:1.6;">Hi <strong>${intern.name}</strong>,</p>
              <p style="color:#334155;font-size:15px;line-height:1.6;">
                We have an update regarding your internship application. Your current status is:
              </p>

              <div style="text-align:center;margin:24px 0;">
                <span style="display:inline-block;background:${meta.color}1a;color:${meta.color};border:1px solid ${meta.color}40;border-radius:8px;padding:10px 28px;font-size:16px;font-weight:700;letter-spacing:0.02em;">
                  ${meta.label}
                </span>
              </div>

              <div style="background:#f1f5f9;border-left:4px solid ${meta.color};border-radius:6px;padding:16px 20px;margin:0 0 24px;">
                <p style="margin:0;color:#334155;font-size:14px;line-height:1.7;">${meta.message}</p>
              </div>

              <p style="color:#334155;font-size:15px;line-height:1.6;">
                If you have any questions, feel free to contact us at
                <a href="mailto:cybersageuk@gmail.com" style="color:#2563eb;text-decoration:none;">cybersageuk@gmail.com</a>.
              </p>

              <p style="margin-top:28px;color:#334155;font-size:15px;line-height:1.6;">
                Best regards,<br/>
                <strong>The CyberSage Team</strong>
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;" />
              <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
                This is an automated message. Please do not reply to this email.<br/>
                © CyberSage · <a href="https://www.cybersage.uk" style="color:#2563eb;text-decoration:none;">cybersage.uk</a>
              </p>
            </div>
          </div>
        `,
      });
      console.log(`[INTERN] Status update email sent to: ${intern.email} (${status})`);
    } catch (err) {
      console.error("[INTERN] Status email failed:", err.message);
    }

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
