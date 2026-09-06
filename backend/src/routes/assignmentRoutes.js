const express = require("express");

const auth = require("../middleware/authMiddleware");
const roles = require("../middleware/roleMiddleware");

const controller = require("../controllers/assignmentController");

const uploadAssignmentAttachment = require(
  "../middleware/assignmentUploadMiddleware"
);

const uploadSubmissionFiles = require(
  "../middleware/submissionUploadMiddleware"
);

const router = express.Router();

/**
 * =========================================================
 * AUTHENTICATION
 * All assignment routes require login
 * =========================================================
 */
router.use(auth);

/**
 * =========================================================
 * INSTRUCTOR / ADMIN
 * CREATE ASSIGNMENT
 * =========================================================
 *
 * POST /api/assignments
 */
router.post(
  "/",
  roles("instructor", "admin"),
  uploadAssignmentAttachment.single("attachment"),
  controller.createAssignment
);

/**
 * =========================================================
 * INSTRUCTOR / ADMIN
 * GET OWN ASSIGNMENTS
 * =========================================================
 *
 * GET /api/assignments/instructor
 */
router.get(
  "/instructor",
  roles("instructor", "admin"),
  controller.getInstructorAssignments
);

/**
 * =========================================================
 * INSTRUCTOR / ADMIN
 * GET ALL SUBMISSIONS
 * =========================================================
 *
 * GET /api/assignments/submissions
 */
router.get(
  "/submissions",
  roles("instructor", "admin"),
  controller.getInstructorSubmissions
);

/**
 * =========================================================
 * INSTRUCTOR / ADMIN
 * GET SINGLE SUBMISSION
 * =========================================================
 *
 * GET /api/assignments/submissions/:id
 */
router.get(
  "/submissions/:id",
  roles("instructor", "admin"),
  controller.getSubmissionById
);

/**
 * =========================================================
 * STUDENT
 * GET ALL MY ASSIGNMENTS
 * =========================================================
 *
 * GET /api/assignments/my
 *
 * IMPORTANT:
 * This route MUST come before /:id.
 */
router.get(
  "/my",
  controller.getStudentAssignments
);

/**
 * =========================================================
 * STUDENT
 * GET MY SUBMISSION
 * =========================================================
 *
 * GET /api/assignments/:id/my-submission
 *
 * IMPORTANT:
 * This route MUST come before /:id.
 */
router.get(
  "/:id/my-submission",
  controller.getMySubmission
);

/**
 * =========================================================
 * STUDENT
 * GET MY ASSIGNMENT RESULT
 * =========================================================
 *
 * GET /api/assignments/:id/result
 */
router.get(
  "/:id/result",
  controller.getMyAssignmentResult
);

/**
 * =========================================================
 * STUDENT
 * SUBMIT ASSIGNMENT
 * =========================================================
 *
 * POST /api/assignments/:id/submit  (multipart, field "files")
 *
 * IMPORTANT:
 * This route MUST come before /:id.
 */
router.post(
  "/:id/submit",
  roles("student"),
  uploadSubmissionFiles.array("files", 10),
  controller.submitAssignment
);

/**
 * =========================================================
 * INSTRUCTOR (owner) OR ENROLLED STUDENT
 * DOWNLOAD ASSIGNMENT ATTACHMENT
 * =========================================================
 *
 * GET /api/assignments/:id/attachment
 *
 * IMPORTANT:
 * This route MUST come before /:id.
 */
router.get(
  "/:id/attachment",
  controller.downloadAssignmentAttachment
);

/**
 * =========================================================
 * STUDENT
 * GET SINGLE ASSIGNMENT
 * =========================================================
 *
 * GET /api/assignments/:id
 *
 * THIS FIXES YOUR CURRENT 404:
 *
 * GET http://localhost:5000/api/assignments/7
 */
router.get(
  "/:id",
  controller.getAssignmentById
);

/**
 * =========================================================
 * INSTRUCTOR / ADMIN
 * GRADE SUBMISSION
 * =========================================================
 *
 * PUT /api/assignments/submissions/:id/grade
 */
router.put(
  "/submissions/:id/grade",
  roles("instructor", "admin"),
  controller.gradeSubmission
);

/**
 * =========================================================
 * INSTRUCTOR (owner) OR SUBMITTING STUDENT
 * DOWNLOAD SUBMISSION FILE
 * =========================================================
 *
 * GET /api/assignments/submissions/:submissionId/files/:fileId
 */
router.get(
  "/submissions/:submissionId/files/:fileId",
  controller.downloadSubmissionFile
);

module.exports = router;