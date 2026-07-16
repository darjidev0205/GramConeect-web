const Otp = require('../models/Otp');
const otpService = require('../services/otp.service');
const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');

const sendOtp = async (req, res) => {
  const { target, type } = req.body;

  if (!target || !type || !['email', 'phone'].includes(type)) {
    return res.status(400).json({ message: 'Invalid target or type. Must be email or phone.' });
  }

  try {
    let otpRecord = await Otp.findOne({ target });
    const now = new Date();

    if (otpRecord) {
      // 1. Check maximum resend limit (5)
      if (otpRecord.resendCount >= 5) {
        return res.status(400).json({ 
          message: 'Maximum resend attempts reached (5). Please wait for the code to expire.' 
        });
      }

      // 2. Check 30 seconds cooldown limit
      const timeElapsed = (now.getTime() - otpRecord.createdAt.getTime()) / 1000;
      if (timeElapsed < 30) {
        const secondsLeft = Math.ceil(30 - timeElapsed);
        return res.status(400).json({ 
          message: `Please wait ${secondsLeft} seconds before requesting a new code.` 
        });
      }
    }

    // Generate secure 6-digit OTP
    const rawOtp = otpService.generateOtp();
    const hashedOtp = await otpService.hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (otpRecord) {
      // Update existing record
      otpRecord.hashedOtp = hashedOtp;
      otpRecord.expiresAt = expiresAt;
      otpRecord.attemptCount = 0; // reset attempts
      otpRecord.resendCount += 1;
      otpRecord.createdAt = now; // update request timestamp
      await otpRecord.save();
    } else {
      // Create new record
      otpRecord = new Otp({
        target,
        type,
        hashedOtp,
        expiresAt,
        attemptCount: 0,
        resendCount: 0,
        createdAt: now
      });
      await otpRecord.save();
    }

    // Send OTP using appropriate provider
    let isMock = false;
    if (type === 'email') {
      if (!process.env.SMTP_HOST && !process.env.SENDGRID_API_KEY) {
        isMock = true;
      }
      await emailService.sendOtpEmail(target, rawOtp);
    } else {
      if (!process.env.TWILIO_ACCOUNT_SID) {
        isMock = true;
      }
      await smsService.sendOtpSms(target, rawOtp);
    }

    const responsePayload = { message: 'Verification code sent successfully.' };
    if (isMock) {
      responsePayload.devOtp = rawOtp;
    }

    res.json(responsePayload);
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ message: 'Server Error. Failed to send OTP.' });
  }
};

const verifyOtp = async (req, res) => {
  const { target, otp, role } = req.body;

  if (!target || !otp) {
    return res.status(400).json({ message: 'Target and OTP code are required.' });
  }

  try {
    const otpRecord = await Otp.findOne({ target });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Verification code expired or not found. Please request a new one.' });
    }

    // 1. Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ target });
      return res.status(400).json({ message: 'Verification code has expired (5m limit). Please request a new one.' });
    }

    // 2. Check maximum verification attempts (5)
    if (otpRecord.attemptCount >= 5) {
      await Otp.deleteOne({ target });
      return res.status(400).json({ 
        message: 'Maximum verification attempts exceeded (5). This code is now invalidated.' 
      });
    }

    // Increment attempts
    otpRecord.attemptCount += 1;
    await otpRecord.save();

    // 3. Verify OTP code
    const isValid = await otpService.verifyOtp(otp, otpRecord.hashedOtp);
    if (!isValid) {
      return res.status(400).json({ 
        message: `Invalid verification code. ${5 - otpRecord.attemptCount} attempts remaining.` 
      });
    }

    // OTP Verified! Delete the temporary record immediately
    await Otp.deleteOne({ target });

    // Look up whether a user exists for this email/phone target
    const isEmail = target.includes('@');
    const userQuery = isEmail ? { email: target.toLowerCase() } : { phone: target };
    const User = require('../models/User');
    const user = await User.findOne(userQuery);

    if (user) {
      // Role validation
      if (role && user.role !== role) {
        return res.status(400).json({ message: 'The selected role does not match your registered account.' });
      }

      // User exists -> Generate JWT & Refresh Tokens and return immediately
      const jwtService = require('../services/jwt.service');
      const { accessToken, refreshToken } = jwtService.generateTokens(user);
      
      // Save refresh token to user
      user.refreshToken = refreshToken;
      await user.save();

      return res.json({ 
        verified: true, 
        exists: true, 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          location: user.location,
          vehicle: user.vehicle,
          profileImage: user.profileImage
        }, 
        token: accessToken,
        refreshToken 
      });
    }

    // New user -> Return verified but exists: false
    res.json({ 
      verified: true, 
      exists: false, 
      message: 'OTP verified. Please complete registration.' 
    });

  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ message: 'Server Error during OTP verification.' });
  }
};

module.exports = {
  sendOtp,
  verifyOtp
};
