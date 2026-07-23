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
  const formattedOtp = safeOtp.split("").join(" ");

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GramConnect Verification Code</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F8FAFC; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 16px !important; }
      .content-card { padding: 24px !important; }
      .otp-text { font-size: 32px !important; letter-spacing: 8px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; -webkit-font-smoothing: antialiased;">
  <!-- Main Container Table -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        
        <!-- Max 600px Email Inner Table -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; margin: 0 auto;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <!-- Brand Icon Badge -->
                    <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
                      <tr>
                        <td align="center" style="background-color: #2563EB; border-radius: 12px; width: 44px; height: 44px; text-align: center; color: #FFFFFF; font-size: 20px; font-weight: bold; font-family: sans-serif;">
                          G
                        </td>
                      </tr>
                    </table>
                    <div style="font-size: 22px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; line-height: 1.2;">
                      GramConnect
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: #64748B; letter-spacing: 0.5px; text-transform: uppercase; margin-top: 4px;">
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
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="content-card" style="background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; padding: 40px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);">
                
                <!-- SECURITY BADGE HERO -->
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <table border="0" cellpadding="0" cellspacing="0" style="background-color: #EFF6FF; border-radius: 50px; padding: 6px 16px;">
                      <tr>
                        <td style="font-size: 12px; font-weight: 700; color: #2563EB; font-family: sans-serif;">
                          🛡 Security Verification
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- TITLE -->
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; text-align: center;">
                      Verify Your Email Address
                    </h1>
                  </td>
                </tr>

                <!-- DESCRIPTION -->
                <tr>
                  <td align="center" style="padding-bottom: 28px;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569; text-align: center; max-width: 480px;">
                      Hello,<br />
                      Use the verification code below to securely access your <strong>GramConnect</strong> account as <strong>${safeRole}</strong>.
                    </p>
                  </td>
                </tr>

                <!-- OTP DISPLAY BOX -->
                <tr>
                  <td align="center" style="padding-bottom: 28px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 24px 16px; text-align: center;">
                      <tr>
                        <td align="center" class="otp-text" style="font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #2563EB; font-family: 'Courier New', Courier, monospace; text-align: center; padding-bottom: 8px;">
                          ${formattedOtp}
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-size: 12px; font-weight: 600; color: #64748B; font-family: sans-serif;">
                          ⏱ Valid for ${safeExpiry} minutes
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- SECURITY WARNING CARD -->
                <tr>
                  <td style="padding-bottom: 28px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 12px; padding: 14px 16px;">
                      <tr>
                        <td width="24" valign="top" style="font-size: 14px;">⚠️</td>
                        <td style="font-size: 12px; line-height: 1.5; color: #991B1B; font-weight: 500;">
                          <strong>Never share your verification code with anyone.</strong> GramConnect employees will never ask for your OTP.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- ACTION BUTTON -->
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background-color: #2563EB; border-radius: 50px; padding: 14px 32px;">
                          <a href="https://gramconnect.in" target="_blank" style="font-size: 14px; font-weight: 700; color: #FFFFFF; text-decoration: none; display: inline-block; font-family: sans-serif;">
                            Open GramConnect &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- DIRECT LINK -->
                <tr>
                  <td align="center" style="font-size: 12px; color: #94A3B8; text-align: center;">
                    Or copy this link into your browser: <a href="https://gramconnect.in" target="_blank" style="color: #2563EB; text-decoration: underline;">https://gramconnect.in</a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- FOOTER SECTION -->
          <tr>
            <td align="center" style="padding-top: 32px; padding-bottom: 24px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="text-align: center;">
                <tr>
                  <td align="center" style="font-size: 12px; font-weight: 600; color: #64748B; padding-bottom: 12px;">
                    <a href="mailto:support@gramconnect.in" style="color: #64748B; text-decoration: none; margin: 0 8px;">Support</a> &bull;
                    <a href="https://gramconnect.in" style="color: #64748B; text-decoration: none; margin: 0 8px;">Privacy Policy</a> &bull;
                    <a href="https://gramconnect.in" style="color: #64748B; text-decoration: none; margin: 0 8px;">Terms</a> &bull;
                    <a href="https://gramconnect.in" style="color: #64748B; text-decoration: none; margin: 0 8px;">Contact</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size: 11px; color: #94A3B8; line-height: 1.5;">
                    &copy; 2026 GramConnect Logistics Inc. All Rights Reserved.<br />
                    Digitizing Last-Mile Supply Chains for Rural India.
                  </td>
                </tr>
              </table>
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