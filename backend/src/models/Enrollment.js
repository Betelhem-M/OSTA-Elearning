const pool = require("../config/database");

const Enrollment = {
  async findByUser(userId) {
    const [rows] = await pool.execute(
      `
      SELECT
        e.id,
        e.user_id,
        e.course_id,
        e.enrolled_at,
        e.status,
        c.title AS course_title,
        c.description AS course_description,
        c.thumbnail_color,
        c.level,
        CONCAT(u.first_name, ' ', u.last_name) AS instructor_name,
        cat.name AS category_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.instructor_id = u.id
      JOIN categories cat ON c.category_id = cat.id
      WHERE e.user_id = ?
      ORDER BY e.enrolled_at DESC
      `,
      [userId]
    );

    return rows;
  },

  async findByCourse(courseId) {
    const [rows] = await pool.execute(
      `
      SELECT
        e.id,
        e.user_id,
        e.course_id,
        e.enrolled_at,
        e.status,
        u.first_name,
        u.last_name,
        u.email
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      WHERE e.course_id = ?
      ORDER BY e.enrolled_at DESC
      `,
      [courseId]
    );

    return rows;
  },

  async findByUserAndCourse(userId, courseId) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        user_id,
        course_id,
        enrolled_at,
        status
      FROM enrollments
      WHERE user_id = ? AND course_id = ?
      LIMIT 1
      `,
      [userId, courseId]
    );

    return rows[0] || null;
  },

  async create(userId, courseId) {
    const [result] = await pool.execute(
      `
      INSERT INTO enrollments (user_id, course_id)
      VALUES (?, ?)
      `,
      [userId, courseId]
    );

    return result.insertId;
  },

  async updateStatus(id, status) {
    const [result] = await pool.execute(
      `
      UPDATE enrollments
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM enrollments WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = Enrollment;