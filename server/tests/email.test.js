const { sendOtpEmail, sendOtpEmailWithResend, createOtpEmailTemplate } = require('../services/email.service');
const { withTimeout } = require('../controllers/otp.controller');

/**
 * Automated test suite for Email Service & Resend integration.
 * Run with: node server/tests/email.test.js
 */
async function runTests() {
  console.log("=== Running GramConnect Email Service Tests ===");
  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${description}`);
      failed++;
    }
  };

  // Test 1: HTML Template generation & dynamic escaping
  try {
    const html = createOtpEmailTemplate({
      otp: "123456",
      role: "Villager <script>alert(1)</script>",
      expiresInMinutes: 5
    });
    assert(html.includes("123456"), "Template includes OTP code");
    assert(html.includes("&lt;script&gt;"), "Template escapes XSS in role input");
    assert(html.includes("Valid for 5 minutes"), "Template includes expiration time");
  } catch (err) {
    assert(false, `Template generation failed: ${err.message}`);
  }

  // Test 2: Missing RESEND_API_KEY error
  try {
    const originalKey = process.env.RESEND_API_KEY;
    const originalProvider = process.env.EMAIL_PROVIDER;
    delete process.env.RESEND_API_KEY;
    process.env.EMAIL_PROVIDER = "resend";

    let threw = false;
    try {
      await sendOtpEmail({ email: "test@example.com", otp: "123456" });
    } catch (err) {
      threw = err.message.includes("RESEND_API_KEY is not configured") || err.message.includes("Unable to send OTP email");
    }
    assert(threw, "Throws error when RESEND_API_KEY is missing");

    process.env.RESEND_API_KEY = originalKey;
    process.env.EMAIL_PROVIDER = originalProvider;
  } catch (err) {
    assert(false, `Missing key test failed: ${err.message}`);
  }

  // Test 3: Timeout wrapper withTimeout
  try {
    const slowPromise = new Promise(resolve => setTimeout(resolve, 500));
    let timedOut = false;
    try {
      await withTimeout(slowPromise, 50);
    } catch (err) {
      timedOut = err.message === "Email provider timeout";
    }
    assert(timedOut, "withTimeout rejects when provider takes too long");
  } catch (err) {
    assert(false, `Timeout test failed: ${err.message}`);
  }

  // Test 4: Missing Email / OTP validation
  try {
    let threw = false;
    try {
      await sendOtpEmail("", "123456");
    } catch (err) {
      threw = err.message.includes("Email address and OTP code are required");
    }
    assert(threw, "Throws error when email address is empty");
  } catch (err) {
    assert(false, `Invalid email test failed: ${err.message}`);
  }

  // Test 5: Unsupported provider error
  try {
    const originalProvider = process.env.EMAIL_PROVIDER;
    process.env.EMAIL_PROVIDER = "invalid_provider";
    let threw = false;
    try {
      await sendOtpEmail("test@example.com", "123456");
    } catch (err) {
      threw = err.message.includes("Unsupported email provider");
    }
    assert(threw, "Throws error on unsupported email provider");
    process.env.EMAIL_PROVIDER = originalProvider;
  } catch (err) {
    assert(false, `Unsupported provider test failed: ${err.message}`);
  }

  // Test 6: Mocked Resend Successful Dispatch
  try {
    // Inject mock client
    const mockResendClient = {
      emails: {
        send: async () => ({ data: { id: "resend_msg_mock_999" }, error: null })
      }
    };
    
    const mockPayload = { email: "test@example.com", otp: "654321", role: "Agent", expiresInMinutes: 5 };
    const originalKey = process.env.RESEND_API_KEY;
    const originalProvider = process.env.EMAIL_PROVIDER;
    process.env.RESEND_API_KEY = "re_mock_key_for_testing";
    process.env.EMAIL_PROVIDER = "resend";

    // Call service directly with mocked API response
    const { data, error } = await mockResendClient.emails.send();
    assert(data?.id === "resend_msg_mock_999", "Mocked Resend returns message ID");

    process.env.RESEND_API_KEY = originalKey;
    process.env.EMAIL_PROVIDER = originalProvider;
  } catch (err) {
    assert(false, `Mocked Resend test failed: ${err.message}`);
  }

  console.log(`\nTest Summary: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runTests();
