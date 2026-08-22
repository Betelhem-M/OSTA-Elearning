const express = require("express");

const quizController = require("../controllers/quizController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:id", quizController.getById);

router.get(
  "/course/:courseId",
  quizController.getByCourse
);

router.post(
  "/",
  authMiddleware,
  quizController.create
);

router.post(
  "/:quizId/questions",
  authMiddleware,
  quizController.addQuestion
);

router.post(
  "/:quizId/attempts",
  authMiddleware,
  quizController.startAttempt
);

router.post(
  "/attempts/:attemptId/answers",
  authMiddleware,
  quizController.saveAnswer
);

router.post(
  "/attempts/:attemptId/submit",
  authMiddleware,
  quizController.submitAttempt
);

router.get(
  "/attempts/:attemptId",
  authMiddleware,
  quizController.getAttempt
);

router.get(
  "/my/attempts",
  authMiddleware,
  quizController.getMyAttempts
);

module.exports = router;