const pool = require("../config/database");

const Reply = {
  async findByTopic(topicId) {
    const [rows] = await pool.execute(
      `
      SELECT
        r.id,
        r.topic_id,
        r.user_id,
        r.body,
        r.created_at,
        r.updated_at,
        CONCAT(u.first_name, ' ', u.last_name) AS author
      FROM discussion_replies r
      JOIN users u
        ON r.user_id = u.id
      WHERE r.topic_id = ?
      ORDER BY r.created_at ASC
      `,
      [topicId]
    );

    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        r.id,
        r.topic_id,
        r.user_id,
        r.body,
        r.created_at,
        r.updated_at,
        CONCAT(u.first_name, ' ', u.last_name) AS author
      FROM discussion_replies r
      JOIN users u
        ON r.user_id = u.id
      WHERE r.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  async create({
    topicId,
    userId,
    body,
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO discussion_replies
      (
        topic_id,
        user_id,
        body
      )
      VALUES (?, ?, ?)
      `,
      [
        topicId,
        userId,
        body,
      ]
    );

    return result.insertId;
  },

  async update(id, body) {
    const [result] = await pool.execute(
      `
      UPDATE discussion_replies
      SET body = ?
      WHERE id = ?
      `,
      [
        body,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute(
      `
      DELETE FROM discussion_replies
      WHERE id = ?
      `,
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = Reply;