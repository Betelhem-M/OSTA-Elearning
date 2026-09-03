const express = require("express");

const instructorController = require("../controllers/instructorController");

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// =====================================================
// INSTRUCTOR DASHBOARD
// =====================================================

router.get(
  "/dashboard",
  authMiddleware,
  roleMiddleware("instructor", "admin"),
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
// INSTRUCTOR STUDENT PROGRESS
// =====================================================

router.get(
  "/students/progress",
  authMiddleware,
  roleMiddleware("instructor", "admin"),
  instructorController.getStudentProgress
);

// =====================================================
// INSTRUCTOR SUBMISSIONS
// =====================================================

// View all student submissions
router.get(
  "/submissions",
  authMiddleware,
  roleMiddleware("instructor", "admin"),
  instructorController.getSubmissions
);

// Grade a student submission
router.put(
  "/submissions/:submissionId/grade",
  authMiddleware,
  roleMiddleware("instructor", "admin"),
  instructorController.gradeSubmission
);

// =====================================================
// INSTRUCTOR STUDENTS
// =====================================================

router.get(
  "/students",
  authMiddleware,
  roleMiddleware("instructor", "admin"),
  instructorController.getStudents
);
// =====================================================
// INSTRUCTOR STUDENT PROGRESS
// =====================================================

router.get(
  "/student-progress",
  authMiddleware,
  roleMiddleware("instructor", "admin"),
  instructorController.getStudentProgress
);

module.exports = router;