const pool = require("../config/database");

const LessonProgress = {
  // ============================================================
  // GET ALL PROGRESS FOR A STUDENT
  // ============================================================

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
        l.section_id,

        cs.title AS section_title,
        cs.course_id,

        c.title AS course_title

      FROM lesson_progress lp

      INNER JOIN lessons l
        ON lp.lesson_id = l.id

      INNER JOIN course_sections cs
        ON l.section_id = cs.id

      INNER JOIN courses c
        ON cs.course_id = c.id

      WHERE lp.user_id = ?

      ORDER BY
        lp.updated_at DESC,
        lp.id DESC
      `,
      [userId]
    );

    return rows;
  },

  // ============================================================
  // GET PROGRESS FOR ONE LESSON
  // ============================================================

  async findByUserAndLesson(userId, lessonId) {
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
        l.section_id,

        cs.title AS section_title,
        cs.course_id,

        c.title AS course_title

      FROM lesson_progress lp

      INNER JOIN lessons l
        ON lp.lesson_id = l.id

      INNER JOIN course_sections cs
        ON l.section_id = cs.id

      INNER JOIN courses c
        ON cs.course_id = c.id

      WHERE
        lp.user_id = ?
        AND lp.lesson_id = ?

      LIMIT 1
      `,
      [userId, lessonId]
    );

    return rows[0] || null;
  },

  // ============================================================
  // CREATE OR UPDATE LESSON PROGRESS
  // ============================================================

  async createOrUpdate(
    userId,
    lessonId,
    progressPercent,
    lastPositionSeconds,
    completed
  ) {
    // ----------------------------------------------------------
    // NORMALIZE PROGRESS
    // ----------------------------------------------------------

    const percent = Math.min(
      Math.max(
        Number(progressPercent) || 0,
        0
      ),
      100
    );

    // ----------------------------------------------------------
    // NORMALIZE VIDEO POSITION
    // ----------------------------------------------------------

    const position = Math.max(
      Number(lastPositionSeconds) || 0,
      0
    );

    // ----------------------------------------------------------
    // AUTOMATIC COMPLETION
    // ----------------------------------------------------------

    const isCompleted =
      Boolean(completed) ||
      percent >= 100;

    // ----------------------------------------------------------
    // UPSERT
    // ----------------------------------------------------------

    const [result] = await pool.execute(
      `
      INSERT INTO lesson_progress (
        user_id,
        lesson_id,
        completed,
        progress_percent,
        last_position_seconds,
        completed_at
      )

      VALUES (?, ?, ?, ?, ?, ?)

      ON DUPLICATE KEY UPDATE

        completed =
          CASE
            WHEN VALUES(completed) = TRUE
              THEN TRUE
            ELSE completed
          END,

        progress_percent =
          CASE
            WHEN VALUES(progress_percent) >
                 progress_percent
              THEN VALUES(progress_percent)
            ELSE progress_percent
          END,

        last_position_seconds =
          VALUES(last_position_seconds),

        completed_at =
          CASE
            WHEN VALUES(completed) = TRUE
              THEN COALESCE(
                completed_at,
                CURRENT_TIMESTAMP
              )
            ELSE completed_at
          END,

        updated_at =
          CURRENT_TIMESTAMP
      `,
      [
        userId,
        lessonId,
        isCompleted,
        percent,
        position,
        isCompleted
          ? new Date()
          : null,
      ]
    );

    return result;
  },

  // ============================================================
  // MARK LESSON AS COMPLETED
  // ============================================================

  async markCompleted(userId, lessonId) {
    const [result] = await pool.execute(
      `
      INSERT INTO lesson_progress (
        user_id,
        lesson_id,
        completed,
        progress_percent,
        last_position_seconds,
        completed_at
      )

      VALUES (
        ?,
        ?,
        TRUE,
        100.00,
        0,
        CURRENT_TIMESTAMP
      )

      ON DUPLICATE KEY UPDATE

        completed = TRUE,

        progress_percent = 100.00,

        completed_at =
          COALESCE(
            completed_at,
            CURRENT_TIMESTAMP
          ),

        updated_at =
          CURRENT_TIMESTAMP
      `,
      [
        userId,
        lessonId,
      ]
    );

    return result;
  },
};

module.exports = LessonProgress;