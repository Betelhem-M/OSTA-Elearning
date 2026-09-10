const pool = require("../config/database");

const InstructorApplication = {
  async findByUserId(userId) {
    const [rows] = await pool.execute(
      `
      SELECT *
      FROM instructor_applications
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    return rows[0] || null;
  },

  async create({
    userId,
    professionalTitle,
    specialization,
    education,
    experience,
    skills,
    teachingStatement,
    cvFilePath,
    cvOriginalName,
    cvMimeType,
    cvFileSize,
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO instructor_applications
      (
        user_id,
        professional_title,
        specialization,
        education,
        experience,
        skills,
        teaching_statement,
        cv_file_path,
        cv_original_name,
        cv_mime_type,
        cv_file_size
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        professionalTitle,
        specialization,
        education,
        experience,
        skills,
        teachingStatement,
        cvFilePath,
        cvOriginalName,
        cvMimeType,
        cvFileSize,
      ]
    );

    return result.insertId;
  },

  async updateRejectedApplication(id, fields) {
    const [result] = await pool.execute(
      `
      UPDATE instructor_applications
      SET
        professional_title = ?,
        specialization = ?,
        education = ?,
        experience = ?,
        skills = ?,
        teaching_statement = ?,
        cv_file_path = ?,
        cv_original_name = ?,
        cv_mime_type = ?,
        cv_file_size = ?,
        status = 'pending',
        admin_note = NULL,
        reviewed_by = NULL,
        reviewed_at = NULL
      WHERE id = ?
        AND status = 'rejected'
      `,
      [
        fields.professionalTitle,
        fields.specialization,
        fields.education,
        fields.experience,
        fields.skills,
        fields.teachingStatement,
        fields.cvFilePath,
        fields.cvOriginalName,
        fields.cvMimeType,
        fields.cvFileSize,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  async listAll(status = "all") {
    const params = [];
    let where = "";

    if (["pending", "approved", "rejected"].includes(status)) {
      where = "WHERE ia.status = ?";
      params.push(status);
    }

    const [rows] = await pool.execute(
      `
      SELECT
        ia.id,
        ia.user_id,
        ia.professional_title,
        ia.specialization,
        ia.education,
        ia.experience,
        ia.skills,
        ia.teaching_statement,
        ia.cv_original_name,
        ia.cv_mime_type,
        ia.cv_file_size,
        ia.status,
        ia.admin_note,
        ia.reviewed_by,
        ia.reviewed_at,
        ia.created_at,
        ia.updated_at,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.region
      FROM instructor_applications ia
      INNER JOIN users u ON u.id = ia.user_id
      ${where}
      ORDER BY
        CASE ia.status
          WHEN 'pending' THEN 1
          WHEN 'approved' THEN 2
          ELSE 3
        END,
        ia.created_at DESC,
        ia.id DESC
      `,
      params
    );

    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        ia.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.region,
        u.role,
        u.account_type
      FROM instructor_applications ia
      INNER JOIN users u ON u.id = ia.user_id
      WHERE ia.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  async review({ id, status, adminNote, reviewedBy }) {
    const [result] = await pool.execute(
      `
      UPDATE instructor_applications
      SET
        status = ?,
        admin_note = ?,
        reviewed_by = ?,
        reviewed_at = NOW()
      WHERE id = ?
        AND status = 'pending'
      `,
      [status, adminNote || null, reviewedBy, id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = InstructorApplication;
