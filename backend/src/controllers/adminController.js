const pool = require("../config/database");

const adminController = {
  async getDashboard(req, res) {
    try {
      const [[users]] = await pool.execute(
        "SELECT COUNT(*) AS total FROM users"
      );

      const [[courses]] = await pool.execute(
        "SELECT COUNT(*) AS total FROM courses"
      );

      const [[assignments]] = await pool.execute(
        "SELECT COUNT(*) AS total FROM assignments"
      );

      const [[competitions]] = await pool.execute(
        "SELECT COUNT(*) AS total FROM competitions"
      );

      res.json({
        stats: {
          totalUsers: users.total,
          totalCourses: courses.total,
          totalAssignments: assignments.total,
          totalCompetitions: competitions.total,
        },
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);

      res.status(500).json({
        message: "Failed to fetch admin dashboard",
      });
    }
  },

  async getUsers(req, res) {
    try {
      const [users] = await pool.execute(`
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
          created_at
        FROM users
        ORDER BY created_at DESC
      `);

      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);

      res.status(500).json({
        message: "Failed to fetch users",
      });
    }
  },

  async updateUserRole(req, res) {
    try {
      const userId = Number(req.params.id);
      const { role } = req.body;

      const allowedRoles = [
        "student",
        "instructor",
        "admin",
      ];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message: "Invalid role",
        });
      }

      const [result] = await pool.execute(
        `
        UPDATE users
        SET role = ?
        WHERE id = ?
        `,
        [role, userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.json({
        message: "User role updated successfully",
      });
    } catch (error) {
      console.error("Update user role error:", error);

      res.status(500).json({
        message: "Failed to update user role",
      });
    }
  },

  async deleteUser(req, res) {
    try {
      const userId = Number(req.params.id);

      if (userId === req.user.id) {
        return res.status(400).json({
          message: "You cannot delete your own account",
        });
      }

      const [result] = await pool.execute(
        "DELETE FROM users WHERE id = ?",
        [userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.json({
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);

      res.status(500).json({
        message: "Failed to delete user",
      });
    }
  },
};

module.exports = adminController;