require("dotenv").config();

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("./database");

const ADMIN_EMAIL = "osta@local.com";
const ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD;

async function run() {
  if (!ADMIN_PASSWORD) {
    throw new Error("DEMO_ADMIN_PASSWORD must be set in the local backend .env");
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [ADMIN_EMAIL]
    );

    let userId;

    if (existing.length) {
      userId = existing[0].id;
      await connection.execute(
        `UPDATE users
         SET first_name = ?, last_name = ?, phone = ?, region = ?,
             password = ?, role = 'admin', account_type = 'student', status = 'active'
         WHERE id = ?`,
        ["OSTA", "Administrator", "", "Oromia", passwordHash, userId]
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
