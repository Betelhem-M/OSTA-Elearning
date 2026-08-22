const pool = require("../config/database");

const Researcher = {
  async findAll() {
    const [rows] = await pool.execute(`
      SELECT
        r.id,
        r.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        r.field,
        r.bio,
        r.affiliation,
        COUNT(p.id) AS publication_count,
        r.created_at,
        r.updated_at
      FROM researchers r
      JOIN users u
        ON r.user_id = u.id
      LEFT JOIN publications p
        ON r.id = p.researcher_id
      GROUP BY
        r.id,
        r.user_id,
        u.first_name,
        u.last_name,
        r.field,
        r.bio,
        r.affiliation,
        r.created_at,
        r.updated_at
      ORDER BY name ASC
    `);

    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        r.id,
        r.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        r.field,
        r.bio,
        r.affiliation,
        r.created_at,
        r.updated_at
      FROM researchers r
      JOIN users u
        ON r.user_id = u.id
      WHERE r.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  async findByUserId(userId) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        user_id,
        field,
        bio,
        affiliation,
        created_at,
        updated_at
      FROM researchers
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    return rows[0] || null;
  },

  async create({
    userId,
    field,
    bio,
    affiliation,
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO researchers
      (
        user_id,
        field,
        bio,
        affiliation
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        userId,
        field || null,
        bio || null,
        affiliation || null,
      ]
    );

    return result.insertId;
  },

  async update(
    userId,
    {
      field,
      bio,
      affiliation,
    }
  ) {
    const [result] = await pool.execute(
      `
      UPDATE researchers
      SET
        field = ?,
        bio = ?,
        affiliation = ?
      WHERE user_id = ?
      `,
      [
        field || null,
        bio || null,
        affiliation || null,
        userId,
      ]
    );

    return result.affectedRows > 0;
  },
};

module.exports = Researcher;