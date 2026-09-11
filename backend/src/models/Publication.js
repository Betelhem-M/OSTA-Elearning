const pool = require("../config/database");

const Publication = {
  async findPublished() {
    const [rows] = await pool.execute(`
      SELECT
        p.id,
        p.researcher_id,
        p.title,
        p.abstract,
        p.content,
        p.field,
        p.publication_year,
        p.publication_url,
        p.file_name,
        p.file_mime_type,
        p.file_size,
        p.status,
        CONCAT(u.first_name, ' ', u.last_name) AS researcher_name,
        p.created_at,
        p.updated_at
      FROM publications p
      JOIN researchers r ON p.researcher_id = r.id
      JOIN users u ON r.user_id = u.id
      WHERE p.status = 'published'
      ORDER BY p.publication_year DESC, p.created_at DESC
    `);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(`
      SELECT
        p.id,
        p.researcher_id,
        p.title,
        p.abstract,
        p.content,
        p.field,
        p.publication_year,
        p.publication_url,
        p.file_name,
        p.file_mime_type,
        p.file_size,
        p.status,
        CONCAT(u.first_name, ' ', u.last_name) AS researcher_name,
        p.created_at,
        p.updated_at
      FROM publications p
      JOIN researchers r ON p.researcher_id = r.id
      JOIN users u ON r.user_id = u.id
      WHERE p.id = ?
      LIMIT 1
    `, [id]);
    return rows[0] || null;
  },

  async findByResearcher(researcherId) {
    const [rows] = await pool.execute(`
      SELECT
        id,
        researcher_id,
        title,
        abstract,
        content,
        field,
        publication_year,
        publication_url,
        file_name,
        file_mime_type,
        file_size,
        status,
        created_at,
        updated_at
      FROM publications
      WHERE researcher_id = ?
      ORDER BY created_at DESC
    `, [researcherId]);
    return rows;
  },

  async findAll() {
    const [rows] = await pool.execute(`
      SELECT
        p.id,
        p.researcher_id,
        p.title,
        p.abstract,
        p.content,
        p.field,
        p.publication_year,
        p.publication_url,
        p.file_name,
        p.file_mime_type,
        p.file_size,
        p.status,
        CONCAT(u.first_name, ' ', u.last_name) AS researcher_name,
        p.created_at,
        p.updated_at
      FROM publications p
      JOIN researchers r ON p.researcher_id = r.id
      JOIN users u ON r.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    return rows;
  },

  async create({
    researcherId,
    title,
    abstract,
    content,
    field,
    publicationYear,
    publicationUrl,
    fileName,
    fileMimeType,
    fileSize,
    fileData,
    status = "draft",
  }) {
    const [result] = await pool.execute(`
      INSERT INTO publications
      (
        researcher_id, title, abstract, content, field,
        publication_year, publication_url, file_name,
        file_mime_type, file_size, file_data, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      researcherId,
      title,
      abstract || null,
      content || null,
      field || null,
      publicationYear || null,
      publicationUrl || null,
      fileName || null,
      fileMimeType || null,
      fileSize || null,
      fileData || null,
      status,
    ]);
    return result.insertId;
  },

  async update(id, {
    title,
    abstract,
    content,
    field,
    publicationYear,
    publicationUrl,
    fileName,
    fileMimeType,
    fileSize,
    fileData,
  }) {
    const [result] = await pool.execute(`
      UPDATE publications
      SET
        title = ?,
        abstract = ?,
        content = ?,
        field = ?,
        publication_year = ?,
        publication_url = ?,
        file_name = COALESCE(?, file_name),
        file_mime_type = COALESCE(?, file_mime_type),
        file_size = COALESCE(?, file_size),
        file_data = COALESCE(?, file_data)
      WHERE id = ?
    `, [
      title,
      abstract || null,
      content || null,
      field || null,
      publicationYear || null,
      publicationUrl || null,
      fileName || null,
      fileMimeType || null,
      fileSize || null,
      fileData || null,
      id,
    ]);
    return result.affectedRows > 0;
  },

  async updateStatus(id, status) {
    const [result] = await pool.execute(
      "UPDATE publications SET status = ? WHERE id = ?",
      [status, id]
    );
    return result.affectedRows > 0;
  },

  async getFile(id) {
    const [rows] = await pool.execute(`
      SELECT file_data, file_name, file_mime_type, file_size, status
      FROM publications
      WHERE id = ?
      LIMIT 1
    `, [id]);
    return rows[0] || null;
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
