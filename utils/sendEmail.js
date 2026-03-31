import SibApiV3Sdk from "sib-api-v3-sdk";

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

console.log('[EMAIL] BREVO_API_KEY:', process.env.BREVO_API_KEY ? '[SET]' : '[MISSING]');
console.log('[EMAIL] BREVO_SENDER_EMAIL:', process.env.BREVO_SENDER_EMAIL ? '[SET]' : '[MISSING]');

export const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = { name: "CyberSage", email: process.env.BREVO_SENDER_EMAIL };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = "Verify your CyberSage account";
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to CyberSage</h2>
      <p>Click the button below to verify your email address:</p>
      <a href="${verifyUrl}" style="
        background: #2563eb;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        text-decoration: none;
        display: inline-block;
        margin: 16px 0;
      ">Verify Email</a>
      <p style="color: #666;">This link expires in 2 hours.</p>
      <p style="color: #666;">If you didn't create an account, ignore this email.</p>
    </div>
  `;

  await emailApi.sendTransacEmail(sendSmtpEmail);
  console.log("[EMAIL] Verification email sent to:", to);
};