const pool = require("../config/database");

const User = {
  async findByEmail(email) {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      "SELECT id, first_name, last_name, email, phone, region, role, account_type, profile_image, created_at FROM users WHERE id = ? LIMIT 1",
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
  }) {
    const [result] = await pool.execute(
      `INSERT INTO users
      (first_name, last_name, email, phone, region, password, role, account_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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
};

module.exports = User;