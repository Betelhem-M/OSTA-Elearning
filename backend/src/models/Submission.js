const pool = require("../config/database");

const Submission = {
  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        s.id,
        s.assignment_id,
        s.user_id,
        s.comment,
        s.submitted_at,
        s.score,
        s.instructor_comment,
        s.graded_at,
        s.status,
        a.title AS assignment_title,
        CONCAT(u.first_name, ' ', u.last_name) AS student_name,
        u.email AS student_email
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  async findByAssignment(assignmentId) {
    const [rows] = await pool.execute(
      `
      SELECT
        s.id,
        s.assignment_id,
        s.user_id,
        s.comment,
        s.submitted_at,
        s.score,
        s.instructor_comment,
        s.graded_at,
        s.status,
        CONCAT(u.first_name, ' ', u.last_name) AS student_name,
        u.email AS student_email
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      WHERE s.assignment_id = ?
      ORDER BY s.submitted_at DESC
      `,
      [assignmentId]
    );

    return rows;
  },

  async findByUserAndAssignment(userId, assignmentId) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        assignment_id,
        user_id,
        comment,
        submitted_at,
        score,
        instructor_comment,
        graded_at,
        status
      FROM submissions
      WHERE user_id = ? AND assignment_id = ?
      ORDER BY submitted_at DESC
      LIMIT 1
      `,
      [userId, assignmentId]
    );

    return rows[0] || null;
  },

  async create({
    assignmentId,
    userId,
    comment,
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO submissions
      (
        assignment_id,
        user_id,
        comment
      )
      VALUES (?, ?, ?)
      `,
      [
        assignmentId,
        userId,
        comment || null,
      ]
    );

    return result.insertId;
  },

  async grade(id, {
    score,
    instructorComment,
  }) {
    const [result] = await pool.execute(
      `
      UPDATE submissions
      SET
        score = ?,
        instructor_comment = ?,
        graded_at = CURRENT_TIMESTAMP,
        status = 'graded'
      WHERE id = ?
      `,
      [
        score,
        instructorComment || null,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  async markLate(id) {
    const [result] = await pool.execute(
      `
      UPDATE submissions
      SET status = 'late'
      WHERE id = ?
      `,
      [id]
    );

    return result.affectedRows > 0;
  },

  async addFile({
    submissionId,
    originalName,
    storedName,
    filePath,
    fileSize,
    mimeType,
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO submission_files
      (
        submission_id,
        original_name,
        stored_name,
        file_path,
        file_size,
        mime_type
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        submissionId,
        originalName,
        storedName,
        filePath,
        fileSize || 0,
        mimeType || null,
      ]
    );

    return result.insertId;
  },

  async findFiles(submissionId) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        submission_id,
        original_name,
        stored_name,
        file_path,
        file_size,
        mime_type,
        uploaded_at
      FROM submission_files
      WHERE submission_id = ?
      ORDER BY uploaded_at ASC
      `,
      [submissionId]
    );

    return rows;
  },
};

module.exports = Submission;