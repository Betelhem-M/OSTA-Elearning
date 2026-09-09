const pool = require("../config/database");
const { encrypt, decrypt } = require("../utils/paymentAccountCrypto");

const ALLOWED_METHODS = new Set(["telebirr", "cbe"]);

function normalize(input) {
  const method = String(input.method || "").trim().toLowerCase();
  const accountName = String(input.accountName || "").trim().replace(/\s+/g, " ");
  const accountNumber = String(input.accountNumber || "").trim();

  if (!ALLOWED_METHODS.has(method)) throw new Error("Only Telebirr and CBE accounts are supported");
  if (!/^[A-Za-z][A-Za-z .'-]{1,99}$/.test(accountName)) throw new Error("Enter a valid account holder name");
  if (!/^[0-9+()\- ]{6,40}$/.test(accountNumber)) throw new Error("Enter a valid account number");

  return { method, accountName, accountNumber };
}

const InstructorPaymentAccount = {
  normalize,

  async upsert(userId, input) {
    const account = normalize(input);
    // Local development/demo accounts are immediately visible so the complete
    // instructor -> student payment flow can be demonstrated without an admin.
    // Production keeps the existing verification requirement.
    const verified = process.env.NODE_ENV !== "production";

    await pool.execute(
      `INSERT INTO instructor_payment_accounts
        (user_id, method, account_name, account_number_encrypted, status, is_verified)
       VALUES (?, ?, ?, ?, 'active', ?)
       ON DUPLICATE KEY UPDATE
         account_name = VALUES(account_name),
         account_number_encrypted = VALUES(account_number_encrypted),
         status = 'active',
         is_verified = VALUES(is_verified),
         updated_at = CURRENT_TIMESTAMP`,
      [userId, account.method, account.accountName, encrypt(account.accountNumber), verified]
    );
    return account.method;
  },

  async findByUser(userId) {
    const [rows] = await pool.execute(
      `SELECT id, method, account_name, account_number_encrypted, status, is_verified, created_at, updated_at
       FROM instructor_payment_accounts WHERE user_id = ? ORDER BY method`,
      [userId]
    );
    return rows.map((row) => ({
      id: row.id,
      method: row.method,
      accountName: row.account_name,
      accountNumber: decrypt(row.account_number_encrypted),
      status: row.status,
      isVerified: Boolean(row.is_verified),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async findVerifiedForCourse(courseId, method) {
    const [rows] = await pool.execute(
      `SELECT ipa.id, ipa.method, ipa.account_name, ipa.account_number_encrypted,
              u.id AS instructor_id, u.first_name, u.last_name
       FROM instructor_payment_accounts ipa
       JOIN courses c ON c.instructor_id = ipa.user_id
       JOIN users u ON u.id = ipa.user_id
       WHERE c.id = ? AND ipa.method = ? AND ipa.status = 'active' AND ipa.is_verified = TRUE
       LIMIT 1`,
      [courseId, method]
    );
    if (!rows[0]) return null;
    return {
      id: rows[0].id,
      method: rows[0].method,
      accountName: rows[0].account_name,
      accountNumber: decrypt(rows[0].account_number_encrypted),
      instructorId: rows[0].instructor_id,
      instructorName: `${rows[0].first_name} ${rows[0].last_name}`,
    };
  },

  async verifyById(id) {
    const [result] = await pool.execute(
      `UPDATE instructor_payment_accounts
       SET is_verified = TRUE, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND status = 'active'`,
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = InstructorPaymentAccount;
