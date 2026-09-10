const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  // Gmail SMTP on Railway: use port 587 + STARTTLS.
  // Do not use service: "gmail" here because Nodemailer’s Gmail preset
  // selects port 465 and secure TLS, which can cause ENETUNREACH on Railway.
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  // Local/demo mode: skip SMTP completely.
  if (process.env.NODE_ENV !== "production") {
    console.log(`Demo mode: email skipped for ${to}`);
    return { demoMode: true };
  }

  if (!process.env.SMTP_USER) throw new Error("SMTP_USER must be configured");
  if (!process.env.SMTP_PASS) throw new Error("SMTP_PASS must be configured");

  try {
    const result = await getTransporter().sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
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
        <p>Your OSTA verification code is <strong>${code}</strong>.</p>
        <p>This code expires in 15 minutes.</p>
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
        <p>Your password reset code is <strong>${code}</strong>.</p>
        <p>This code expires in 15 minutes.</p>
      </div>
    `,
  });
}

module.exports = {
  sendEmail,
  sendVerificationCode,
  sendPasswordResetCode,
};
