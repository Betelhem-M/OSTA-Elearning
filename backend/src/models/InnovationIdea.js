const pool =
  require("../config/database");

const InnovationIdea = {
  // =====================================================
  // PUBLIC IDEAS
  // ONLY PUBLISHED IDEAS
  // =====================================================

  async findPublished() {
    const [rows] =
      await pool.execute(`
        SELECT
          i.id,
          i.title,
          i.description,
          i.category,
          i.user_id,
          CONCAT(
            u.first_name,
            ' ',
            u.last_name
          ) AS author,
          i.votes,
          i.status,
          i.created_at,
          i.updated_at
        FROM innovation_ideas i
        JOIN users u
          ON i.user_id = u.id
        WHERE i.status = 'published'
        ORDER BY
          i.created_at DESC
      `);

    return rows;
  },

  // =====================================================
  // FIND PUBLISHED IDEA
  // =====================================================

  async findPublishedById(id) {
    const [rows] =
      await pool.execute(
        `
        SELECT
          i.id,
          i.title,
          i.description,
          i.category,
          i.user_id,
          CONCAT(
            u.first_name,
            ' ',
            u.last_name
          ) AS author,
          i.votes,
          i.status,
          i.created_at,
          i.updated_at
        FROM innovation_ideas i
        JOIN users u
          ON i.user_id = u.id
        WHERE i.id = ?
          AND i.status = 'published'
        LIMIT 1
        `,
        [id]
      );

    return rows[0] || null;
  },

  // =====================================================
  // FIND ANY IDEA
  // INTERNAL
  // =====================================================

  async findById(id) {
    const [rows] =
      await pool.execute(
        `
        SELECT
          i.id,
          i.title,
          i.description,
          i.category,
          i.user_id,
          CONCAT(
            u.first_name,
            ' ',
            u.last_name
          ) AS author,
          i.votes,
          i.status,
          i.created_at,
          i.updated_at
        FROM innovation_ideas i
        JOIN users u
          ON i.user_id = u.id
        WHERE i.id = ?
        LIMIT 1
        `,
        [id]
      );

    return rows[0] || null;
  },

  // =====================================================
  // CREATE
  // NEW IDEAS START AS PENDING
  // =====================================================

  async create({
    title,
    description,
    category,
    userId,
  }) {
    const [result] =
      await pool.execute(
        `
        INSERT INTO innovation_ideas
        (
          title,
          description,
          category,
          user_id,
          status
        )
        VALUES (?, ?, ?, ?, 'pending')
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

  // =====================================================
  // VOTE
  // =====================================================

  async vote(
    ideaId,
    userId
  ) {
    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Make sure only published ideas
      // can receive public votes.
      const [ideaRows] =
        await connection.execute(
          `
          SELECT id
          FROM innovation_ideas
          WHERE id = ?
            AND status = 'published'
          LIMIT 1
          `,
          [ideaId]
        );

      if (
        ideaRows.length === 0
      ) {
        const error =
          new Error(
            "Innovation idea not found or not published."
          );

        error.code =
          "IDEA_NOT_PUBLIC";

        throw error;
      }

      await connection.execute(
        `
        INSERT INTO idea_votes
        (
          idea_id,
          user_id
        )
        VALUES (?, ?)
        `,
        [
          ideaId,
          userId,
        ]
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

module.exports =
  InnovationIdea;