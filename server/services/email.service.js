const nodemailer = require("nodemailer");

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
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
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>GramConnect Verification Code</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F8FAFC; color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 12px !important; }
      .content-card { padding: 24px 18px !important; }
      .otp-code { font-size: 28px !important; letter-spacing: 4px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; -webkit-font-smoothing: antialiased;">
  <!-- MAIN WRAPPER TABLE -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 32px 12px;">
        
        <!-- EMAIL CONTAINER (Max 600px) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; margin: 0 auto;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table border="0" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  <td align="center">
                    <!-- Brand Icon Badge -->
                    <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 10px;">
                      <tr>
                        <td align="center" style="background-color: #0B1120; border-radius: 12px; width: 44px; height: 44px; text-align: center; color: #18C7E8; font-size: 22px; font-weight: 800; font-family: Arial, sans-serif; border: 1px solid #18C7E8;">
                          G
                        </td>
                      </tr>
                    </table>
                    <div style="font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.4px; line-height: 1.2; font-family: Arial, sans-serif;">
                      GramConnect
                    </div>
                    <div style="font-size: 11px; font-weight: 700; color: #18C7E8; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 4px; font-family: Arial, sans-serif;">
                      Connecting Every Village
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CONTENT CARD -->
          <tr>
            <td>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="content-card" style="background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; padding: 36px 32px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);">
                
                <!-- TITLE -->
                <tr>
                  <td style="padding-bottom: 16px;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px; font-family: Arial, sans-serif;">
                      Verify your email
                    </h1>
                  </td>
                </tr>

                <!-- GREETING & INTRO -->
                <tr>
                  <td style="padding-bottom: 24px; font-size: 14px; line-height: 1.6; color: #334155; font-family: Arial, sans-serif;">
                    <p style="margin: 0 0 12px 0;">Hello,</p>
                    <p style="margin: 0;">We received a request to verify your GramConnect account as <strong>${safeRole}</strong>.</p>
                  </td>
                </tr>

                <!-- CODE LABEL -->
                <tr>
                  <td style="padding-bottom: 10px; font-size: 13px; font-weight: 700; color: #475569; font-family: Arial, sans-serif;">
                    Your verification code is:
                  </td>
                </tr>

                <!-- OTP DISPLAY BOX (Guaranteed Single Horizontal Line across Mobile & Desktop) -->
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0B1120; border-radius: 14px; border: 1px solid #1E293B; text-align: center;">
                      <tr>
                        <td align="center" style="padding: 24px 16px;">
                          <div class="otp-code" style="font-size: 34px; font-weight: 800; color: #18C7E8; font-family: 'Courier New', Courier, monospace, sans-serif; letter-spacing: 6px; white-space: nowrap; word-break: keep-all; display: inline-block; text-align: center;">
                            ${safeOtp}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- EXPIRATION & SECURITY NOTICE -->
                <tr>
                  <td style="padding-bottom: 24px; font-size: 13px; line-height: 1.6; color: #475569; font-family: Arial, sans-serif;">
                    <p style="margin: 0 0 8px 0; font-weight: 600; color: #0F172A;">
                      This code will expire in ${safeExpiry} minutes. (Valid for ${safeExpiry} minutes)
                    </p>
                    <p style="margin: 0; color: #64748B; font-size: 12px;">
                      For your security, never share this code with anyone. GramConnect will never ask you for your OTP.
                    </p>
                  </td>
                </tr>

                <!-- DIVIDER -->
                <tr>
                  <td style="padding-bottom: 24px;">
                    <div style="border-bottom: 1px solid #E2E8F0; width: 100%;"></div>
                  </td>
                </tr>

                <!-- IGNORE NOTICE & SIGN-OFF -->
                <tr>
                  <td style="font-size: 13px; line-height: 1.6; color: #64748B; font-family: Arial, sans-serif;">
                    <p style="margin: 0 0 16px 0;">
                      If you didn't request this verification, you can safely ignore this email.
                    </p>
                    <p style="margin: 0; font-weight: 700; color: #0F172A;">
                      Thanks,<br />
                      GramConnect Team
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding-top: 24px; padding-bottom: 16px;">
              <div style="font-size: 12px; font-weight: 700; color: #64748B; font-family: Arial, sans-serif;">
                GramConnect &bull; Connecting Every Village
              </div>
              <div style="font-size: 11px; color: #94A3B8; margin-top: 6px; font-family: Arial, sans-serif;">
                &copy; 2026 GramConnect Logistics Inc. All Rights Reserved.
              </div>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Validates Brevo environment configuration.
 */
const getBrevoConfiguration = () => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderName = process.env.EMAIL_FROM_NAME || "GramConnect";
  const senderEmail = process.env.EMAIL_FROM_ADDRESS;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  if (!senderEmail) {
    throw new Error("EMAIL_FROM_ADDRESS is not configured");
  }

  return {
    apiKey,
    senderName,
    senderEmail,
  };
};

/**
 * Sends OTP email using Brevo Transactional Email HTTPS API.
 */
const sendOtpEmailWithBrevo = async ({
  email,
  otp,
  role,
  expiresInMinutes = 5,
}) => {
  const { apiKey, senderName, senderEmail } = getBrevoConfiguration();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.signal.aborted || controller.abort(), 15000);

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [
      {
        email,
      },
    ],
    subject: "Your GramConnect verification code",
    htmlContent: createOtpEmailTemplate({
      otp,
      role,
      expiresInMinutes,
    }),
  };

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error("Brevo OTP email failed", {
        status: response.status,
        providerCode: errorBody?.code,
        providerMessage: errorBody?.message,
        recipientDomain: email.split("@")[1] || "unknown",
      });
      throw new Error(`Brevo email provider error (HTTP ${response.status})`);
    }

    const data = await response.json();
    const messageId = data?.messageId;

    console.log("OTP email sent successfully via Brevo Message ID:", messageId);

    return {
      success: true,
      provider: "brevo",
      messageId,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError" || controller.signal.aborted) {
      console.error("Brevo OTP email failed: Request timeout (15s exceeded)");
      throw new Error("Email provider timeout");
    }
    throw err;
  }
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

  const fromName = process.env.EMAIL_FROM_NAME || "GramConnect";
  const from = `${fromName} <${etherealTransporter.defaultSender}>`;

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
  return process.env.NODE_ENV === "production" ? "brevo" : "ethereal";
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

  if (provider === "brevo") {
    return sendOtpEmailWithBrevo(payload);
  }

  if (provider === "ethereal") {
    return sendOtpEmailWithEthereal(payload);
  }

  throw new Error(`Unsupported email provider: ${provider}`);
};

module.exports = {
  sendOtpEmail,
  sendOtpEmailWithBrevo,
  sendOtpEmailWithEthereal,
  createOtpEmailTemplate,
  getBrevoConfiguration,
};