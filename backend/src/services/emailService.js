let resendConfigured = false;

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY must be configured");
  }

  const from = process.env.RESEND_FROM || process.env.EMAIL_FROM || "OSTA E-Learning <onboarding@resend.dev>";

  return { apiKey, from };
}

async function sendEmail({ to, subject, html, text }) {
  // Local/demo mode: skip external email delivery.
  if (process.env.NODE_ENV !== "production") {
    console.log(`Demo mode: email skipped for ${to}`);
    return { demoMode: true };
  }

  const { apiKey, from } = getResendConfig();

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        html,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || data?.error || `Resend request failed with status ${response.status}`;
      throw new Error(message);
    }

    resendConfigured = true;

    console.log("Email sent successfully through Resend:", {
      id: data.id,
      to,
    });

    return data;
  } catch (error) {
    console.error("Email sending failed through Resend:", {
      message: error.message,
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
