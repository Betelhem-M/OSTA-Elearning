const pool = require("../config/database");

const Publication = {
  // =====================================================
  // PUBLIC PUBLISHED PUBLICATIONS
  // =====================================================

  async findPublished() {
    const [rows] = await pool.execute(`
      SELECT
        p.id,
        p.researcher_id,
        p.title,
        p.abstract,
        p.field,
        p.publication_year,
        p.publication_url,
        p.status,
        CONCAT(
          u.first_name,
          ' ',
          u.last_name
        ) AS researcher_name,
        p.created_at,
        p.updated_at
      FROM publications p
      JOIN researchers r
        ON p.researcher_id = r.id
      JOIN users u
        ON r.user_id = u.id
      WHERE p.status = 'published'
      ORDER BY
        p.publication_year DESC,
        p.created_at DESC
    `);

    return rows;
  },

  // =====================================================
  // PUBLICATION BY ID
  // =====================================================

  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        p.id,
        p.researcher_id,
        p.title,
        p.abstract,
        p.field,
        p.publication_year,
        p.publication_url,
        p.status,
        CONCAT(
          u.first_name,
          ' ',
          u.last_name
        ) AS researcher_name,
        p.created_at,
        p.updated_at
      FROM publications p
      JOIN researchers r
        ON p.researcher_id = r.id
      JOIN users u
        ON r.user_id = u.id
      WHERE p.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  // =====================================================
  // RESEARCHER'S OWN PUBLICATIONS
  // =====================================================

  async findByResearcher(researcherId) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        researcher_id,
        title,
        abstract,
        field,
        publication_year,
        publication_url,
        status,
        created_at,
        updated_at
      FROM publications
      WHERE researcher_id = ?
      ORDER BY
        created_at DESC
      `,
      [researcherId]
    );

    return rows;
  },

  // =====================================================
  // ALL PUBLICATIONS
  // ADMIN
  // =====================================================

  async findAll() {
    const [rows] = await pool.execute(`
      SELECT
        p.id,
        p.researcher_id,
        p.title,
        p.abstract,
        p.field,
        p.publication_year,
        p.publication_url,
        p.status,
        CONCAT(
          u.first_name,
          ' ',
          u.last_name
        ) AS researcher_name,
        p.created_at,
        p.updated_at
      FROM publications p
      JOIN researchers r
        ON p.researcher_id = r.id
      JOIN users u
        ON r.user_id = u.id
      ORDER BY
        p.created_at DESC
    `);

    return rows;
  },

  // =====================================================
  // CREATE
  // =====================================================

  async create({
    researcherId,
    title,
    abstract,
    field,
    publicationYear,
    publicationUrl,
    status = "pending",
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO publications
      (
        researcher_id,
        title,
        abstract,
        field,
        publication_year,
        publication_url,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        researcherId,
        title,
        abstract || null,
        field || null,
        publicationYear || null,
        publicationUrl || null,
        status,
      ]
    );

    return result.insertId;
  },

  // =====================================================
  // UPDATE PUBLICATION CONTENT
  // =====================================================

  async update(
    id,
    {
      title,
      abstract,
      field,
      publicationYear,
      publicationUrl,
    }
  ) {
    const [result] = await pool.execute(
      `
      UPDATE publications
      SET
        title = ?,
        abstract = ?,
        field = ?,
        publication_year = ?,
        publication_url = ?
      WHERE id = ?
      `,
      [
        title,
        abstract || null,
        field || null,
        publicationYear || null,
        publicationUrl || null,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  // =====================================================
  // CHANGE STATUS
  // =====================================================

  async updateStatus(id, status) {
    const [result] = await pool.execute(
      `
      UPDATE publications
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

    return result.affectedRows > 0;
  },

  // =====================================================
  // DELETE
  // =====================================================

  async delete(id) {
    const [result] = await pool.execute(
      `
      DELETE FROM publications
      WHERE id = ?
      `,
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = Publication;