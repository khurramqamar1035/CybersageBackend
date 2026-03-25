import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);
const sender= process.env.MAIL_USER

export const sendVerificationEmail = async (email, token) => {
  try {
    const verificationLink = `${process.env.APP_URL}/api/auth/verify/${token}`;

    console.log("sajdsabdsa-----",email,"ahsdjfbjewj----",sender);
    await resend.emails.send({
      from: sender,
      to: email,
      subject: "Verify your email",
      html: `
        <div style="font-family: Arial, sans-serif; padding:20px">
          <h2>Email Verification</h2>
          <p>Please verify your email to activate your account.</p>
          <a href="${verificationLink}" 
             style="display:inline-block;padding:12px 20px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">
             Verify Email
          </a>
          <p style="margin-top:20px;font-size:12px;color:gray">
            If you didn't create this account, you can ignore this email.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Email service error");
  }
};