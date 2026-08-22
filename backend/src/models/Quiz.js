const pool = require("../config/database");

const Quiz = {
  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        q.id,
        q.course_id,
        q.lesson_id,
        q.title,
        q.description,
        q.total_questions,
        q.time_limit_minutes,
        q.pass_percent,
        q.status,
        q.created_at,
        q.updated_at,
        c.title AS course_title,
        l.title AS lesson_title
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      LEFT JOIN lessons l ON q.lesson_id = l.id
      WHERE q.id = ?
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
        id,
        course_id,
        lesson_id,
        title,
        description,
        total_questions,
        time_limit_minutes,
        pass_percent,
        status,
        created_at,
        updated_at
      FROM quizzes
      WHERE course_id = ?
      ORDER BY created_at DESC
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
    timeLimitMinutes,
    passPercent = 70,
    status = "draft",
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO quizzes
      (
        course_id,
        lesson_id,
        title,
        description,
        total_questions,
        time_limit_minutes,
        pass_percent,
        status
      )
      VALUES (?, ?, ?, ?, 0, ?, ?, ?)
      `,
      [
        courseId,
        lessonId || null,
        title,
        description || null,
        timeLimitMinutes || null,
        passPercent,
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
      timeLimitMinutes,
      passPercent,
      status,
    }
  ) {
    const [result] = await pool.execute(
      `
      UPDATE quizzes
      SET
        lesson_id = ?,
        title = ?,
        description = ?,
        time_limit_minutes = ?,
        pass_percent = ?,
        status = ?
      WHERE id = ?
      `,
      [
        lessonId || null,
        title,
        description || null,
        timeLimitMinutes || null,
        passPercent,
        status,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  async updateQuestionCount(quizId) {
    const [result] = await pool.execute(
      `
      UPDATE quizzes
      SET total_questions = (
        SELECT COUNT(*)
        FROM questions
        WHERE quiz_id = ?
      )
      WHERE id = ?
      `,
      [quizId, quizId]
    );

    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM quizzes WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = Quiz;