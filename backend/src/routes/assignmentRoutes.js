const express = require("express");

const assignmentController =
  require("../controllers/assignmentController");

const authMiddleware =
  require("../middleware/authMiddleware");

const roleMiddleware =
  require("../middleware/roleMiddleware");

const upload =
  require("../middleware/uploadMiddleware");

const router = express.Router();

// =====================================================
// GET ASSIGNMENTS BY COURSE
// =====================================================

router.get(
  "/course/:courseId",
  assignmentController.getByCourse
);

// =====================================================
// GET MY SUBMISSION
// MUST COME BEFORE /:id
// =====================================================

router.get(
  "/:assignmentId/my-submission",
  authMiddleware,
  assignmentController.getMySubmission
);

// =====================================================
// GET SUBMISSIONS
// INSTRUCTOR / ADMIN
// =====================================================

router.get(
  "/:assignmentId/submissions",
  authMiddleware,
  roleMiddleware(
    "instructor",
    "admin"
  ),
  assignmentController.getSubmissions
);

// =====================================================
// SUBMIT ASSIGNMENT
// STUDENT
// =====================================================

router.post(
  "/:assignmentId/submit",
  authMiddleware,
  upload.array("files", 5),
  assignmentController.submit
);

// =====================================================
// GRADE SUBMISSION
// =====================================================

router.put(
  "/submissions/:submissionId/grade",
  authMiddleware,
  roleMiddleware(
    "instructor",
    "admin"
  ),
  assignmentController.gradeSubmission
);

// =====================================================
// CREATE
// =====================================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware(
    "instructor",
    "admin"
  ),
  assignmentController.create
);

// =====================================================
// UPDATE
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "instructor",
    "admin"
  ),
  assignmentController.update
);

// =====================================================
// DELETE
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(
    "instructor",
    "admin"
  ),
  assignmentController.delete
);

// =====================================================
// GET ASSIGNMENT BY ID
// ALWAYS LAST
// =====================================================

router.get(
  "/:id",
  assignmentController.getById
);

module.exports = router;