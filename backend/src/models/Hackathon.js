const pool = require("../config/database");

const Hackathon = {
  async findAll() {
    const [rows] = await pool.execute(`
      SELECT
        h.id,
        h.title,
        h.description,
        h.category,
        h.deadline,
        h.prize,
        h.status,
        h.created_by,
        h.created_at,
        COUNT(hp.id) AS team_count
      FROM hackathons h
      LEFT JOIN hackathon_participants hp
        ON h.id = hp.hackathon_id
      GROUP BY
        h.id,
        h.title,
        h.description,
        h.category,
        h.deadline,
        h.prize,
        h.status,
        h.created_by,
        h.created_at
      ORDER BY h.deadline ASC
    `);

    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        title,
        description,
        category,
        deadline,
        prize,
        status,
        created_by,
        created_at
      FROM hackathons
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  async create({
    title,
    description,
    category,
    deadline,
    prize,
    status = "draft",
    createdBy,
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO hackathons
      (
        title,
        description,
        category,
        deadline,
        prize,
        status,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description || null,
        category || null,
        deadline,
        prize || null,
        status,
        createdBy || null,
      ]
    );

    return result.insertId;
  },

  async update(id, {
    title,
    description,
    category,
    deadline,
    prize,
    status,
  }) {
    const [result] = await pool.execute(
      `
      UPDATE hackathons
      SET
        title = ?,
        description = ?,
        category = ?,
        deadline = ?,
        prize = ?,
        status = ?
      WHERE id = ?
      `,
      [
        title,
        description || null,
        category || null,
        deadline,
        prize || null,
        status,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM hackathons WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = Hackathon;