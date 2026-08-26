const pool = require("../config/database");

const User = {
  // =====================================================
  // FIND USER BY EMAIL
  // =====================================================

  async findByEmail(email) {
    const [rows] =
      await pool.execute(
        `
        SELECT *
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email]
      );

    return rows[0] || null;
  },

  // =====================================================
  // FIND USER BY ID
  // =====================================================

  async findById(id) {
    const [rows] =
      await pool.execute(
        `
        SELECT
          id,
          first_name,
          last_name,
          email,
          phone,
          region,
          role,
          account_type,
          profile_image,
          created_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    return rows[0] || null;
  },

  // =====================================================
  // CREATE USER
  // =====================================================

  async create({
    firstName,
    lastName,
    email,
    phone,
    region,
    password,
    role = "student",
    accountType = "student",
  }) {
    const [result] =
      await pool.execute(
        `
        INSERT INTO users
        (
          first_name,
          last_name,
          email,
          phone,
          region,
          password,
          role,
          account_type
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
        ]
      );

    return result.insertId;
  },

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  async updateProfile(
    id,
    {
      firstName,
      lastName,
      email,
      phone,
      region,
    }
  ) {
    const [result] =
      await pool.execute(
        `
        UPDATE users
        SET
          first_name = ?,
          last_name = ?,
          email = ?,
          phone = ?,
          region = ?
        WHERE id = ?
        `,
        [
          firstName,
          lastName,
          email,
          phone,
          region,
          id,
        ]
      );

    return result.affectedRows > 0;
  },

  // =====================================================
  // UPDATE PROFILE IMAGE
  // =====================================================

  async updateProfileImage(
    id,
    profileImage
  ) {
    const [result] =
      await pool.execute(
        `
        UPDATE users
        SET profile_image = ?
        WHERE id = ?
        `,
        [
          profileImage,
          id,
        ]
      );

    return result.affectedRows > 0;
  },

  // =====================================================
  // REMOVE PROFILE IMAGE
  // =====================================================

  async removeProfileImage(id) {
    const [result] =
      await pool.execute(
        `
        UPDATE users
        SET profile_image = NULL
        WHERE id = ?
        `,
        [id]
      );

    return result.affectedRows > 0;
  },

  // =====================================================
  // UPDATE PASSWORD
  // =====================================================

  async updatePassword(
    id,
    hashedPassword
  ) {
    const [result] =
      await pool.execute(
        `
        UPDATE users
        SET password = ?
        WHERE id = ?
        `,
        [
          hashedPassword,
          id,
        ]
      );

    return result.affectedRows > 0;
  },
};

module.exports = User;