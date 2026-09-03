const express = require("express");

const instructorProgressController =
  require("../controllers/instructorProgressController");

const authMiddleware =
  require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/courses/:courseId/students/progress",
  authMiddleware,
  instructorProgressController.getCourseStudentProgress
);

router.get(
  "/students/:studentId/progress",
  authMiddleware,
  instructorProgressController.getStudentProgress
);

module.exports = router;