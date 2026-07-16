const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otp.controller');
const { otpRateLimiter } = require('../middleware/rateLimiter');

// Send OTP with rate limit protection
router.post('/send', otpRateLimiter, otpController.sendOtp);

// Verify OTP
router.post('/verify', otpController.verifyOtp);

module.exports = router;
