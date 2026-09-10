const pool = require("../config/database");

const User = {
  async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT * FROM users WHERE email = ? LIMIT 1`,
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT id, first_name, last_name, email, phone, region,
             role, account_type, profile_image, status, created_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );
    return rows[0] || null;
  },

  async create({
    firstName,
    lastName,
    email,
    phone,
    region,
    password,
    role = "student",
    accountType = "student",
    status = "active",
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO users
      (first_name, last_name, email, phone, region, password, role, account_type, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        firstName,
        lastName,
        email,
        phone,
        region,
        password,
        role,
        accountType,
        status,
      ]
    );
    return result.insertId;
  },

  async updateProfile(id, { firstName, lastName, email, phone, region }) {
    const [result] = await pool.execute(
      `
      UPDATE users
      SET first_name = ?, last_name = ?, email = ?, phone = ?, region = ?
      WHERE id = ?
      `,
      [firstName, lastName, email, phone, region, id]
    );
    return result.affectedRows > 0;
  },

  async updateProfileImage(id, profileImage) {
    const [result] = await pool.execute(
      `UPDATE users SET profile_image = ? WHERE id = ?`,
      [profileImage, id]
    );
    return result.affectedRows > 0;
  },

  async removeProfileImage(id) {
    const [result] = await pool.execute(
      `UPDATE users SET profile_image = NULL WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },

  async updatePassword(id, hashedPassword) {
    const [result] = await pool.execute(
      `UPDATE users SET password = ? WHERE id = ?`,
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = User;
