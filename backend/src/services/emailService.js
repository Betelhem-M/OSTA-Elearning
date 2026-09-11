let brevoConfigured = false;

function getBrevoConfig() {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error("BREVO_API_KEY must be configured");
  }

  const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.EMAIL_FROM;
  const fromName = process.env.BREVO_FROM_NAME || "OSTA E-Learning";

  if (!fromEmail) {
    throw new Error("BREVO_FROM_EMAIL must be configured");
  }

  return {
    apiKey,
    sender: {
      name: fromName,
      email: fromEmail,
    },
  };
}

async function sendEmail({ to, subject, html, text }) {
  // Local/demo mode: skip external email delivery.
  if (process.env.NODE_ENV !== "production") {
    console.log(`Demo mode: email skipped for ${to}`);
    return { demoMode: true };
  }

  const { apiKey, sender } = getBrevoConfig();

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: html,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        data?.message ||
        data?.code ||
        `Brevo request failed with status ${response.status}`;
      throw new Error(message);
    }

    brevoConfigured = true;

    console.log("Email sent successfully through Brevo:", {
      messageId: data.messageId,
      to,
    });

    return data;
  } catch (error) {
    console.error("Email sending failed through Brevo:", {
      message: error.message,
      to,
    });
    throw error;
  }
}

async function sendVerificationCode(to, code) {
  const frontendUrl = (
    process.env.FRONTEND_URL || "https://osta-elearning-platform.vercel.app"
  ).replace(/\/$/, "");
  const verificationUrl = `${frontendUrl}/verify-email?email=${encodeURIComponent(to)}`;

  return sendEmail({
    to,
    subject: "Verify your OSTA E-Learning account",
    text: [
      `Your OSTA verification code is ${code}. It expires in 15 minutes.`,
      "",
      `Open the OSTA verification page: ${verificationUrl}`,
      "",
      "Enter the 6-digit code from this email to verify your account.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #172033;">
        <h2 style="margin-bottom: 8px;">Verify your OSTA E-Learning account</h2>
        <p>Thank you for registering with OSTA E-Learning.</p>
        <p>Your verification code is:</p>
        <p style="font-size: 30px; font-weight: 700; letter-spacing: 8px; margin: 18px 0;">${code}</p>
        <p>This code expires in <strong>15 minutes</strong>.</p>
        <p style="margin: 28px 0;">
          <a href="${verificationUrl}" style="display: inline-block; padding: 12px 22px; background: #0a2540; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700;">
            Verify your email
          </a>
        </p>
        <p style="font-size: 13px; color: #64748b;">The button opens the OSTA verification page. Enter the 6-digit code shown above.</p>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 28px;">If you did not create an OSTA account, you can ignore this email.</p>
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
