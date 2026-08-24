const pool = require("../config/database");

const adminController = {
  // =====================================================
  // ADMIN DASHBOARD
  // =====================================================

  async getDashboard(req, res) {
    try {
      // =====================================================
      // TOTAL USERS
      // =====================================================

      const [[userCount]] = await pool.execute(
        `
        SELECT COUNT(*) AS total
        FROM users
        `
      );

      // =====================================================
      // TOTAL COURSES
      // =====================================================

      const [[courseCount]] = await pool.execute(
        `
        SELECT COUNT(*) AS total
        FROM courses
        `
      );

      // =====================================================
      // TOTAL ASSIGNMENTS
      // =====================================================

      const [[assignmentCount]] =
        await pool.execute(
          `
          SELECT COUNT(*) AS total
          FROM assignments
          `
        );

      // =====================================================
      // TOTAL COMPETITIONS
      // =====================================================

      const [[competitionCount]] =
        await pool.execute(
          `
          SELECT COUNT(*) AS total
          FROM competitions
          `
        );

      // =====================================================
      // RECENT USERS
      // =====================================================

      const [users] = await pool.execute(
        `
        SELECT
          id,
          first_name,
          last_name,
          email,
          phone,
          region,
          role,
          account_type,
          profile_image,
          status,
          created_at

        FROM users

        ORDER BY created_at DESC

        LIMIT 20
        `
      );

      // =====================================================
      // FORMAT USERS
      // =====================================================

      const formattedUsers = users.map(
        (user) => ({
          id: user.id,

          name:
            `${user.first_name || ""} ${
              user.last_name || ""
            }`.trim() ||
            "Unknown User",

          email:
            user.email || "",

          role:
            user.role === "admin"
              ? "Admin"
              : user.role ===
                "instructor"
              ? "Instructor"
              : "Student",

          status:
            user.status ===
            "suspended"
              ? "Suspended"
              : "Active",

          phone:
            user.phone || "",

          region:
            user.region || "",

          accountType:
            user.account_type ||
            "",

          createdAt:
            user.created_at,
        })
      );

      return res.status(200).json({
        stats: {
          totalUsers:
            Number(userCount?.total) || 0,

          totalCourses:
            Number(courseCount?.total) || 0,

          totalAssignments:
            Number(
              assignmentCount?.total
            ) || 0,

          totalCompetitions:
            Number(
              competitionCount?.total
            ) || 0,
        },

        users:
          formattedUsers,

        moderationQueue: [],
      });
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch admin dashboard",
      });
    }
  },

  // =====================================================
  // GET ALL USERS
  // =====================================================

  async getUsers(req, res) {
    try {
      const [users] =
        await pool.execute(
          `
          SELECT
            id,
            first_name,
            last_name,
            email,
            phone,
            region,
            role,
            account_type,
            profile_image,
            status,
            created_at

          FROM users

          ORDER BY created_at DESC
          `
        );

      const formattedUsers =
        users.map(
          (user) => ({
            id: user.id,

            name:
              `${user.first_name || ""} ${
                user.last_name || ""
              }`.trim() ||
              "Unknown User",

            email:
              user.email || "",

            role:
              user.role ===
              "admin"
                ? "Admin"
                : user.role ===
                  "instructor"
                ? "Instructor"
                : "Student",

            status:
              user.status ===
              "suspended"
                ? "Suspended"
                : "Active",

            phone:
              user.phone || "",

            region:
              user.region || "",

            accountType:
              user.account_type ||
              "",

            createdAt:
              user.created_at,
          })
        );

      return res.status(200).json(
        formattedUsers
      );
    } catch (error) {
      console.error(
        "Get users error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch users",
      });
    }
  },

  // =====================================================
  // UPDATE USER ROLE
  // =====================================================

  async updateUserRole(req, res) {
    try {
      const userId =
        Number(req.params.id);

      const { role } = req.body;

      const allowedRoles = [
        "student",
        "instructor",
      ];

      if (
        !allowedRoles.includes(
          role
        )
      ) {
        return res.status(400).json({
          message:
            "Role must be student or instructor",
        });
      }

      const [[user]] =
        await pool.execute(
          `
          SELECT
            id,
            role,
            email
          FROM users
          WHERE id = ?
          LIMIT 1
          `,
          [userId]
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      if (
        user.role ===
        "admin"
      ) {
        return res.status(400).json({
          message:
            "The admin account cannot be changed from User Management",
        });
      }

      await pool.execute(
        `
        UPDATE users
        SET role = ?
        WHERE id = ?
        `,
        [role, userId]
      );

      return res.status(200).json({
        message:
          "User role updated successfully",
      });
    } catch (error) {
      console.error(
        "Update user role error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update user role",
      });
    }
  },

  // =====================================================
  // UPDATE USER STATUS
  // =====================================================

  async updateUserStatus(req, res) {
    try {
      const userId =
        Number(req.params.id);

      const { status } = req.body;

      const allowedStatuses = [
        "active",
        "suspended",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid account status",
        });
      }

      const [[user]] =
        await pool.execute(
          `
          SELECT
            id,
            role,
            status
          FROM users
          WHERE id = ?
          LIMIT 1
          `,
          [userId]
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      if (
        user.role ===
        "admin"
      ) {
        return res.status(400).json({
          message:
            "The admin account cannot be suspended",
        });
      }

      await pool.execute(
        `
        UPDATE users
        SET status = ?
        WHERE id = ?
        `,
        [status, userId]
      );

      return res.status(200).json({
        message:
          status === "suspended"
            ? "User suspended successfully"
            : "User reactivated successfully",
      });
    } catch (error) {
      console.error(
        "Update user status error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update user status",
      });
    }
  },

  // =====================================================
  // DELETE USER
  // =====================================================

  async deleteUser(req, res) {
    try {
      const userId =
        Number(req.params.id);

      if (
        userId ===
        Number(req.user.id)
      ) {
        return res.status(400).json({
          message:
            "You cannot delete your own account",
        });
      }

      const [[user]] =
        await pool.execute(
          `
          SELECT
            id,
            role
          FROM users
          WHERE id = ?
          LIMIT 1
          `,
          [userId]
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      if (
        user.role ===
        "admin"
      ) {
        return res.status(400).json({
          message:
            "The admin account cannot be deleted",
        });
      }

      const [result] =
        await pool.execute(
          `
          DELETE FROM users
          WHERE id = ?
          `,
          [userId]
        );

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      return res.status(200).json({
        message:
          "User deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete user error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to delete user",
      });
    }
  },

  // =====================================================
  // ADMIN REPORTS
  // =====================================================

  async getReports(req, res) {
    try {
      // =====================================================
      // USER BREAKDOWN
      // =====================================================

      const [userRows] =
        await pool.execute(
          `
          SELECT
            role,
            COUNT(*) AS total
          FROM users
          GROUP BY role
          ORDER BY role
          `
        );

      const userBreakdown = {
        student: 0,
        instructor: 0,
        admin: 0,
      };

      userRows.forEach(
        (row) => {
          if (
            Object.prototype.hasOwnProperty.call(
              userBreakdown,
              row.role
            )
          ) {
            userBreakdown[
              row.role
            ] =
              Number(
                row.total
              ) || 0;
          }
        }
      );

      // =====================================================
      // USER STATUS
      // =====================================================

      const [statusRows] =
        await pool.execute(
          `
          SELECT
            status,
            COUNT(*) AS total
          FROM users
          GROUP BY status
          ORDER BY status
          `
        );

      const userStatus = {
        active: 0,
        suspended: 0,
      };

      statusRows.forEach(
        (row) => {
          if (
            Object.prototype.hasOwnProperty.call(
              userStatus,
              row.status
            )
          ) {
            userStatus[
              row.status
            ] =
              Number(
                row.total
              ) || 0;
          }
        }
      );

      // =====================================================
      // COURSE BREAKDOWN
      // =====================================================

      const [[courseTotals]] =
        await pool.execute(
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
          `
        );

      // =====================================================
      // TOTAL ENROLLMENTS
      // =====================================================

      const [[enrollmentTotals]] =
        await pool.execute(
          `
          SELECT
            COUNT(*) AS total_enrollments
          FROM enrollments
          `
        );

      // =====================================================
      // LAST 7 DAYS ENROLLMENTS
      // =====================================================

      const [enrollmentRows] =
        await pool.execute(
          `
          SELECT
            DATE(enrolled_at) AS enrollment_date,
            COUNT(*) AS enrollments

          FROM enrollments

          WHERE enrolled_at >=
            CURDATE() - INTERVAL 6 DAY

          GROUP BY DATE(enrolled_at)

          ORDER BY enrollment_date ASC
          `
        );

      const enrollmentMap = {};

      enrollmentRows.forEach(
        (row) => {
          const dateKey =
            formatDateKey(
              row.enrollment_date
            );

          enrollmentMap[
            dateKey
          ] =
            Number(
              row.enrollments
            ) || 0;
        }
      );

      const enrollmentActivity = [];

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

        const dateKey =
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

        enrollmentActivity.push({
          date: dateKey,
          day,
          enrollments:
            enrollmentMap[
              dateKey
            ] || 0,
        });
      }

      // =====================================================
      // ASSIGNMENTS
      // =====================================================

      const [[assignmentTotals]] =
        await pool.execute(
          `
          SELECT
            COUNT(*) AS total_assignments
          FROM assignments
          `
        );

      // =====================================================
      // SUBMISSIONS
      // =====================================================

      const [[submissionTotals]] =
        await pool.execute(
          `
          SELECT
            COUNT(*) AS total_submissions
          FROM submissions
          `
        );

      // =====================================================
      // SUBMISSION STATUS
      // =====================================================

      const [
        submissionStatusRows,
      ] = await pool.execute(
        `
        SELECT
          status,
          COUNT(*) AS total

        FROM submissions

        GROUP BY status

        ORDER BY status
        `
      );

      const submissionStatus = {};

      submissionStatusRows.forEach(
        (row) => {
          submissionStatus[
            row.status ||
              "unknown"
          ] =
            Number(
              row.total
            ) || 0;
        }
      );

      return res.status(200).json({
        users: {
          total:
            Object.values(
              userBreakdown
            ).reduce(
              (sum, value) =>
                sum + value,
              0
            ),

          byRole:
            userBreakdown,

          byStatus:
            userStatus,
        },

        courses: {
          total:
            Number(
              courseTotals?.total_courses
            ) || 0,

          published:
            Number(
              courseTotals?.published_courses
            ) || 0,

          draft:
            Number(
              courseTotals?.draft_courses
            ) || 0,
        },

        enrollments: {
          total:
            Number(
              enrollmentTotals?.total_enrollments
            ) || 0,

          last7Days:
            enrollmentActivity,
        },

        assignments: {
          total:
            Number(
              assignmentTotals?.total_assignments
            ) || 0,
        },

        submissions: {
          total:
            Number(
              submissionTotals?.total_submissions
            ) || 0,

          byStatus:
            submissionStatus,
        },
      });
    } catch (error) {
      console.error(
        "Admin reports error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch admin reports",
      });
    }
  },

  // =====================================================
  // SYSTEM HEALTH
  // =====================================================

  async getSystemHealth(req, res) {
    const checkedAt =
      new Date().toISOString();

    let databaseStatus =
      "down";

    let databaseResponseTime = null;

    try {
      const startTime =
        process.hrtime.bigint();

      await pool.execute(
        "SELECT 1 AS connected"
      );

      const endTime =
        process.hrtime.bigint();

      databaseResponseTime =
        Number(
          endTime - startTime
        ) / 1_000_000;

      databaseStatus =
        "healthy";
    } catch (error) {
      console.error(
        "System health database check error:",
        error
      );
    }

    return res.status(200).json({
      status:
        databaseStatus ===
        "healthy"
          ? "healthy"
          : "degraded",

      checkedAt,

      api: {
        status: "healthy",
        message:
          "API is responding normally",
      },

      database: {
        status:
          databaseStatus,
        responseTimeMs:
          databaseResponseTime !==
          null
            ? Number(
                databaseResponseTime.toFixed(
                  2
                )
              )
            : null,
      },

      server: {
        uptimeSeconds:
          Math.floor(
            process.uptime()
          ),

        uptimeFormatted:
          formatUptime(
            process.uptime()
          ),

        nodeVersion:
          process.version,

        platform:
          process.platform,

        environment:
          process.env.NODE_ENV ||
          "development",
      },
    });
  },
};

// =====================================================
// FORMAT DATE
// =====================================================

function formatDateKey(
  dateValue
) {
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

// =====================================================
// FORMAT UPTIME
// =====================================================

function formatUptime(
  totalSeconds
) {
  const seconds =
    Math.floor(
      totalSeconds
    );

  const days =
    Math.floor(
      seconds / 86400
    );

  const hours =
    Math.floor(
      (seconds % 86400) /
        3600
    );

  const minutes =
    Math.floor(
      (seconds % 3600) /
        60
    );

  const remainingSeconds =
    seconds % 60;

  const parts = [];

  if (days > 0) {
    parts.push(
      `${days}d`
    );
  }

  if (hours > 0 || days > 0) {
    parts.push(
      `${hours}h`
    );
  }

  if (
    minutes > 0 ||
    hours > 0 ||
    days > 0
  ) {
    parts.push(
      `${minutes}m`
    );
  }

  parts.push(
    `${remainingSeconds}s`
  );

  return parts.join(" ");
}

module.exports =
  adminController;