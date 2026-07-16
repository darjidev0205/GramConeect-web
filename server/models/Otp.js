const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  target: { type: String, required: true, unique: true },
  type: { type: String, enum: ['email', 'phone'], required: true },
  hashedOtp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  attemptCount: { type: Number, default: 0 },
  resendCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Otp', otpSchema);
