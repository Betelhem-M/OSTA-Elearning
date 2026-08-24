const pool = require("../config/database");

const instructorController = {
  // =====================================================
  // INSTRUCTOR DASHBOARD
  // =====================================================

  async getDashboard(req, res) {
    try {
      const instructorId = req.user.id;

      // =====================================================
      // COURSE STATISTICS
      // =====================================================

      const [courseStats] = await pool.execute(
        `
        SELECT
          COUNT(*) AS total_courses,

          COALESCE(
            SUM(
              CASE
                WHEN status = 'published' THEN 1
                ELSE 0
              END
            ),
            0
          ) AS active_courses

        FROM courses

        WHERE instructor_id = ?
        `,
        [instructorId]
      );

      // =====================================================
      // TOTAL UNIQUE STUDENTS
      // =====================================================

      const [studentStats] = await pool.execute(
        `
        SELECT
          COUNT(DISTINCT e.user_id) AS total_students

        FROM enrollments e

        INNER JOIN courses c
          ON e.course_id = c.id

        WHERE c.instructor_id = ?
        `,
        [instructorId]
      );

      // =====================================================
      // REVENUE
      // =====================================================

      const revenue = 0;

      // =====================================================
      // RECENT SUBMISSIONS
      // =====================================================

      const [recentSubmissions] = await pool.execute(
        `
        SELECT
          s.id,

          CONCAT(
            COALESCE(u.first_name, ''),
            ' ',
            COALESCE(u.last_name, '')
          ) AS student,

          a.title AS assignment,
          s.submitted_at

        FROM submissions s

        INNER JOIN assignments a
          ON s.assignment_id = a.id

        INNER JOIN courses c
          ON a.course_id = c.id

        INNER JOIN users u
          ON s.user_id = u.id

        WHERE c.instructor_id = ?

        ORDER BY s.submitted_at DESC

        LIMIT 5
        `,
        [instructorId]
      );

      // =====================================================
      // LAST 7 DAYS ENROLLMENTS
      // =====================================================

      const [enrollmentRows] = await pool.execute(
        `
        SELECT
          DATE(e.enrolled_at) AS enrollment_date,
          COUNT(*) AS enrollments

        FROM enrollments e

        INNER JOIN courses c
          ON e.course_id = c.id

        WHERE
          c.instructor_id = ?
          AND e.enrolled_at >= CURDATE() - INTERVAL 6 DAY

        GROUP BY DATE(e.enrolled_at)

        ORDER BY enrollment_date ASC
        `,
        [instructorId]
      );

      // =====================================================
      // BUILD ENROLLMENT MAP
      // =====================================================

      const enrollmentMap = {};

      enrollmentRows.forEach((row) => {
        const dateKey = formatDateKey(
          row.enrollment_date
        );

        enrollmentMap[dateKey] =
          Number(row.enrollments) || 0;
      });

      // =====================================================
      // BUILD EXACTLY 7 DAYS
      // =====================================================

      const enrollmentActivity = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();

        date.setHours(0, 0, 0, 0);
        date.setDate(
          date.getDate() - i
        );

        const dateKey = formatDateKey(date);

        const day = date.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
          }
        );

        enrollmentActivity.push({
          date: dateKey,
          day,
          enrollments:
            enrollmentMap[dateKey] || 0,
        });
      }

      // =====================================================
      // FORMAT SUBMISSIONS
      // =====================================================

      const formattedSubmissions =
        recentSubmissions.map(
          (submission) => ({
            id: submission.id,

            student:
              submission.student?.trim() ||
              "Unknown Student",

            assignment:
              submission.assignment ||
              "Assignment",

            submittedAgo:
              formatTimeAgo(
                submission.submitted_at
              ),
          })
        );

      // =====================================================
      // RESPONSE
      // =====================================================

      return res.status(200).json({
        stats: {
          activeCourses:
            Number(
              courseStats[0]?.active_courses
            ) || 0,

          totalCourses:
            Number(
              courseStats[0]?.total_courses
            ) || 0,

          totalStudents:
            Number(
              studentStats[0]?.total_students
            ) || 0,

          revenue,
        },

        recentSubmissions:
          formattedSubmissions,

        enrollmentActivity,
      });
    } catch (error) {
      console.error(
        "Instructor dashboard error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch instructor dashboard",
      });
    }
  },
  // =====================================================
// INSTRUCTOR ANALYTICS
// =====================================================
async getAnalytics(req, res) {
  try {
    const instructorId = req.user.id;

    // =====================================================
    // COURSE PERFORMANCE
    // =====================================================
    const [coursePerformance] = await pool.execute(
      `
      SELECT
        c.id,
        c.title,
        c.status,
        c.price,
        cat.name AS category_name,

        COUNT(DISTINCT e.user_id) AS students

      FROM courses c

      LEFT JOIN categories cat
        ON c.category_id = cat.id

      LEFT JOIN enrollments e
        ON c.id = e.course_id

      WHERE c.instructor_id = ?

      GROUP BY
        c.id,
        c.title,
        c.status,
        c.price,
        cat.name

      ORDER BY c.created_at DESC
      `,
      [instructorId]
    );

    // =====================================================
    // COURSE SUMMARY
    // =====================================================
    const [courseSummary] = await pool.execute(
      `
      SELECT
        COUNT(*) AS total_courses,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'published'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS published_courses,

        COALESCE(
          SUM(
            CASE
              WHEN status = 'draft'
              THEN 1
              ELSE 0
            END
          ),
          0
        ) AS draft_courses

      FROM courses

      WHERE instructor_id = ?
      `,
      [instructorId]
    );

    // =====================================================
    // TOTAL STUDENTS
    // =====================================================
    const [studentSummary] = await pool.execute(
      `
      SELECT
        COUNT(DISTINCT e.user_id) AS total_students

      FROM enrollments e

      INNER JOIN courses c
        ON e.course_id = c.id

      WHERE c.instructor_id = ?
      `,
      [instructorId]
    );

    // =====================================================
    // LAST 7 DAYS ENROLLMENTS
    // =====================================================
    const [enrollmentRows] = await pool.execute(
      `
      SELECT
        DATE(e.enrolled_at) AS enrollment_date,
        COUNT(*) AS enrollments

      FROM enrollments e

      INNER JOIN courses c
        ON e.course_id = c.id

      WHERE
        c.instructor_id = ?
        AND e.enrolled_at >= CURDATE() - INTERVAL 6 DAY

      GROUP BY DATE(e.enrolled_at)

      ORDER BY enrollment_date ASC
      `,
      [instructorId]
    );

    // =====================================================
    // BUILD ENROLLMENT MAP
    // =====================================================
    const enrollmentMap = {};

    enrollmentRows.forEach((row) => {
      const dateKey = formatDateKey(
        row.enrollment_date
      );

      enrollmentMap[dateKey] =
        Number(row.enrollments) || 0;
    });

    // =====================================================
    // BUILD EXACTLY 7 DAYS
    // =====================================================
    const enrollmentActivity = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(
        date.getDate() - i
      );

      const dateKey =
        formatDateKey(date);

      const day =
        date.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
          }
        );

      enrollmentActivity.push({
        date: dateKey,
        day,
        enrollments:
          enrollmentMap[dateKey] || 0,
      });
    }

    // =====================================================
    // RESPONSE
    // =====================================================
    return res.status(200).json({
      summary: {
        totalCourses:
          Number(
            courseSummary[0]?.total_courses
          ) || 0,

        publishedCourses:
          Number(
            courseSummary[0]?.published_courses
          ) || 0,

        draftCourses:
          Number(
            courseSummary[0]?.draft_courses
          ) || 0,

        totalStudents:
          Number(
            studentSummary[0]?.total_students
          ) || 0,
      },

      coursePerformance:
        coursePerformance.map((course) => ({
          id: course.id,
          title: course.title,
          status: course.status,
          price:
            Number(course.price) || 0,
          category_name:
            course.category_name ||
            "Uncategorized",
          students:
            Number(course.students) || 0,
        })),

      enrollmentActivity,
    });
  } catch (error) {
    console.error(
      "Instructor analytics error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch instructor analytics",
    });
  }
},

  // =====================================================
  // GET ALL INSTRUCTOR SUBMISSIONS
  // =====================================================

  async getSubmissions(req, res) {
    try {
      const instructorId = req.user.id;

      const [submissions] = await pool.execute(
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

          c.id AS course_id,
          c.title AS course_title,

          CONCAT(
            COALESCE(u.first_name, ''),
            ' ',
            COALESCE(u.last_name, '')
          ) AS student_name,

          u.email AS student_email

        FROM submissions s

        INNER JOIN assignments a
          ON s.assignment_id = a.id

        INNER JOIN courses c
          ON a.course_id = c.id

        INNER JOIN users u
          ON s.user_id = u.id

        WHERE c.instructor_id = ?

        ORDER BY s.submitted_at DESC
        `,
        [instructorId]
      );

      return res.status(200).json(
        submissions
      );
    } catch (error) {
      console.error(
        "Get instructor submissions error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch instructor submissions",
      });
    }
  },

  // =====================================================
  // GET INSTRUCTOR STUDENTS
  // =====================================================

  async getStudents(req, res) {
    try {
      const instructorId = req.user.id;

      // =====================================================
      // FIND STUDENTS ENROLLED IN INSTRUCTOR COURSES
      // =====================================================

      const [rows] = await pool.execute(
        `
        SELECT
          u.id AS student_id,

          CONCAT(
            COALESCE(u.first_name, ''),
            ' ',
            COALESCE(u.last_name, '')
          ) AS student_name,

          u.email AS student_email,

          COUNT(DISTINCT e.course_id) AS course_count,

          GROUP_CONCAT(
            DISTINCT c.title
            ORDER BY c.title ASC
            SEPARATOR '|||'
          ) AS course_names,

          MAX(e.enrolled_at) AS last_enrollment

        FROM enrollments e

        INNER JOIN courses c
          ON e.course_id = c.id

        INNER JOIN users u
          ON e.user_id = u.id

        WHERE
          c.instructor_id = ?
          AND u.role = 'student'

        GROUP BY
          u.id,
          u.first_name,
          u.last_name,
          u.email

        ORDER BY
          last_enrollment DESC
        `,
        [instructorId]
      );

      // =====================================================
      // FORMAT RESPONSE FOR FRONTEND
      // =====================================================

      const students = rows.map((row) => ({
        id: row.student_id,

        name:
          row.student_name?.trim() ||
          "Unknown Student",

        email:
          row.student_email || "",

        courseCount:
          Number(row.course_count) || 0,

        courses:
          row.course_names
            ? row.course_names
                .split("|||")
                .filter(Boolean)
            : [],

        lastEnrollment:
          row.last_enrollment,
      }));

      return res.status(200).json(
        students
      );
    } catch (error) {
      console.error(
        "Get instructor students error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch instructor students",
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

  if (typeof dateValue === "string") {
    return dateValue.slice(0, 10);
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

// =====================================================
// FORMAT TIME AGO
// =====================================================

function formatTimeAgo(dateValue) {
  if (!dateValue) {
    return "";
  }

  const submittedAt =
    new Date(dateValue);

  const now = new Date();

  const diffMs =
    now - submittedAt;

  if (diffMs < 0) {
    return "Just now";
  }

  const diffMinutes =
    Math.floor(
      diffMs / (1000 * 60)
    );

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} ${
      diffMinutes === 1
        ? "minute"
        : "minutes"
    } ago`;
  }

  const diffHours =
    Math.floor(
      diffMinutes / 60
    );

  if (diffHours < 24) {
    return `${diffHours} ${
      diffHours === 1
        ? "hour"
        : "hours"
    } ago`;
  }

  const diffDays =
    Math.floor(
      diffHours / 24
    );

  if (diffDays < 7) {
    return `${diffDays} ${
      diffDays === 1
        ? "day"
        : "days"
    } ago`;
  }

  return submittedAt.toLocaleDateString();
}

module.exports = instructorController;