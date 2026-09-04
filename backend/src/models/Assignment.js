const pool = require("../config/database");

const Assignment = {
  async create({
    courseId,
    lessonId,
    title,
    description,
    instructions,
    dueDate,
    points,
    allowedFileTypes,
    maxFileSizeMb,
    status,
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO assignments
        (course_id, lesson_id, title, description, instructions,
         due_date, points, allowed_file_types, max_file_size_mb, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        courseId,
        lessonId ?? null,
        title,
        description ?? null,
        instructions ?? null,
        dueDate ?? null,
        points ?? 100,
        allowedFileTypes ?? null,
        maxFileSizeMb ?? 10,
        status ?? "draft",
      ]
    );

    return result.insertId;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM assignments WHERE id = ? LIMIT 1`,
      [id]
    );

    return rows[0] || null;
  },

  async findByCourse(courseId, { publishedOnly = false } = {}) {
    const query = publishedOnly
      ? `SELECT * FROM assignments
         WHERE course_id = ? AND status = 'published'
         ORDER BY due_date IS NULL, due_date ASC, id DESC`
      : `SELECT * FROM assignments
         WHERE course_id = ?
         ORDER BY created_at DESC`;

    const [rows] = await pool.execute(query, [courseId]);

    return rows;
  },
};

module.exports = Assignment;