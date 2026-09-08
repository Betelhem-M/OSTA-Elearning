const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const AuthToken = require("../models/AuthToken");
const {
  sendVerificationCode,
  sendPasswordResetCode,
} = require("./emailService");

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

function normalizeAccountType(value) {
  value = String(value || "")
    .trim()
    .toLowerCase();

  if (value === "innovator") {
    return "entrepreneur";
  }

  return ["entrepreneur", "researcher", "instructor", "student"].includes(value)
    ? value
    : "student";
}

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      account_type: user.account_type || "student",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
}

function generateCode() {
  return String(crypto.randomInt(100000, 1000000));
}

// Local-development verification code.
// Set DEV_EMAIL_VERIFICATION_BYPASS=true in the local backend .env
// to allow the demo verification flow without requiring SMTP.
function isLocalVerificationBypassEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    String(process.env.DEV_EMAIL_VERIFICATION_BYPASS || "").toLowerCase() ===
      "true"
  );
}

const authService = {
  async register({
    firstName,
    lastName,
    email,
    phone,
    region,
    password,
    accountType,
  }) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalized = normalizeAccountType(accountType);

    const existingUser = await User.findByEmail(normalizedEmail);

    if (existingUser) {
      const alreadyVerified = await AuthToken.isVerified(existingUser.id);

      if (!alreadyVerified) {
        const verificationCode = isLocalVerificationBypassEnabled()
          ? "123456"
          : generateCode();

        await AuthToken.createVerification(
          existingUser.id,
          verificationCode
        );

        if (!isLocalVerificationBypassEnabled()) {
          await sendVerificationCode(
            existingUser.email,
            verificationCode
          );
        }

        throw new Error(
          isLocalVerificationBypassEnabled()
            ? "This email is already registered but not verified. Please complete email verification to continue."
            : "This email is already registered but not verified. A new verification code has been sent."
        );
      }

      throw new Error("Email is already registered");
    }

    const hashed = await bcrypt.hash(password, 12);

    const role = normalized === "instructor" ? "instructor" : "student";

    const id = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      region: region.trim(),
      password: hashed,
      role,
      accountType: normalized,
    });

    const user = await User.findById(id);

    /*
     * Email verification
     */
    const verificationCode = isLocalVerificationBypassEnabled()
      ? "123456"
      : generateCode();

    await AuthToken.createVerification(
      id,
      verificationCode
    );

    if (!isLocalVerificationBypassEnabled()) {
      await sendVerificationCode(
        normalizedEmail,
        verificationCode
      );
    }

    user.account_type = normalizeAccountType(user.account_type);

    delete user.password;

    /*
     * IMPORTANT:
     * Do not create or return a JWT before email verification.
     */
    return {
      user,
      message: isLocalVerificationBypassEnabled()
        ? "Registration successful. Please verify your email to continue."
        : "Registration successful. A verification code has been sent to your email.",
    };
  },

  async login(email, password) {
    const user = await User.findByEmail(
      email.trim().toLowerCase()
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.status && user.status !== "active") {
      throw new Error("Your account is not active.");
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      throw new Error("Invalid email or password");
    }

    /*
     * Require email verification before login.
     */
    const verified = await AuthToken.isVerified(user.id);

    if (!verified) {
      throw new Error(
        "Please verify your email before signing in."
      );
    }

    user.account_type = normalizeAccountType(
      user.account_type
    );

    delete user.password;

    return {
      user,
      token: createToken(user),
    };
  },

  async verifyEmail(email, codeValue) {
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    const verificationCode = String(codeValue || "").trim();

    if (!normalizedEmail || !verificationCode) {
      throw new Error("Email and verification code are required");
    }

    const user = await User.findByEmail(normalizedEmail);

    if (!user) {
      throw new Error("Invalid verification request");
    }

    const codeToVerify =
      isLocalVerificationBypassEnabled() && verificationCode === "123456"
        ? "123456"
        : verificationCode;

    const verified = await AuthToken.verifyEmail(
      user.id,
      codeToVerify
    );

    if (!verified) {
      throw new Error(
        "Invalid or expired verification code"
      );
    }

    return {
      message: "Email verified successfully. You can now sign in.",
    };
  },

  async resendVerification(email) {
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      throw new Error("Email is required");
    }

    const user = await User.findByEmail(normalizedEmail);

    if (!user) {
      throw new Error("No account found with that email");
    }

    const verified = await AuthToken.isVerified(user.id);

    if (verified) {
      throw new Error("This email is already verified.");
    }

    const verificationCode = isLocalVerificationBypassEnabled()
      ? "123456"
      : generateCode();

    await AuthToken.createVerification(
      user.id,
      verificationCode
    );

    if (!isLocalVerificationBypassEnabled()) {
      await sendVerificationCode(
        user.email,
        verificationCode
      );
    }

    return {
      message: isLocalVerificationBypassEnabled()
        ? "A new verification code has been generated. Please enter it to continue."
        : "A new verification code has been sent.",
    };
  },

  async requestReset(email) {
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    const user = await User.findByEmail(normalizedEmail);

    if (user) {
      const resetCode = generateCode();
      const token = crypto.randomBytes(32).toString("hex");

      await AuthToken.createReset(
        user.id,
        resetCode,
        token
      );

      await sendPasswordResetCode(
        user.email,
        resetCode
      );

      return {
        resetToken: token,
      };
    }

    return {};
  },

  async verifyResetCode(email, codeValue) {
    const normalizedEmail = email.trim().toLowerCase();

    const row = await AuthToken.verifyResetCode(
      normalizedEmail,
      codeValue
    );

    if (!row) {
      throw new Error("Invalid or expired reset code");
    }

    const token = crypto.randomBytes(32).toString("hex");

    const current = await AuthToken.verifyResetCode(
      normalizedEmail,
      codeValue
    );

    if (!current) {
      throw new Error("Invalid or expired reset code");
    }

    const pool = require("../config/database");

    await pool.execute(
      `
      UPDATE password_reset_tokens
      SET token_hash = ?
      WHERE id = ?
      `,
      [
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex"),
        current.id,
      ]
    );

    return {
      resetToken: token,
    };
  },

  async resetPassword(token, newPassword) {
    const row = await AuthToken.consumeReset(token);

    if (!row) {
      throw new Error("Invalid or expired reset token");
    }

    const hashed = await bcrypt.hash(
      newPassword,
      12
    );

    await User.updatePassword(
      row.user_id,
      hashed
    );

    return {
      message: "Password reset successfully",
    };
  },
};

module.exports = authService;
