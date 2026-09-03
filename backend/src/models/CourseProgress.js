const pool = require("../config/database");

const CourseProgress = {
  async getStudentCourseProgress(userId, courseId) {
    const [rows] = await pool.execute(
      `
      SELECT
        c.id AS course_id,
        c.title AS course_title,

        COUNT(DISTINCT l.id) AS total_lessons,

        COUNT(
          DISTINCT CASE
            WHEN lp.completed = TRUE THEN l.id
          END
        ) AS completed_lessons,

        ROUND(
          CASE
            WHEN COUNT(DISTINCT l.id) = 0 THEN 0
            ELSE
              (
                COUNT(
                  DISTINCT CASE
                    WHEN lp.completed = TRUE THEN l.id
                  END
                ) / COUNT(DISTINCT l.id)
              ) * 100
          END,
          2
        ) AS progress_percent

      FROM courses c

      LEFT JOIN course_sections cs
        ON cs.course_id = c.id

      LEFT JOIN lessons l
        ON l.section_id = cs.id

      LEFT JOIN lesson_progress lp
        ON lp.lesson_id = l.id
        AND lp.user_id = ?

      WHERE c.id = ?

      GROUP BY c.id, c.title
      `,
      [userId, courseId]
    );

    return rows[0] || null;
  },

  async getInstructorCourseProgress(instructorId, courseId) {
    const [rows] = await pool.execute(
      `
      SELECT
        u.id AS student_id,

        CONCAT(
          u.first_name,
          ' ',
          u.last_name
        ) AS student_name,

        u.email AS student_email,

        c.id AS course_id,
        c.title AS course_title,

        COUNT(DISTINCT l.id) AS total_lessons,

        COUNT(
          DISTINCT CASE
            WHEN lp.completed = TRUE THEN l.id
          END
        ) AS completed_lessons,

        ROUND(
          CASE
            WHEN COUNT(DISTINCT l.id) = 0 THEN 0
            ELSE
              (
                COUNT(
                  DISTINCT CASE
                    WHEN lp.completed = TRUE THEN l.id
                  END
                ) / COUNT(DISTINCT l.id)
              ) * 100
          END,
          2
        ) AS progress_percent

      FROM courses c

      INNER JOIN enrollments e
        ON e.course_id = c.id

      INNER JOIN users u
        ON u.id = e.user_id

      LEFT JOIN course_sections cs
        ON cs.course_id = c.id

      LEFT JOIN lessons l
        ON l.section_id = cs.id

      LEFT JOIN lesson_progress lp
        ON lp.lesson_id = l.id
        AND lp.user_id = u.id

      WHERE
        c.id = ?
        AND c.instructor_id = ?

      GROUP BY
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        c.id,
        c.title

      ORDER BY
        progress_percent DESC
      `,
      [courseId, instructorId]
    );

    return rows;
  },

  /**
   * Returns per-course progress for ONE student, across every
   * course that student is enrolled in AND that belongs to this
   * instructor. Ownership is enforced directly in the WHERE clause
   * (c.instructor_id = ?), so a student with no courses under this
   * instructor simply returns an empty array.
   */
  async getInstructorStudentProgress(instructorId, studentId) {
    const [rows] = await pool.execute(
      `
      SELECT
        u.id AS student_id,

        CONCAT(
          u.first_name,
          ' ',
          u.last_name
        ) AS student_name,

        u.email AS student_email,

        c.id AS course_id,
        c.title AS course_title,

        COUNT(DISTINCT l.id) AS total_lessons,

        COUNT(
          DISTINCT CASE
            WHEN lp.completed = TRUE THEN l.id
          END
        ) AS completed_lessons,

        ROUND(
          CASE
            WHEN COUNT(DISTINCT l.id) = 0 THEN 0
            ELSE
              (
                COUNT(
                  DISTINCT CASE
                    WHEN lp.completed = TRUE THEN l.id
                  END
                ) / COUNT(DISTINCT l.id)
              ) * 100
          END,
          2
        ) AS progress_percent

      FROM enrollments e

      INNER JOIN users u
        ON u.id = e.user_id

      INNER JOIN courses c
        ON c.id = e.course_id

      LEFT JOIN course_sections cs
        ON cs.course_id = c.id

      LEFT JOIN lessons l
        ON l.section_id = cs.id

      LEFT JOIN lesson_progress lp
        ON lp.lesson_id = l.id
        AND lp.user_id = u.id

      WHERE
        e.user_id = ?
        AND c.instructor_id = ?

      GROUP BY
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        c.id,
        c.title

      ORDER BY
        c.title ASC
      `,
      [studentId, instructorId]
    );

    return rows;
  },
};

module.exports = CourseProgress;