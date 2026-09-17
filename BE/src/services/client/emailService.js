const nodemailer = require("nodemailer");

const createTransport = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    MAIL_FROM,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_FROM) {
    const err = new Error(
      "Missing SMTP configuration. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM in .env"
    );
    err.statusCode = 500;
    throw err;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: false, // Gmail SMTP dùng STARTTLS
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      // tránh lỗi certificate trong dev
      rejectUnauthorized: false,
    },
  });
};

const sendVerificationEmail = async ({ toEmail, code }) => {
  const transport = createTransport();

  const mail = {
    from: process.env.MAIL_FROM,
    to: toEmail,
    subject: "Verify your email address",
    text: `Your verification code is: ${code}. It will expire in a few minutes.`,
    html: `
      <div style="background-color: #f5f5f7; padding: 48px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; color: #1d1d1f;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 18px; padding: 40px; text-align: left; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);">
          <!-- Logo/Brand -->
          <div style="font-size: 21px; font-weight: 600; color: #0066cc; margin-bottom: 32px; letter-spacing: -0.2px;">
           TECH STORE
          </div>
          
          <!-- Title -->
          <h1 style="font-size: 24px; font-weight: 600; line-height: 1.25; color: #1d1d1f; margin: 0 0 16px 0; letter-spacing: -0.5px;">
            Verify your email address
          </h1>
          
          <!-- Description -->
          <p style="font-size: 15px; line-height: 1.5; color: #333333; margin: 0 0 24px 0;">
            To finish signing up for your TECH STORE account, please use the following one-time verification code. This code will expire in a few minutes.
          </p>
          
          <!-- Code block container -->
          <div style="background-color: #f5f5f7; border-radius: 11px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: 600; color: #7a7a7a; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
              Verification Code
            </div>
            <div style="font-size: 36px; font-weight: 700; color: #0066cc; letter-spacing: 4px; font-family: 'SF Pro Display', -apple-system, sans-serif;">
              ${code}
            </div>
          </div>
          
          <!-- Divider -->
          <div style="border-top: 1px solid #f0f0f0; margin: 24px 0;"></div>
          
          <!-- Security Note -->
          <p style="font-size: 13px; line-height: 1.4; color: #7a7a7a; margin: 0;">
            If you did not request this email, please ignore it. Your account security is important to us.
          </p>
        </div>
        
        <!-- Footer fine print -->
        <div style="max-width: 480px; margin: 24px auto 0 auto; text-align: center; font-size: 11px; color: #7a7a7a; line-height: 1.4; padding: 0 20px;">
          This is an automated message. Please do not reply directly to this email.<br>
          © 2026 PJ26. All rights reserved.
        </div>
      </div>
    `,
  };

  await transport.sendMail(mail);
};

module.exports = {
  sendVerificationEmail,
};

