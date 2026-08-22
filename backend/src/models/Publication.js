const pool = require("../config/database");

const Publication = {
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
        CONCAT(u.first_name, ' ', u.last_name) AS researcher_name,
        p.created_at,
        p.updated_at
      FROM publications p
      JOIN researchers r
        ON p.researcher_id = r.id
      JOIN users u
        ON r.user_id = u.id
      ORDER BY p.publication_year DESC, p.created_at DESC
    `);

    return rows;
  },

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
        CONCAT(u.first_name, ' ', u.last_name) AS researcher_name,
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
        created_at,
        updated_at
      FROM publications
      WHERE researcher_id = ?
      ORDER BY publication_year DESC, created_at DESC
      `,
      [researcherId]
    );

    return rows;
  },

  async create({
    researcherId,
    title,
    abstract,
    field,
    publicationYear,
    publicationUrl,
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
        publication_url
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        researcherId,
        title,
        abstract || null,
        field || null,
        publicationYear || null,
        publicationUrl || null,
      ]
    );

    return result.insertId;
  },

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

  async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM publications WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = Publication;