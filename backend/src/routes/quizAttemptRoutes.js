const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const controller = require("../controllers/quizAttemptController");

const {
  saveAnswerValidator,
} = require("../validators/quizAttemptValidator");

// ============================================================
// STUDENT QUIZ ATTEMPTS
// ============================================================

// Start / resume quiz
router.post(
  "/quizzes/:quizId/attempts",
  authMiddleware,
  controller.startAttempt
);

// Get student's attempts for a quiz
router.get(
  "/quizzes/:quizId/attempts/me",
  authMiddleware,
  controller.getMyAttempts
);

// Get a specific attempt
router.get(
  "/quiz-attempts/:attemptId",
  authMiddleware,
  controller.getAttempt
);

// Save / update answer
router.put(
  "/quiz-attempts/:attemptId/answers",
  authMiddleware,
  saveAnswerValidator,
  controller.saveAnswer
);

// Submit attempt
router.post(
  "/quiz-attempts/:attemptId/submit",
  authMiddleware,
  controller.submitAttempt
);

// ============================================================
// INSTRUCTOR / ADMIN
// ============================================================

// View all attempts for a quiz
router.get(
  "/quizzes/:quizId/attempts",
  authMiddleware,
  controller.getQuizAttempts
);

module.exports = router;