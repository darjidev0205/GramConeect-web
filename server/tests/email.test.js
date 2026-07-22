const { sendOtpEmail, sendOtpEmailWithBrevo, createOtpEmailTemplate, getBrevoConfiguration } = require('../services/email.service');
const { withTimeout } = require('../controllers/otp.controller');

/**
 * Mocking helper for global fetch in Node.js runtime
 */
function mockFetch(handler) {
  const originalFetch = global.fetch;
  global.fetch = handler;
  return () => {
    global.fetch = originalFetch;
  };
}

async function runTests() {
  console.log("=== Running GramConnect Brevo Email Service Tests ===");
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
      role: "Villager <script>alert('xss')</script>",
      expiresInMinutes: 5
    });
    assert(html.includes("123456"), "Template includes OTP code");
    assert(html.includes("&lt;script&gt;"), "Template escapes XSS in role input");
    assert(html.includes("Valid for 5 minutes"), "Template includes expiration time");
  } catch (err) {
    assert(false, `Template generation failed: ${err.message}`);
  }

  // Test 2: Missing BREVO_API_KEY error
  try {
    const originalKey = process.env.BREVO_API_KEY;
    const originalSender = process.env.EMAIL_FROM_ADDRESS;
    delete process.env.BREVO_API_KEY;
    process.env.EMAIL_FROM_ADDRESS = "sender@example.com";
    process.env.EMAIL_PROVIDER = "brevo";

    let threw = false;
    try {
      getBrevoConfiguration();
    } catch (err) {
      threw = err.message.includes("BREVO_API_KEY is not configured");
    }
    assert(threw, "Throws error when BREVO_API_KEY is missing");

    process.env.BREVO_API_KEY = originalKey;
    process.env.EMAIL_FROM_ADDRESS = originalSender;
  } catch (err) {
    assert(false, `Missing key test failed: ${err.message}`);
  }

  // Test 3: Missing EMAIL_FROM_ADDRESS error
  try {
    const originalKey = process.env.BREVO_API_KEY;
    const originalSender = process.env.EMAIL_FROM_ADDRESS;
    process.env.BREVO_API_KEY = "mock_key";
    delete process.env.EMAIL_FROM_ADDRESS;

    let threw = false;
    try {
      getBrevoConfiguration();
    } catch (err) {
      threw = err.message.includes("EMAIL_FROM_ADDRESS is not configured");
    }
    assert(threw, "Throws error when EMAIL_FROM_ADDRESS is missing");

    process.env.BREVO_API_KEY = originalKey;
    process.env.EMAIL_FROM_ADDRESS = originalSender;
  } catch (err) {
    assert(false, `Missing sender address test failed: ${err.message}`);
  }

  // Test 4: Successful Mocked Brevo API dispatch
  try {
    process.env.BREVO_API_KEY = "xkeysib-mock-test-key";
    process.env.EMAIL_FROM_ADDRESS = "verified@gramconnect.com";
    process.env.EMAIL_PROVIDER = "brevo";

    const restore = mockFetch(async (url, options) => {
      assert(url === "https://api.brevo.com/v3/smtp/email", "Calls correct Brevo API endpoint URL");
      assert(options.headers["api-key"] === "xkeysib-mock-test-key", "Sends api-key request header");
      assert(options.headers["Content-Type"] === "application/json", "Sends application/json Content-Type");
      
      const body = JSON.parse(options.body);
      assert(body.sender.email === "verified@gramconnect.com", "Payload includes verified sender email");
      assert(body.to[0].email === "recipient@example.com", "Payload includes recipient email");

      return {
        ok: true,
        status: 201,
        json: async () => ({ messageId: "<20240722.mocked_message_id@brevo.com>" })
      };
    });

    const res = await sendOtpEmailWithBrevo({
      email: "recipient@example.com",
      otp: "987654",
      role: "Agent",
      expiresInMinutes: 5
    });

    assert(res.success === true, "Brevo returns success object");
    assert(res.messageId === "<20240722.mocked_message_id@brevo.com>", "Extracts message ID correctly");

    restore();
  } catch (err) {
    assert(false, `Mocked Brevo test failed: ${err.message}`);
  }

  // Test 5: Mocked Brevo API HTTP 400 error handling
  try {
    const restore = mockFetch(async () => ({
      ok: false,
      status: 400,
      json: async () => ({ code: "invalid_parameter", message: "Invalid email format" })
    }));

    let threw = false;
    try {
      await sendOtpEmailWithBrevo({ email: "bad-email", otp: "123456" });
    } catch (err) {
      threw = err.message.includes("Brevo email provider error (HTTP 400)");
    }
    assert(threw, "Handles Brevo HTTP 400 error response cleanly");

    restore();
  } catch (err) {
    assert(false, `Brevo 400 test failed: ${err.message}`);
  }

  // Test 6: Mocked Brevo API HTTP 401 Unauthorized handling
  try {
    const restore = mockFetch(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ code: "unauthorized", message: "Key not recognized" })
    }));

    let threw = false;
    try {
      await sendOtpEmailWithBrevo({ email: "user@example.com", otp: "123456" });
    } catch (err) {
      threw = err.message.includes("Brevo email provider error (HTTP 401)");
    }
    assert(threw, "Handles Brevo HTTP 401 Unauthorized response cleanly");

    restore();
  } catch (err) {
    assert(false, `Brevo 401 test failed: ${err.message}`);
  }

  // Test 7: Timeout handling with AbortController
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

  console.log(`\nBrevo Test Summary: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) process.exit(1);
}

runTests();
