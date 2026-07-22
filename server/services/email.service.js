const { Resend } = require("resend");
const nodemailer = require("nodemailer");

let resendClient = null;
let etherealTransporter = null;

/**
 * Escapes special HTML characters to prevent XSS in email templates.
 */
const escapeHtml = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Creates a mobile-responsive, beautifully styled HTML email template.
 */
const createOtpEmailTemplate = ({ otp, role, expiresInMinutes = 5 }) => {
  const safeOtp = escapeHtml(otp);
  const safeRole = escapeHtml(role || "User");
  const safeExpiry = escapeHtml(expiresInMinutes);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GramConnect Verification Code</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 500px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; text-align: center; }
    .logo { font-size: 24px; font-weight: 800; color: #22c55e; margin-bottom: 24px; letter-spacing: -0.5px; }
    .title { font-size: 18px; font-weight: 600; color: #f1f5f9; margin-bottom: 8px; }
    .subtitle { font-size: 14px; color: #94a3b8; margin-bottom: 28px; line-height: 1.5; }
    .otp-box { background: #0f172a; border: 2px dashed #22c55e; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #22c55e; margin: 0; font-family: 'Courier New', Courier, monospace; }
    .expiry { font-size: 13px; color: #cbd5e1; margin-top: 12px; font-weight: 500; }
    .warning { font-size: 12px; color: #ef4444; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 10px 14px; border-radius: 8px; margin-top: 20px; }
    .footer { font-size: 12px; color: #64748b; margin-top: 32px; border-top: 1px solid #334155; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo"> GramConnect</div>
    <div class="title">Security Verification Code</div>
    <div class="subtitle">Use the verification code below to confirm your login or registration as <strong>${safeRole}</strong>.</div>
    <div class="otp-box">
      <div class="otp-code">${safeOtp}</div>
      <div class="expiry"> Valid for ${safeExpiry} minutes</div>
    </div>
    <div class="warning"> Never share this OTP with anyone. GramConnect staff will never ask for your code.</div>
    <div class="footer">If you did not request this verification code, please safely ignore this email.</div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Returns a lazy-initialized Resend client instance.
 */
const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
};

/**
 * Sends OTP email using Resend HTTPS API.
 */
const sendOtpEmailWithResend = async ({
  email,
  otp,
  role,
  expiresInMinutes = 5,
}) => {
  const resend = getResendClient();

  const from =
    process.env.EMAIL_FROM ||
    "GramConnect <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to: [email],
    subject: "Your GramConnect verification code",
    html: createOtpEmailTemplate({
      otp,
      role,
      expiresInMinutes,
    }),
  });

  if (error) {
    console.error("Resend email failed:", {
      name: error.name,
      message: error.message,
    });

    throw new Error("Unable to send OTP email");
  }

  console.log("OTP email sent successfully via Resend ID:", data?.id);

  return {
    success: true,
    provider: "resend",
    messageId: data?.id,
  };
};

/**
 * Sends OTP email locally using Ethereal test account.
 */
const sendOtpEmailWithEthereal = async ({
  email,
  otp,
  role,
  expiresInMinutes = 5,
}) => {
  if (!etherealTransporter) {
    const testAccount = await nodemailer.createTestAccount();
    etherealTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    etherealTransporter.defaultSender = testAccount.user;
  }

  const from =
    process.env.EMAIL_FROM ||
    `GramConnect <${etherealTransporter.defaultSender}>`;

  const info = await etherealTransporter.sendMail({
    from,
    to: email,
    subject: "Your GramConnect verification code",
    text: `Your GramConnect OTP code is ${otp}. Valid for ${expiresInMinutes} minutes.`,
    html: createOtpEmailTemplate({
      otp,
      role,
      expiresInMinutes,
    }),
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("Ethereal Email Preview URL:", previewUrl);
  }
  console.log("OTP email sent successfully via Ethereal ID:", info.messageId);

  return {
    success: true,
    provider: "ethereal",
    messageId: info.messageId,
    previewUrl,
  };
};

/**
 * Determines which email provider to use based on configuration & environment.
 */
const getEmailProvider = () => {
  if (process.env.EMAIL_PROVIDER) {
    return process.env.EMAIL_PROVIDER.toLowerCase();
  }
  return process.env.NODE_ENV === "production" ? "resend" : "ethereal";
};

/**
 * Public provider-selecting email dispatch function.
 * Supports both object payload `{ email, otp, role, expiresInMinutes }`
 * and positional parameters `(email, otp, role, expiresInMinutes)`.
 */
const sendOtpEmail = async (emailOrPayload, otpCode, role, expiresInMinutes = 5) => {
  let payload;
  if (typeof emailOrPayload === "object" && emailOrPayload !== null) {
    payload = {
      email: emailOrPayload.email,
      otp: emailOrPayload.otp,
      role: emailOrPayload.role,
      expiresInMinutes: emailOrPayload.expiresInMinutes || 5,
    };
  } else {
    payload = {
      email: emailOrPayload,
      otp: otpCode,
      role,
      expiresInMinutes,
    };
  }

  if (!payload.email || !payload.otp) {
    throw new Error("Email address and OTP code are required");
  }

  const provider = getEmailProvider();
  console.log(`Email provider selected: ${provider}`);

  if (provider === "resend") {
    return sendOtpEmailWithResend(payload);
  }

  if (provider === "ethereal") {
    return sendOtpEmailWithEthereal(payload);
  }

  throw new Error(`Unsupported email provider: ${provider}`);
};

module.exports = {
  sendOtpEmail,
  sendOtpEmailWithResend,
  sendOtpEmailWithEthereal,
  createOtpEmailTemplate,
};