const express = require("express");

const instructorController =
  require("../controllers/instructorController");

const authMiddleware =
  require("../middleware/authMiddleware");

const roleMiddleware =
  require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// INSTRUCTOR DASHBOARD
// =====================================================

router.get(
  "/dashboard",

  authMiddleware,

  roleMiddleware(
    "instructor",
    "admin"
  ),

  instructorController.getDashboard
);
// =====================================================
// INSTRUCTOR ANALYTICS
// =====================================================

router.get(
  "/analytics",
  authMiddleware,
  roleMiddleware("instructor", "admin"),
  instructorController.getAnalytics
);

// =====================================================
// INSTRUCTOR SUBMISSIONS
// =====================================================

router.get(
  "/submissions",

  authMiddleware,

  roleMiddleware(
    "instructor",
    "admin"
  ),

  instructorController.getSubmissions
);

// =====================================================
// INSTRUCTOR STUDENTS
// =====================================================

router.get(
  "/students",

  authMiddleware,

  roleMiddleware(
    "instructor",
    "admin"
  ),

  instructorController.getStudents
);

module.exports = router;