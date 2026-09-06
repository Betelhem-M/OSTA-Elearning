const pool = require("../config/database");

const Submission = {
  /**
   * Creates a submission row plus its file rows inside a single
   * transaction, so a submission is never left half-written if a
   * file insert fails partway through.
   *
   * @param {object} params
   * @param {number} params.assignmentId
   * @param {number} params.userId
   * @param {string|null} params.comment
   * @param {"submitted"|"late"} params.status
   * @param {{filePath:string, originalName:string, fileSize:number}[]} params.files
   * @returns {Promise<number>} the new submission id
   */
  async createWithFiles({
    assignmentId,
    userId,
    comment,
    status,
    files,
  }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `
        INSERT INTO submissions
          (assignment_id, user_id, comment, status, submitted_at)
        VALUES (?, ?, ?, ?, NOW())
        `,
        [assignmentId, userId, comment ?? null, status]
      );

      const submissionId = result.insertId;

      for (const file of files) {
        await connection.execute(
          `
          INSERT INTO submission_files
            (submission_id, file_path, stored_name, original_name, file_size)
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            submissionId,
            file.filePath,
            file.filePath, // same generated on-disk filename as file_path — the
                            // column that's actually used to locate the file on
                            // disk (see downloadSubmissionFile). stored_name is
                            // required by the table but nothing else in the app
                            // reads it, so it just needs to be non-null.
            file.originalName,
            file.fileSize,
          ]
        );
      }

      await connection.commit();

      return submissionId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async findLatestByAssignmentAndUser(assignmentId, userId) {
    const [rows] = await pool.execute(
      `
      SELECT id
      FROM submissions
      WHERE assignment_id = ? AND user_id = ?
      ORDER BY submitted_at DESC
      LIMIT 1
      `,
      [assignmentId, userId]
    );

    return rows[0] || null;
  },

  async getFilesBySubmissionId(submissionId) {
    const [rows] = await pool.execute(
      `
      SELECT id, submission_id, file_path, original_name, file_size, created_at
      FROM submission_files
      WHERE submission_id = ?
      ORDER BY id ASC
      `,
      [submissionId]
    );

    return rows;
  },

  async getFileById(fileId) {
    const [rows] = await pool.execute(
      `
      SELECT id, submission_id, file_path, original_name, file_size
      FROM submission_files
      WHERE id = ?
      LIMIT 1
      `,
      [fileId]
    );

    return rows[0] || null;
  },
};

module.exports = Submission;