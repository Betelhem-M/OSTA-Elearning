const express = require("express");

const adminController =
  require("../controllers/adminController");

const authMiddleware =
  require("../middleware/authMiddleware");

const roleMiddleware =
  require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getDashboard
);

// =====================================================
// ADMIN USERS
// =====================================================

router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getUsers
);

// =====================================================
// UPDATE USER ROLE
// =====================================================

router.put(
  "/users/:id/role",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.updateUserRole
);

// =====================================================
// UPDATE USER STATUS
// =====================================================

router.put(
  "/users/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.updateUserStatus
);

// =====================================================
// DELETE USER
// =====================================================

router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.deleteUser
);

// =====================================================
// ADMIN REPORTS
// =====================================================

router.get(
  "/reports",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getReports
);

// =====================================================
// SYSTEM HEALTH
// =====================================================

router.get(
  "/system-health",
  authMiddleware,
  roleMiddleware("admin"),
  adminController.getSystemHealth
);

module.exports =
  router;