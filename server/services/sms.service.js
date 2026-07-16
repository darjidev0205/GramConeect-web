const twilio = require("twilio");

let twilioClient = null;

const DEFAULT_COUNTRY_CODE =
  process.env.DEFAULT_COUNTRY_CODE || "+91";

const getTwilioClient = () => {
  if (twilioClient) return twilioClient;

  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
  } = process.env;

  if (
    !TWILIO_ACCOUNT_SID ||
    !TWILIO_AUTH_TOKEN ||
    !TWILIO_PHONE_NUMBER
  ) {
    console.log("Twilio credentials not configured. Using mock SMS.");
    return null;
  }

  try {
    twilioClient = twilio(
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN
    );

    console.log("Twilio initialized.");

    return twilioClient;
  } catch (err) {
    console.error("Failed to initialize Twilio:", err.message);
    return null;
  }
};

const formatPhoneNumber = (phone) => {
  if (!phone) throw new Error("Phone number is required");

  const cleaned = phone.replace(/\s+/g, "");

  if (!/^\+?\d{10,15}$/.test(cleaned)) {
    throw new Error("Invalid phone number");
  }

  return cleaned.startsWith("+")
    ? cleaned
    : `${DEFAULT_COUNTRY_CODE}${cleaned}`;
};

const sendOtpSms = async (phone, otp) => {
  const formattedPhone = formatPhoneNumber(phone);

  const message = `Your GramConnect verification code is: ${otp}. Valid for 5 minutes.`;

  const client = getTwilioClient();

  if (!client) {
    console.log("========== MOCK SMS ==========");
    console.log(`To: ${formattedPhone}`);
    console.log(`OTP: ${otp}`);
    console.log("==============================");

    return {
      success: true,
      provider: "mock",
    };
  }

  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    console.log(`SMS sent to ${formattedPhone}`);

    return {
      success: true,
      provider: "twilio",
      sid: response.sid,
    };
  } catch (err) {
    console.error("Twilio SMS failed:", err.message);
    throw new Error("Unable to send OTP SMS");
  }
};

module.exports = {
  sendOtpSms,
};