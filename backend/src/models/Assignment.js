const pool = require("../config/database");

const Assignment = {
  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        a.id,
        a.course_id,
        a.lesson_id,
        a.title,
        a.description,
        a.instructions,
        a.due_date,
        a.points,
        a.allowed_file_types,
        a.max_file_size_mb,
        a.status,
        a.created_at,
        a.updated_at,
        c.title AS course_title,
        l.title AS lesson_title
      FROM assignments a
      JOIN courses c ON a.course_id = c.id
      LEFT JOIN lessons l ON a.lesson_id = l.id
      WHERE a.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  async findByCourse(courseId) {
    const [rows] = await pool.execute(
      `
      SELECT
        a.id,
        a.course_id,
        a.lesson_id,
        a.title,
        a.description,
        a.instructions,
        a.due_date,
        a.points,
        a.allowed_file_types,
        a.max_file_size_mb,
        a.status,
        a.created_at,
        a.updated_at
      FROM assignments a
      WHERE a.course_id = ?
      ORDER BY a.due_date ASC, a.created_at DESC
      `,
      [courseId]
    );

    return rows;
  },

  async create({
    courseId,
    lessonId,
    title,
    description,
    instructions,
    dueDate,
    points,
    allowedFileTypes,
    maxFileSizeMB,
    status = "draft",
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO assignments
      (
        course_id,
        lesson_id,
        title,
        description,
        instructions,
        due_date,
        points,
        allowed_file_types,
        max_file_size_mb,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        courseId,
        lessonId || null,
        title,
        description || null,
        instructions || null,
        dueDate || null,
        points || 100,
        allowedFileTypes || null,
        maxFileSizeMB || 10,
        status,
      ]
    );

    return result.insertId;
  },

  async update(
    id,
    {
      lessonId,
      title,
      description,
      instructions,
      dueDate,
      points,
      allowedFileTypes,
      maxFileSizeMB,
      status,
    }
  ) {
    const [result] = await pool.execute(
      `
      UPDATE assignments
      SET
        lesson_id = ?,
        title = ?,
        description = ?,
        instructions = ?,
        due_date = ?,
        points = ?,
        allowed_file_types = ?,
        max_file_size_mb = ?,
        status = ?
      WHERE id = ?
      `,
      [
        lessonId || null,
        title,
        description || null,
        instructions || null,
        dueDate || null,
        points || 100,
        allowedFileTypes || null,
        maxFileSizeMB || 10,
        status,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM assignments WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  },

  async findRubrics(assignmentId) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        assignment_id,
        criterion,
        points
      FROM assignment_rubrics
      WHERE assignment_id = ?
      ORDER BY id ASC
      `,
      [assignmentId]
    );

    return rows;
  },
};

module.exports = Assignment;