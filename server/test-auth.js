require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Otp = require('./models/Otp');

const BASE_URL = 'http://localhost:5000/api';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runTests = async () => {
  console.log('Connecting to MongoDB for testing...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  // Clean up previous test runs
  await User.deleteMany({ email: { $in: ['test_user@example.com', 'test_existing@example.com'] } });
  await Otp.deleteMany({ target: { $in: ['test_user@example.com', 'test_existing@example.com', '9999999999', '9888888888'] } });

  // Create an existing user for testing login
  const existingUser = new User({
    name: 'Existing Villager',
    email: 'test_existing@example.com',
    phone: '9888888888',
    role: 'user',
    termsAccepted: true
  });
  await existingUser.save();

  try {
    // ----------------------------------------------------
    // TEST 1: Request Email OTP
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Request Email OTP ---');
    const sendRes = await fetch(`${BASE_URL}/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'test_user@example.com', type: 'email' })
    });
    const sendData = await sendRes.json();
    console.log('Response Status:', sendRes.status);
    console.log('Response Data:', sendData);
    if (sendRes.status !== 200) throw new Error('Failed to send email OTP');

    // Retrieve OTP from DB to inspect it
    let otpDoc = await Otp.findOne({ target: 'test_user@example.com' });
    if (!otpDoc) throw new Error('OTP not saved in MongoDB');
    console.log('OTP document found in DB. Hashed OTP:', otpDoc.hashedOtp);

    // ----------------------------------------------------
    // TEST 2: Cooldown & Rate Limiting Resend Cooldown
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Cooldown test ---');
    const cooldownRes = await fetch(`${BASE_URL}/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'test_user@example.com', type: 'email' })
    });
    const cooldownData = await cooldownRes.json();
    console.log('Cooldown response status (Expected 400):', cooldownRes.status);
    console.log('Cooldown message:', cooldownData.message);
    if (cooldownRes.status !== 400 || !cooldownData.message.includes('wait')) {
      throw new Error('Resend cooldown not enforced');
    }

    // ----------------------------------------------------
    // TEST 3: Verify OTP with Incorrect Code
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Verification with Incorrect OTP ---');
    const wrongVerifyRes = await fetch(`${BASE_URL}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'test_user@example.com', otp: '111111' })
    });
    const wrongVerifyData = await wrongVerifyRes.json();
    console.log('Incorrect OTP status (Expected 400):', wrongVerifyRes.status);
    console.log('Incorrect OTP message:', wrongVerifyData.message);
    if (wrongVerifyRes.status !== 400 || !wrongVerifyData.message.includes('Invalid')) {
      throw new Error('Invalid OTP code not flagged');
    }

    // Check attemptCount
    otpDoc = await Otp.findOne({ target: 'test_user@example.com' });
    console.log('Verify attemptCount in DB (Expected 1):', otpDoc.attemptCount);
    if (otpDoc.attemptCount !== 1) throw new Error('Attempt count not incremented');

    // ----------------------------------------------------
    // TEST 4: Expired OTP
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Expired OTP Test ---');
    // Set expiresAt to the past
    otpDoc.expiresAt = new Date(Date.now() - 1000);
    await otpDoc.save();

    const expiredRes = await fetch(`${BASE_URL}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'test_user@example.com', otp: '123456' })
    });
    const expiredData = await expiredRes.json();
    console.log('Expired OTP status (Expected 400):', expiredRes.status);
    console.log('Expired OTP message:', expiredData.message);
    if (expiredRes.status !== 400 || !expiredData.message.includes('expired')) {
      throw new Error('Expiry not caught');
    }

    // ----------------------------------------------------
    // TEST 5: New User Registration Flow
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Registering New User ---');
    // Clear out expired one so we can send immediately (avoids database collision)
    await Otp.deleteMany({ target: 'test_user@example.com' });

    await fetch(`${BASE_URL}/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'test_user@example.com', type: 'email' })
    });
    
    // Hash known test code to verify successfully
    const bcrypt = require('bcryptjs');
    const testCode = '123456';
    const testHash = await bcrypt.hash(testCode, 10);
    
    otpDoc = await Otp.findOne({ target: 'test_user@example.com' });
    otpDoc.hashedOtp = testHash;
    otpDoc.expiresAt = new Date(Date.now() + 50000);
    await otpDoc.save();

    // Verify OTP successfully
    const verifyRes = await fetch(`${BASE_URL}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'test_user@example.com', otp: testCode })
    });
    const verifyData = await verifyRes.json();
    console.log('Verify Status (Expected 200):', verifyRes.status);
    console.log('Verify Data exists status (Expected false):', verifyData.exists);
    if (verifyRes.status !== 200 || verifyData.exists !== false) {
      throw new Error('OTP verification or existence check failed');
    }

    // Now submit registration
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Villager',
        email: 'test_user@example.com',
        phone: '9999999999',
        role: 'user',
        location: { address: 'Zone 1 Village', landmark: 'School Entrance' },
        termsAccepted: true
      })
    });
    const registerData = await registerRes.json();
    console.log('Registration Status (Expected 201):', registerRes.status);
    console.log('Registration Response Token received:', !!registerData.token);
    console.log('Registration User name:', registerData.user?.name);
    if (registerRes.status !== 201 || !registerData.token) {
      throw new Error('Registration failed');
    }

    // ----------------------------------------------------
    // TEST 6: Prevent Duplicate Email Registration
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Duplicate Email Registration check ---');
    const duplicateRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Villager',
        email: 'test_user@example.com',
        phone: '9888888888',
        role: 'user',
        termsAccepted: true
      })
    });
    const duplicateData = await duplicateRes.json();
    console.log('Duplicate Status (Expected 400):', duplicateRes.status);
    console.log('Duplicate message:', duplicateData.message);
    if (duplicateRes.status !== 400 || !duplicateData.message.includes('already exists')) {
      throw new Error('Duplicate email allowed');
    }

    // ----------------------------------------------------
    // TEST 7: Existing User Login Flow
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Login Flow for Existing User ---');
    // Request OTP for the existing user (separate email target, avoiding rate limits/cooldowns)
    const loginSendRes = await fetch(`${BASE_URL}/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'test_existing@example.com', type: 'email' })
    });
    console.log('Login Send status:', loginSendRes.status);

    // Update OTP to testCode
    otpDoc = await Otp.findOne({ target: 'test_existing@example.com' });
    otpDoc.hashedOtp = testHash;
    await otpDoc.save();

    // Verify OTP for existing user
    const loginVerifyRes = await fetch(`${BASE_URL}/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'test_existing@example.com', otp: testCode })
    });
    const loginVerifyData = await loginVerifyRes.json();
    console.log('Existing Verify Status (Expected 200):', loginVerifyRes.status);
    console.log('Existing Verify exists status (Expected true):', loginVerifyData.exists);
    console.log('Login Token received:', !!loginVerifyData.token);
    console.log('Login Refresh Token received:', !!loginVerifyData.refreshToken);
    if (loginVerifyRes.status !== 200 || loginVerifyData.exists !== true || !loginVerifyData.token) {
      throw new Error('Existing user login failed');
    }

    // ----------------------------------------------------
    // TEST 8: Token Refresh Flow
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Refresh Token Rotation ---');
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: loginVerifyData.refreshToken })
    });
    const refreshData = await refreshRes.json();
    console.log('Refresh Status (Expected 200):', refreshRes.status);
    console.log('New Access Token received:', !!refreshData.token);
    console.log('New Refresh Token received:', !!refreshData.refreshToken);
    if (refreshRes.status !== 200 || !refreshData.token || !refreshData.refreshToken) {
      throw new Error('Token refresh failed');
    }

    // ----------------------------------------------------
    // TEST 9: Secure Logout Flow
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Secure Logout ---');
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshData.refreshToken })
    });
    console.log('Logout Status (Expected 200):', logoutRes.status);
    if (logoutRes.status !== 200) throw new Error('Logout failed');

    // Verify refresh token is deleted in DB
    const loggedOutUser = await User.findOne({ email: 'test_existing@example.com' });
    console.log('Refresh token in DB after logout (Expected undefined/null):', loggedOutUser.refreshToken);
    if (loggedOutUser.refreshToken) throw new Error('Refresh token not revoked in database');

    console.log('\n====================================');
    console.log('ALL TESTS PASSED SUCCESSFULLY! 🌟');
    console.log('====================================');

  } catch (err) {
    console.error('TESTING FAILED ❌:', err.message);
  } finally {
    await mongoose.connection.close();
  }
};

runTests();
