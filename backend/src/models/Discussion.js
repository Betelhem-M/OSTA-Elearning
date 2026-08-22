const pool = require("../config/database");

const Discussion = {
  async findAll() {
    const [rows] = await pool.execute(`
      SELECT
        d.id,
        d.user_id,
        d.title,
        d.category,
        d.body,
        d.created_at,
        d.updated_at,
        CONCAT(u.first_name, ' ', u.last_name) AS author,
        COUNT(r.id) AS replies
      FROM discussion_topics d
      JOIN users u
        ON d.user_id = u.id
      LEFT JOIN discussion_replies r
        ON d.id = r.topic_id
      GROUP BY
        d.id,
        d.user_id,
        d.title,
        d.category,
        d.body,
        d.created_at,
        d.updated_at,
        u.first_name,
        u.last_name
      ORDER BY d.created_at DESC
    `);

    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        d.id,
        d.user_id,
        d.title,
        d.category,
        d.body,
        d.created_at,
        d.updated_at,
        CONCAT(u.first_name, ' ', u.last_name) AS author
      FROM discussion_topics d
      JOIN users u
        ON d.user_id = u.id
      WHERE d.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  async create({
    userId,
    title,
    category,
    body,
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO discussion_topics
      (
        user_id,
        title,
        category,
        body
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        userId,
        title,
        category,
        body,
      ]
    );

    return result.insertId;
  },

  async update(
    id,
    {
      title,
      category,
      body,
    }
  ) {
    const [result] = await pool.execute(
      `
      UPDATE discussion_topics
      SET
        title = ?,
        category = ?,
        body = ?
      WHERE id = ?
      `,
      [
        title,
        category,
        body,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute(
      `
      DELETE FROM discussion_topics
      WHERE id = ?
      `,
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = Discussion;