const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;

/**
 * Generate a cryptographically secure numeric OTP
 */
const generateOtp = () => {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;

  const otp = crypto.randomInt(min, max + 1).toString();

  return otp;
};

/**
 * Hash OTP
 */
const hashOtp = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

/**
 * Verify OTP
 */
const verifyOtp = async (otp, hashedOtp) => {
  if (!otp || !hashedOtp) return false;

  // Only allow exactly 6 digits
  if (!/^\d{6}$/.test(otp)) return false;

  return await bcrypt.compare(otp, hashedOtp);
};

/**
 * Returns expiry date (5 minutes from now)
 */
const getOtpExpiry = () => {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};

module.exports = {
  generateOtp,
  hashOtp,
  verifyOtp,
  getOtpExpiry,
  OTP_LENGTH,
  OTP_EXPIRY_MINUTES,
};