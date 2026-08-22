const pool = require("../config/database");

const LessonProgress = {
  async findByUser(userId) {
    const [rows] = await pool.execute(
      `
      SELECT
        lp.id,
        lp.user_id,
        lp.lesson_id,
        lp.completed,
        lp.progress_percent,
        lp.last_position_seconds,
        lp.completed_at,
        lp.updated_at,
        l.title AS lesson_title,
        s.title AS section_title,
        s.course_id
      FROM lesson_progress lp
      JOIN lessons l ON lp.lesson_id = l.id
      JOIN course_sections s ON l.section_id = s.id
      WHERE lp.user_id = ?
      ORDER BY lp.updated_at DESC
      `,
      [userId]
    );

    return rows;
  },

  async findByUserAndLesson(userId, lessonId) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        user_id,
        lesson_id,
        completed,
        progress_percent,
        last_position_seconds,
        completed_at,
        updated_at
      FROM lesson_progress
      WHERE user_id = ? AND lesson_id = ?
      LIMIT 1
      `,
      [userId, lessonId]
    );

    return rows[0] || null;
  },

  async createOrUpdate(
    userId,
    lessonId,
    progressPercent,
    lastPositionSeconds,
    completed
  ) {
    const completedAt = completed ? new Date() : null;

    const [result] = await pool.execute(
      `
      INSERT INTO lesson_progress
      (
        user_id,
        lesson_id,
        completed,
        progress_percent,
        last_position_seconds,
        completed_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        completed = VALUES(completed),
        progress_percent = VALUES(progress_percent),
        last_position_seconds = VALUES(last_position_seconds),
        completed_at = VALUES(completed_at)
      `,
      [
        userId,
        lessonId,
        completed,
        progressPercent,
        lastPositionSeconds,
        completedAt,
      ]
    );

    return result;
  },

  async markCompleted(userId, lessonId) {
    const [result] = await pool.execute(
      `
      INSERT INTO lesson_progress
      (
        user_id,
        lesson_id,
        completed,
        progress_percent,
        last_position_seconds,
        completed_at
      )
      VALUES (?, ?, TRUE, 100.00, 0, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
        completed = TRUE,
        progress_percent = 100.00,
        completed_at = CURRENT_TIMESTAMP
      `,
      [userId, lessonId]
    );

    return result;
  },
};

module.exports = LessonProgress;