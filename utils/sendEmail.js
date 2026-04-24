import SibApiV3Sdk from "sib-api-v3-sdk";

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

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
};

export const sendServiceRequestEmail = async ({ userName, companyName, email, serviceName }) => {

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = { name: "CyberSage", email: process.env.BREVO_SENDER_EMAIL };
  sendSmtpEmail.to = [{ email: "cybersageuk@gmail.com" }];
  sendSmtpEmail.subject = `New Service Request — ${serviceName}`;
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Service Request</h2>
      <p>A client has requested a new service. Here are their details:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: bold; color: #475569;">Name</td>
          <td style="padding: 12px; color: #1e293b;">${userName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: bold; color: #475569;">Company</td>
          <td style="padding: 12px; color: #1e293b;">${companyName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: bold; color: #475569;">Email</td>
          <td style="padding: 12px; color: #1e293b;">${email}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: bold; color: #475569;">Requested Service</td>
          <td style="padding: 12px; color: #2563eb; font-weight: bold;">${serviceName}</td>
        </tr>
      </table>
      <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
        Please follow up with this client to discuss pricing and next steps.
      </p>
    </div>
  `;

  await emailApi.sendTransacEmail(sendSmtpEmail);
};

export const sendPricingRequestEmail = async ({ userName, companyName, email, serviceName }) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = { name: "CyberSage", email: process.env.BREVO_SENDER_EMAIL };
  sendSmtpEmail.to = [{ email: "cybersageuk@gmail.com" }];
  sendSmtpEmail.subject = `Pricing Request — ${serviceName}`;
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Pricing Request</h2>
      <p>A client is requesting pricing for a service they selected but haven't been quoted yet:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: bold; color: #475569;">Name</td>
          <td style="padding: 12px; color: #1e293b;">${userName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: bold; color: #475569;">Company</td>
          <td style="padding: 12px; color: #1e293b;">${companyName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: bold; color: #475569;">Email</td>
          <td style="padding: 12px; color: #1e293b;">${email}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-weight: bold; color: #475569;">Service</td>
          <td style="padding: 12px; color: #2563eb; font-weight: bold;">${serviceName}</td>
        </tr>
      </table>
      <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
        Please set the price for this service in the admin dashboard and notify the client.
      </p>
    </div>
  `;

  await emailApi.sendTransacEmail(sendSmtpEmail);
};