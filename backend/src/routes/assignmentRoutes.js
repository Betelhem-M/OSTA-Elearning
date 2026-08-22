const express = require("express");

const assignmentController = require("../controllers/assignmentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/course/:courseId",
  assignmentController.getByCourse
);

router.get(
  "/:assignmentId/submissions",
  authMiddleware,
  assignmentController.getSubmissions
);

router.post(
  "/:assignmentId/submit",
  authMiddleware,
  assignmentController.submit
);

router.put(
  "/submissions/:submissionId/grade",
  authMiddleware,
  assignmentController.gradeSubmission
);

router.post(
  "/",
  authMiddleware,
  assignmentController.create
);

router.put(
  "/:id",
  authMiddleware,
  assignmentController.update
);

router.delete(
  "/:id",
  authMiddleware,
  assignmentController.delete
);

router.get(
  "/:id",
  assignmentController.getById
);

module.exports = router;