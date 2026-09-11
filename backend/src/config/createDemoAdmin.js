require("dotenv").config();

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("./database");

// The demo/admin account uses a real inbox so admin notifications and
// password recovery can be received. The password itself comes from the
// backend environment and is stored only as a bcrypt hash in MySQL.
const ADMIN_EMAIL = "betelhemmolaw@gmail.com";
const LEGACY_ADMIN_EMAILS = ["osta@gmail.com", "osta@local.com"];
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD;

async function run() {
  if (!ADMIN_PASSWORD) {
    throw new Error("DEMO_ADMIN_PASSWORD must be set in the local backend .env");
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Prefer the new real admin email. If the old demo account exists,
    // migrate that existing account instead of creating a second admin.
    const placeholders = LEGACY_ADMIN_EMAILS.map(() => "?").join(", ");
    const [existing] = await connection.execute(
      `SELECT id FROM users
       WHERE email = ? OR email IN (${placeholders})
       ORDER BY CASE WHEN email = ? THEN 0 ELSE 1 END
       LIMIT 1`,
      [ADMIN_EMAIL, ...LEGACY_ADMIN_EMAILS, ADMIN_EMAIL]
    );

    let userId;

    if (existing.length) {
      userId = existing[0].id;
      await connection.execute(
        `UPDATE users
         SET first_name = ?, last_name = ?, email = ?, phone = ?, region = ?,
             password = ?, role = 'admin', account_type = 'student', status = 'active'
         WHERE id = ?`,
        [
          "OSTA",
          "Administrator",
          ADMIN_EMAIL,
          "",
          "Oromia",
          passwordHash,
          userId,
        ]
      );
    } else {
      const [result] = await connection.execute(
        `INSERT INTO users
         (first_name, last_name, email, phone, region, password, role, account_type, status)
         VALUES (?, ?, ?, ?, ?, ?, 'admin', 'student', 'active')`,
        ["OSTA", "Administrator", ADMIN_EMAIL, "", "Oromia", passwordHash]
      );
      userId = result.insertId;
    }

    // Mark the seeded admin as verified so the normal user email-verification
    // flow never blocks the pre-created administrator account.
    const codeHash = crypto
      .createHash("sha256")
      .update("demo-admin-verified")
      .digest("hex");

    await connection.execute(
      "DELETE FROM email_verification_codes WHERE user_id = ?",
      [userId]
    );

    await connection.execute(
      `INSERT INTO email_verification_codes
       (user_id, code_hash, expires_at, verified_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 YEAR), NOW())`,
      [userId, codeHash]
    );

    await connection.commit();
    console.log(`Demo admin ready: ${ADMIN_EMAIL}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error("Failed to create demo admin:", error);
  process.exit(1);
});
