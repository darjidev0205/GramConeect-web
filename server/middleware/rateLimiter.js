const rateLimitLogs = {};

/**
 * Basic in-memory rate limiter to prevent brute force on OTP requests.
 * Allows up to 3 OTP generation requests per target (email or phone) per minute.
 */
const otpRateLimiter = (req, res, next) => {
  const target = req.body.target;
  if (!target) {
    return res.status(400).json({ message: 'Target destination (email or phone) is required' });
  }

  const now = Date.now();
  const logs = rateLimitLogs[target] || [];
  
  // Filter out requests older than 1 minute (60,000 ms)
  const recentLogs = logs.filter(timestamp => now - timestamp < 60000);
  
  if (recentLogs.length >= 3) {
    return res.status(429).json({ 
      message: 'Too many OTP requests. Please wait 1 minute before requesting another code.' 
    });
  }

  recentLogs.push(now);
  rateLimitLogs[target] = recentLogs;
  next();
};

module.exports = {
  otpRateLimiter
};
