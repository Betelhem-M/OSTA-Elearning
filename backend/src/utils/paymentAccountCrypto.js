const crypto = require("crypto");

const algorithm = "aes-256-gcm";

function getKey() {
  const secret = process.env.PAYMENT_ACCOUNT_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret) throw new Error("Payment account encryption key is not configured");
  return crypto.createHash("sha256").update(secret).digest();
}

function encrypt(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decrypt(value) {
  const [ivEncoded, tagEncoded, encryptedEncoded] = String(value).split(".");
  if (!ivEncoded || !tagEncoded || !encryptedEncoded) throw new Error("Invalid encrypted payment account");
  const decipher = crypto.createDecipheriv(algorithm, getKey(), Buffer.from(ivEncoded, "base64url"));
  decipher.setAuthTag(Buffer.from(tagEncoded, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedEncoded, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

module.exports = { encrypt, decrypt };
