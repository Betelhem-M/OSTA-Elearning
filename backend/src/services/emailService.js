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
