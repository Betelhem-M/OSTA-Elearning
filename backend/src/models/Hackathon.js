const pool =
  require("../config/database");

const Hackathon = {
  // =====================================================
  // PUBLIC competitions
  // =====================================================

  async findAll() {
    const [rows] =
      await pool.execute(`
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
        FROM competitions h
        LEFT JOIN hackathon_participants hp
          ON h.id = hp.hackathon_id
        WHERE h.status IN (
          'published',
          'active',
          'upcoming',
          'completed'
        )
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
        ORDER BY
          h.deadline ASC
      `);

    return rows;
  },

  // =====================================================
  // FIND BY ID
  // =====================================================

  async findById(id) {
    const [rows] =
      await pool.execute(
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
        FROM competitions
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    return rows[0] || null;
  },

  // =====================================================
  // CREATE
  // =====================================================

  async create({
    title,
    description,
    category,
    deadline,
    prize,
    status =
      "draft",
    createdBy,
  }) {
    const [result] =
      await pool.execute(
        `
        INSERT INTO competitions
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
          description ||
            null,
          category ||
            null,
          deadline,
          prize || null,
          status,
          createdBy ||
            null,
        ]
      );

    return result.insertId;
  },

  // =====================================================
  // UPDATE
  // =====================================================

  async update(
    id,
    {
      title,
      description,
      category,
      deadline,
      prize,
      status,
    }
  ) {
    const [result] =
      await pool.execute(
        `
        UPDATE competitions
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
          description ||
            null,
          category ||
            null,
          deadline,
          prize || null,
          status,
          id,
        ]
      );

    return (
      result.affectedRows > 0
    );
  },

  // =====================================================
  // DELETE
  // =====================================================

  async delete(id) {
    const [result] =
      await pool.execute(
        `
        DELETE FROM competitions
        WHERE id = ?
        `,
        [id]
      );

    return (
      result.affectedRows > 0
    );
  },
};

module.exports =
  Hackathon;