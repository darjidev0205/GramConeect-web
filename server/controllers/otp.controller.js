const Otp = require('../models/Otp');
const otpService = require('../services/otp.service');
const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');

/**
 * Executes a promise with a specified maximum timeout.
 * Rejects if the promise does not resolve within timeoutMs.
 */
const withTimeout = (promise, timeoutMs = 15000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Email provider timeout")),
        timeoutMs
      )
    ),
  ]);

const sendOtp = async (req, res) => {
  const { target, type, role } = req.body;

  if (!target || !type || !['email', 'phone'].includes(type)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid target or type. Must be email or phone.' 
    });
  }

  try {
    let otpRecord = await Otp.findOne({ target });
    const now = new Date();

    if (otpRecord) {
      // 1. Check maximum resend limit (5)
      if (otpRecord.resendCount >= 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Maximum resend attempts reached (5). Please wait for the code to expire.' 
        });
      }

      // 2. Check 30 seconds cooldown limit
      const timeElapsed = (now.getTime() - otpRecord.createdAt.getTime()) / 1000;
      if (timeElapsed < 30) {
        const secondsLeft = Math.ceil(30 - timeElapsed);
        return res.status(429).json({ 
          success: false, 
          message: `Please wait ${secondsLeft} seconds before requesting a new code.` 
        });
      }
    }

    // Generate secure 6-digit OTP
    const rawOtp = otpService.generateOtp();
    const hashedOtp = await otpService.hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (otpRecord) {
      otpRecord.hashedOtp = hashedOtp;
      otpRecord.expiresAt = expiresAt;
      otpRecord.attemptCount = 0; // reset attempts
      otpRecord.resendCount += 1;
      otpRecord.createdAt = now;
      await otpRecord.save();
    } else {
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

    let isMock = false;
    if (type === 'email') {
      try {
        await withTimeout(
          emailService.sendOtpEmail({
            email: target,
            otp: rawOtp,
            role: role || 'User',
            expiresInMinutes: 5
          }),
          15000
        );
      } catch (emailErr) {
        console.error("OTP email provider dispatch failed:", emailErr.message);
        
        // Invalidate/delete the stored OTP record on dispatch failure
        // so the user is not locked into an un-sent OTP state or false cooldown
        await Otp.deleteOne({ target });

        return res.status(503).json({
          success: false,
          message: "Verification email could not be sent. Please try again shortly."
        });
      }
    } else {
      if (!process.env.TWILIO_ACCOUNT_SID) {
        isMock = true;
      }
      try {
        await withTimeout(
          smsService.sendOtpSms(target, rawOtp),
          15000
        );
      } catch (smsErr) {
        console.error("OTP SMS provider dispatch failed:", smsErr.message);
        
        await Otp.deleteOne({ target });

        return res.status(503).json({
          success: false,
          message: "Verification SMS could not be sent. Please try again shortly."
        });
      }
    }

    const responsePayload = { 
      success: true, 
      message: 'Verification code sent successfully.' 
    };
    
    // In dev mode without real provider setup, return devOtp for convenience
    if (isMock || process.env.NODE_ENV !== 'production') {
      const provider = process.env.EMAIL_PROVIDER || (process.env.NODE_ENV === 'production' ? 'resend' : 'ethereal');
      if (provider === 'ethereal' || isMock) {
        responsePayload.devOtp = rawOtp;
      }
    }

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error('Error sending OTP:', err.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server Error. Failed to send OTP.' 
    });
  }
};

const verifyOtp = async (req, res) => {
  const { target, otp, role } = req.body;

  if (!target || !otp) {
    return res.status(400).json({ 
      success: false, 
      message: 'Target and OTP code are required.' 
    });
  }

  try {
    const otpRecord = await Otp.findOne({ target });
    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code expired or not found. Please request a new one.' 
      });
    }

    // 1. Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ target });
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code has expired (5m limit). Please request a new one.' 
      });
    }

    // 2. Check maximum verification attempts (5)
    if (otpRecord.attemptCount >= 5) {
      await Otp.deleteOne({ target });
      return res.status(400).json({ 
        success: false, 
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
        success: false, 
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
        return res.status(400).json({ 
          success: false, 
          message: 'The selected role does not match your registered account.' 
        });
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
    return res.json({ 
      verified: true, 
      exists: false, 
      message: 'OTP verified. Please complete registration.' 
    });

  } catch (err) {
    console.error('Error verifying OTP:', err.message);
    return res.status(500).json({ 
      success: false, 
      message: 'Server Error during OTP verification.' 
    });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  withTimeout,
};
