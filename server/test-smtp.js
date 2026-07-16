require('dotenv').config();
const nodemailer = require('nodemailer');

const testSmtp = async () => {
  console.log('--- SMTP TEST START ---');
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_SECURE:', process.env.SMTP_SECURE);
  console.log('SMTP_USER:', process.env.SMTP_USER);
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '********' : 'undefined');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    console.log('\nVerifying transporter connection...');
    await transporter.verify();
    console.log('✅ SMTP Transporter Verified Successfully!');

    console.log('\nSending test email...');
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"GramConnect" <${process.env.SMTP_USER}>`,
      to: 'krishnaprajapati2689@gmail.com',
      subject: 'GramConnect SMTP Test Email',
      text: 'If you receive this, your SMTP connection is fully working! Code: 777999',
      html: '<h1>GramConnect Verification</h1><p>SMTP is working! Code: <b>777999</b></p>'
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email Sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('❌ SMTP Error Captured:');
    console.error(err);
  }
};

testSmtp();
