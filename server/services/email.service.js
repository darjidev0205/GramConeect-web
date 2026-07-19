const nodemailer = require("nodemailer");

let transporterInstance = null;

const getTransporter = async () => {
  if (transporterInstance) return transporterInstance;

  if (process.env.SMTP_HOST) {
    console.log("Using Gmail SMTP");

    transporterInstance = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    transporterInstance.defaultSender = process.env.SMTP_USER;

    try {
      await transporterInstance.verify();
      console.log("✅ SMTP Connected Successfully");
    } catch (error) {
      console.error("❌ SMTP Connection Failed");
      console.error(error);
      throw error;
    }

    return transporterInstance;
  }

  console.log("Using Ethereal Development Mail");

  const testAccount = await nodemailer.createTestAccount();

  transporterInstance = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  transporterInstance.defaultSender = testAccount.user;

  return transporterInstance;
};

const sendOtpEmail = async (to, otp) => {
  try {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `"GramConnect" <${transporter.defaultSender || process.env.SMTP_USER}>`,

      to,

      subject: "GramConnect Verification Code",

      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,

      html: `
      <div style="font-family:Arial;padding:25px">

          <h2>GramConnect</h2>

          <p>Your verification code is</p>

          <h1 style="
              letter-spacing:8px;
              color:#16a34a;
              font-size:36px;
          ">
              ${otp}
          </h1>

          <p>This OTP expires in 5 minutes.</p>

          <p>Please do not share this code with anyone.</p>

      </div>
      `,
    });

    const preview = nodemailer.getTestMessageUrl(info);

    if (preview) {
      console.log("Preview URL:", preview);
    }

    console.log("Email sent:", info.messageId);

    return info;
  } catch (error) {
    console.error("Email Sending Failed");
    console.error(error);

    throw new Error("Unable to send OTP email");
  }
};

module.exports = {
  sendOtpEmail,
};