const pool = require("../config/database");

const Startup = {
  async findAll() {
    const [rows] = await pool.execute(`
      SELECT
        s.id,
        s.name,
        s.description,
        s.founder_id,
        CONCAT(u.first_name, ' ', u.last_name) AS founder,
        s.category,
        s.stage,
        s.website,
        s.created_at,
        s.updated_at
      FROM startups s
      JOIN users u ON s.founder_id = u.id
      ORDER BY s.created_at DESC
    `);

    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        s.id,
        s.name,
        s.description,
        s.founder_id,
        CONCAT(u.first_name, ' ', u.last_name) AS founder,
        s.category,
        s.stage,
        s.website,
        s.created_at,
        s.updated_at
      FROM startups s
      JOIN users u ON s.founder_id = u.id
      WHERE s.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  async create({
    name,
    description,
    founderId,
    category,
    stage,
    website,
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO startups
      (
        name,
        description,
        founder_id,
        category,
        stage,
        website
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        description || null,
        founderId,
        category || null,
        stage || "Idea",
        website || null,
      ]
    );

    return result.insertId;
  },

  async update(id, {
    name,
    description,
    category,
    stage,
    website,
  }) {
    const [result] = await pool.execute(
      `
      UPDATE startups
      SET
        name = ?,
        description = ?,
        category = ?,
        stage = ?,
        website = ?
      WHERE id = ?
      `,
      [
        name,
        description || null,
        category || null,
        stage,
        website || null,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM startups WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = Startup;