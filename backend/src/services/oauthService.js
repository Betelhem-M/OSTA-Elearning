const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const AuthToken = require("../models/AuthToken");
const pool = require("../config/database");

const FRONTEND_URL = process.env.FRONTEND_URL || "https://osta-elearning-platform.vercel.app";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function base64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function createState(provider) {
  const payload = base64Url(JSON.stringify({
    provider,
    nonce: crypto.randomBytes(18).toString("hex"),
    issuedAt: Date.now(),
  }));
  const signature = crypto
    .createHmac("sha256", required("JWT_SECRET"))
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

function verifyState(state, provider) {
  try {
    const [payload, signature] = String(state || "").split(".");
    if (!payload || !signature) return false;

    const expected = crypto
      .createHmac("sha256", required("JWT_SECRET"))
      .update(payload)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.provider === provider && Date.now() - Number(data.issuedAt) < 10 * 60 * 1000;
  } catch (_) {
    return false;
  }
}

function getRedirectUri(provider) {
  const envName = provider === "google" ? "GOOGLE_REDIRECT_URI" : "GITHUB_REDIRECT_URI";
  return process.env[envName] || `${process.env.BACKEND_URL || "https://osta-elearning-backend-production.up.railway.app"}/api/auth/${provider}/callback`;
}

function getAuthorizationUrl(provider) {
  const state = createState(provider);
  const redirectUri = getRedirectUri(provider);

  if (provider === "google") {
    const params = new URLSearchParams({
      client_id: required("GOOGLE_CLIENT_ID"),
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "online",
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  const params = new URLSearchParams({
    client_id: required("GITHUB_CLIENT_ID"),
    redirect_uri: redirectUri,
    scope: "read:user user:email",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

async function exchangeGoogleCode(code) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: required("GOOGLE_CLIENT_ID"),
      client_secret: required("GOOGLE_CLIENT_SECRET"),
      redirect_uri: getRedirectUri("google"),
      grant_type: "authorization_code",
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error(data.error_description || "Google authorization failed.");

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const profile = await profileResponse.json();
  if (!profileResponse.ok || !profile.email) throw new Error("Google did not provide a verified email address.");
  if (profile.email_verified === false) throw new Error("Your Google email is not verified.");

  return {
    provider: "google",
    providerId: profile.sub,
    email: profile.email,
    firstName: profile.given_name || profile.name?.split(" ")[0] || "Google",
    lastName: profile.family_name || profile.name?.split(" ").slice(1).join(" ") || "User",
  };
}

async function exchangeGithubCode(code) {
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: required("GITHUB_CLIENT_ID"),
      client_secret: required("GITHUB_CLIENT_SECRET"),
      code,
      redirect_uri: getRedirectUri("github"),
    }),
  });
  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok || !tokenData.access_token) throw new Error(tokenData.error_description || "GitHub authorization failed.");

  const profileResponse = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenData.access_token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const profile = await profileResponse.json();
  if (!profileResponse.ok) throw new Error("Unable to read your GitHub profile.");

  const emailResponse = await fetch("https://api.github.com/user/emails", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${tokenData.access_token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const emails = await emailResponse.json();
  if (!emailResponse.ok) throw new Error("Unable to read your GitHub email.");

  const verifiedEmail = Array.isArray(emails)
    ? emails.find((item) => item.primary && item.verified)?.email || emails.find((item) => item.verified)?.email
    : null;

  if (!verifiedEmail) throw new Error("Please verify an email address on GitHub before signing in to OSTA.");

  const nameParts = String(profile.name || profile.login || "GitHub User").trim().split(/\s+/);
  return {
    provider: "github",
    providerId: String(profile.id),
    email: verifiedEmail,
    firstName: nameParts[0] || "GitHub",
    lastName: nameParts.slice(1).join(" ") || "User",
  };
}

async function markEmailVerified(userId) {
  await AuthToken.createVerification(userId, crypto.randomInt(100000, 1000000).toString());
  await pool.execute(
    `UPDATE email_verification_codes SET verified_at = NOW() WHERE user_id = ?`,
    [userId]
  );
}

function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, account_type: user.account_type || "student" },
    required("JWT_SECRET"),
    { expiresIn: JWT_EXPIRES_IN }
  );
}

async function findOrCreateUser(profile) {
  const normalizedEmail = profile.email.trim().toLowerCase();
  let user = await User.findByEmail(normalizedEmail);

  if (user) {
    if (user.status !== "active") throw new Error("Your OSTA account is not active.");
    if (user.account_type === "instructor" && user.role !== "instructor") {
      throw new Error("Your instructor account has not been approved yet.");
    }
    await markEmailVerified(user.id);
  } else {
    const password = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 12);
    const userId = await User.create({
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      email: normalizedEmail,
      phone: "",
      region: "",
      password,
      role: "student",
      accountType: "student",
      status: "active",
    });
    await markEmailVerified(userId);
    user = await User.findById(userId);
  }

  user.account_type = user.account_type || "student";
  delete user.password;
  return { user, token: createToken(user) };
}

async function authenticate(provider, code, state) {
  if (!verifyState(state, provider)) throw new Error("Invalid or expired OAuth request. Please try again.");
  if (!code) throw new Error("OAuth authorization code is missing.");

  const profile = provider === "google"
    ? await exchangeGoogleCode(code)
    : await exchangeGithubCode(code);

  return findOrCreateUser(profile);
}

module.exports = {
  getAuthorizationUrl,
  authenticate,
  FRONTEND_URL,
};
