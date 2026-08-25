const pool = require("../config/database");

const studentController = {
  // =====================================================
  // STUDENT DASHBOARD
  // =====================================================

  async getDashboard(req, res) {
    try {
      const studentId = req.user.id;

      // =================================================
      // MY ENROLLED COURSES
      // =================================================

      const [courseRows] = await pool.execute(
        `
        SELECT
          e.id AS enrollment_id,
          e.course_id,
          e.status AS enrollment_status,
          e.enrolled_at,

          c.title,
          c.description,
          c.thumbnail_color,
          c.level,

          CONCAT(
            COALESCE(u.first_name, ''),
            ' ',
            COALESCE(u.last_name, '')
          ) AS instructor_name,

          COUNT(DISTINCT l.id) AS total_lessons,

          COUNT(
            DISTINCT CASE
              WHEN lp.completed = 1
              THEN lp.lesson_id
              ELSE NULL
            END
          ) AS completed_lessons

        FROM enrollments e

        INNER JOIN courses c
          ON e.course_id = c.id

        INNER JOIN users u
          ON c.instructor_id = u.id

        LEFT JOIN course_sections s
          ON s.course_id = c.id

        LEFT JOIN lessons l
          ON l.section_id = s.id

        LEFT JOIN lesson_progress lp
          ON lp.lesson_id = l.id
          AND lp.user_id = e.user_id

        WHERE e.user_id = ?

        GROUP BY
          e.id,
          e.course_id,
          e.status,
          e.enrolled_at,
          c.id,
          c.title,
          c.description,
          c.thumbnail_color,
          c.level,
          u.first_name,
          u.last_name

        ORDER BY e.enrolled_at DESC
        `,
        [studentId]
      );

      // =================================================
      // FORMAT COURSES
      // =================================================

      const myCourses = courseRows.map((course) => {
        const totalLessons =
          Number(course.total_lessons) || 0;

        const completedLessons =
          Number(course.completed_lessons) || 0;

        const progress =
          totalLessons > 0
            ? Math.round(
                (completedLessons /
                  totalLessons) *
                  100
              )
            : 0;

        return {
          id: course.course_id,
          enrollmentId:
            course.enrollment_id,
          title: course.title,
          instructor:
            course.instructor_name?.trim() ||
            "Unknown Instructor",
          progress,
          thumbnailColor:
            course.thumbnail_color ||
            "#2E7D32",
          enrollmentStatus:
            course.enrollment_status,
          enrolledAt:
            course.enrolled_at,
        };
      });

      // =================================================
      // CONTINUE LEARNING
      // =================================================

      let currentCourse = null;

      const [continueRows] = await pool.execute(
        `
        SELECT
          lp.lesson_id,
          lp.progress_percent,
          lp.last_position_seconds,
          lp.updated_at,

          l.title AS lesson_title,

          s.course_id,

          c.title AS course_title

        FROM lesson_progress lp

        INNER JOIN lessons l
          ON lp.lesson_id = l.id

        INNER JOIN course_sections s
          ON l.section_id = s.id

        INNER JOIN courses c
          ON s.course_id = c.id

        INNER JOIN enrollments e
          ON e.course_id = s.course_id
          AND e.user_id = lp.user_id

        WHERE
          lp.user_id = ?
          AND lp.completed = 0

        ORDER BY lp.updated_at DESC

        LIMIT 1
        `,
        [studentId]
      );

      if (continueRows.length > 0) {
        const row = continueRows[0];

        currentCourse = {
          id: row.lesson_id,
          courseId: row.course_id,
          title: row.course_title,
          lesson:
            row.lesson_title ||
            "Continue learning",
          progress:
            Number(
              row.progress_percent
            ) || 0,
          timeLeft:
            "Continue your lesson",
        };
      } else if (myCourses.length > 0) {
        // ===============================================
        // FALLBACK TO FIRST ENROLLED COURSE
        // ===============================================

        const firstCourse =
          myCourses[0];

        const [firstLessonRows] =
          await pool.execute(
            `
            SELECT
              l.id,
              l.title
            FROM lessons l

            INNER JOIN course_sections s
              ON l.section_id = s.id

            WHERE s.course_id = ?

            ORDER BY
              s.id ASC,
              l.id ASC

            LIMIT 1
            `,
            [firstCourse.id]
          );

        const firstLesson =
          firstLessonRows[0];

        if (firstLesson) {
          currentCourse = {
            id: firstLesson.id,
            courseId:
              firstCourse.id,
            title:
              firstCourse.title,
            lesson:
              firstLesson.title,
            progress:
              firstCourse.progress,
            timeLeft:
              "Start learning",
          };
        }
      }

      // =================================================
      // UPCOMING ASSIGNMENTS
      // =================================================

      const [deadlineRows] =
        await pool.execute(
          `
          SELECT
            a.id,
            a.title,
            a.due_date,
            c.title AS course_title

          FROM assignments a

          INNER JOIN courses c
            ON a.course_id = c.id

          INNER JOIN enrollments e
            ON e.course_id = c.id

          WHERE
            e.user_id = ?

            AND (
              a.status IS NULL
              OR a.status <> 'draft'
            )

            AND a.due_date IS NOT NULL

            AND a.due_date >= NOW()

          ORDER BY
            a.due_date ASC

          LIMIT 5
          `,
          [studentId]
        );

      const upcomingDeadlines =
        deadlineRows.map(
          (assignment) => {
            const dueDate =
              new Date(
                assignment.due_date
              );

            const now =
              new Date();

            const diffMs =
              dueDate.getTime() -
              now.getTime();

            const diffHours =
              Math.ceil(
                diffMs /
                  (1000 * 60 * 60)
              );

            let dueLabel =
              dueDate.toLocaleDateString(
                "en-US",
                {
                  month:
                    "short",
                  day: "numeric",
                }
              );

            let urgent = false;

            if (diffHours <= 24) {
              dueLabel =
                "Due today";

              urgent = true;
            } else if (
              diffHours <=
              48
            ) {
              dueLabel =
                "Due in 1 day";

              urgent = true;
            } else {
              const days =
                Math.ceil(
                  diffHours /
                    24
                );

              dueLabel = `Due in ${days} days`;

              if (days <= 2) {
                urgent = true;
              }
            }

            return {
              id: assignment.id,
              title:
                assignment.title,
              course:
                assignment.course_title,
              dueLabel,
              dueDate:
                assignment.due_date,
              urgent,
              href: `/assignments/${assignment.id}`,
            };
          }
        );

      // =================================================
      // WEEKLY LEARNING ACTIVITY
      // =================================================

      const [activityRows] =
        await pool.execute(
          `
          SELECT
            DATE(completed_at) AS activity_date,
            COUNT(*) AS completed_lessons

          FROM lesson_progress

          WHERE
            user_id = ?
            AND completed = 1
            AND completed_at IS NOT NULL
            AND completed_at >=
              CURDATE() - INTERVAL 6 DAY

          GROUP BY
            DATE(completed_at)

          ORDER BY
            activity_date ASC
          `,
          [studentId]
        );

      const activityMap = {};

      activityRows.forEach(
        (row) => {
          const key =
            formatDateKey(
              row.activity_date
            );

          activityMap[key] =
            Number(
              row.completed_lessons
            ) || 0;
        }
      );

      const weeklyActivity = [];

      for (
        let i = 6;
        i >= 0;
        i--
      ) {
        const date =
          new Date();

        date.setHours(
          0,
          0,
          0,
          0
        );

        date.setDate(
          date.getDate() - i
        );

        const key =
          formatDateKey(
            date
          );

        const day =
          date.toLocaleDateString(
            "en-US",
            {
              weekday:
                "short",
            }
          );

        weeklyActivity.push({
          day,
          lessons:
            activityMap[key] || 0,
        });
      }

      // =================================================
      // COMPLETED COURSES
      // =================================================

      const [[completedCourseRow]] =
        await pool.execute(
          `
          SELECT
            COUNT(*) AS total
          FROM enrollments
          WHERE
            user_id = ?
            AND status = 'completed'
          `,
          [studentId]
        );

      const completedCourses =
        Number(
          completedCourseRow?.total
        ) || 0;

      // =================================================
      // COMPLETED LESSONS
      // =================================================

      const [[completedLessonRow]] =
        await pool.execute(
          `
          SELECT
            COUNT(*) AS total
          FROM lesson_progress
          WHERE
            user_id = ?
            AND completed = 1
          `,
          [studentId]
        );

      const completedLessons =
        Number(
          completedLessonRow?.total
        ) || 0;

      // =================================================
      // CERTIFICATES
      // =================================================

      const [[certificateRow]] =
        await pool.execute(
          `
          SELECT
            COUNT(*) AS total
          FROM certificates
          WHERE user_id = ?
          `,
          [studentId]
        );

      const certificateCount =
        Number(
          certificateRow?.total
        ) || 0;

      // =================================================
      // ACHIEVEMENTS
      // =================================================

      const achievements = [
        {
          id: 1,
          label:
            "First Course Completed",
          icon: "Trophy",
          earned:
            completedCourses >= 1,
        },

        {
          id: 2,
          label:
            "5 Lessons Completed",
          icon: "BookOpen",
          earned:
            completedLessons >= 5,
        },

        {
          id: 3,
          label:
            "10 Lessons Completed",
          icon: "Sparkles",
          earned:
            completedLessons >= 10,
        },

        {
          id: 4,
          label:
            "Certificate Earned",
          icon: "Award",
          earned:
            certificateCount >= 1,
        },
      ];

      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({
        currentCourse,
        myCourses,
        upcomingDeadlines,
        weeklyActivity,
        achievements,
        summary: {
          completedCourses,
          completedLessons,
          certificateCount,
        },
      });
    } catch (error) {
      console.error(
        "Student dashboard error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch student dashboard",
      });
    }
  },
};

// =====================================================
// FORMAT DATE AS YYYY-MM-DD
// =====================================================

function formatDateKey(dateValue) {
  if (!dateValue) {
    return "";
  }

  if (
    typeof dateValue ===
    "string"
  ) {
    return dateValue.slice(
      0,
      10
    );
  }

  const year =
    dateValue.getFullYear();

  const month = String(
    dateValue.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    dateValue.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

module.exports =
  studentController;