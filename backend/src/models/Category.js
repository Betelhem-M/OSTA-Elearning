const pool = require("../config/database");

const Category = {
  async findAll() {
    const [rows] = await pool.execute(
      "SELECT * FROM categories ORDER BY name ASC"
    );

    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      "SELECT * FROM categories WHERE id = ? LIMIT 1",
      [id]
    );

    return rows[0] || null;
  },

  async create({ name, description }) {
    const [result] = await pool.execute(
      `INSERT INTO categories (name, description)
       VALUES (?, ?)`,
      [name, description || null]
    );

    return result.insertId;
  },

  async update(id, { name, description }) {
    const [result] = await pool.execute(
      `UPDATE categories
       SET name = ?, description = ?
       WHERE id = ?`,
      [name, description || null, id]
    );

    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM categories WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = Category;