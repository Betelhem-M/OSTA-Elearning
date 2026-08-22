const pool = require("../config/database");

const InnovationIdea = {
  async findAll() {
    const [rows] = await pool.execute(`
      SELECT
        i.id,
        i.title,
        i.description,
        i.category,
        i.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS author,
        i.votes,
        i.status,
        i.created_at,
        i.updated_at
      FROM innovation_ideas i
      JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC
    `);

    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        i.id,
        i.title,
        i.description,
        i.category,
        i.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS author,
        i.votes,
        i.status,
        i.created_at,
        i.updated_at
      FROM innovation_ideas i
      JOIN users u ON i.user_id = u.id
      WHERE i.id = ?
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
    userId,
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO innovation_ideas
      (title, description, category, user_id)
      VALUES (?, ?, ?, ?)
      `,
      [
        title,
        description || null,
        category || null,
        userId,
      ]
    );

    return result.insertId;
  },

  async vote(ideaId, userId) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute(
        `
        INSERT INTO idea_votes (idea_id, user_id)
        VALUES (?, ?)
        `,
        [ideaId, userId]
      );

      await connection.execute(
        `
        UPDATE innovation_ideas
        SET votes = votes + 1
        WHERE id = ?
        `,
        [ideaId]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = InnovationIdea;