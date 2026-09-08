const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",

    // Gmail's secure SMTP connection.
    // Nodemailer configures Gmail's SMTP host/port automatically.
    secure: true,

    port: 465,

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },

    // Fail reasonably quickly instead of leaving
    // Forgot Password stuck for a long time.
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return transporter;
}

async function sendEmail({
  to,
  subject,
  html,
  text,
}) {
  if (!process.env.SMTP_USER) {
    throw new Error("SMTP_USER must be configured");
  }

  if (!process.env.SMTP_PASS) {
    throw new Error("SMTP_PASS must be configured");
  }

  try {
    const result = await getTransporter().sendMail({
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER,

      to,
      subject,
      text,
      html,
    });

    console.log("Email sent successfully:", {
      messageId: result.messageId,
      accepted: result.accepted,
      rejected: result.rejected,
    });

    return result;
  } catch (error) {
    console.error("Email sending failed:", {
      message: error.message,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
    });

    throw error;
  }
}

async function sendVerificationCode(to, code) {
  return sendEmail({
    to,

    subject: "Verify your OSTA E-Learning account",

    text: `Your OSTA verification code is ${code}. It expires in 15 minutes.`,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verify your OSTA E-Learning account</h2>

        <p>Your verification code is:</p>

        <div
          style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 20px 0;
          "
        >
          ${code}
        </div>

        <p>This code expires in 15 minutes.</p>

        <p>
          If you did not create an OSTA E-Learning account,
          you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

async function sendPasswordResetCode(to, code) {
  return sendEmail({
    to,

    subject: "OSTA E-Learning password reset code",

    text: `Your OSTA password reset code is ${code}. It expires in 15 minutes.`,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset your OSTA E-Learning password</h2>

        <p>Your password reset code is:</p>

        <div
          style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 20px 0;
          "
        >
          ${code}
        </div>

        <p>This code expires in 15 minutes.</p>

        <p>
          If you did not request a password reset,
          you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

module.exports = {
  sendEmail,
  sendVerificationCode,
  sendPasswordResetCode,
};