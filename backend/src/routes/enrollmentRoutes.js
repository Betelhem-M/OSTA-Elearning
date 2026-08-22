const express = require("express");

const enrollmentController = require("../controllers/enrollmentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/my",
  authMiddleware,
  enrollmentController.getMyEnrollments
);

router.post(
  "/",
  authMiddleware,
  enrollmentController.enroll
);

router.get(
  "/course/:courseId",
  authMiddleware,
  enrollmentController.getCourseStudents
);

router.put(
  "/:id/status",
  authMiddleware,
  enrollmentController.updateStatus
);

router.delete(
  "/:id",
  authMiddleware,
  enrollmentController.remove
);

module.exports = router;