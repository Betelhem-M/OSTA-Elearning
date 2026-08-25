const express = require("express");

const quizController =
  require("../controllers/quizController");

const authMiddleware =
  require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// GET MY QUIZ ATTEMPTS
// MUST COME BEFORE /:id
// =====================================================

router.get(
  "/my/attempts",
  authMiddleware,
  quizController.getMyAttempts
);

// =====================================================
// GET QUIZ ATTEMPT
// =====================================================

router.get(
  "/attempts/:attemptId",
  authMiddleware,
  quizController.getAttempt
);

// =====================================================
// SAVE ANSWER
// =====================================================

router.post(
  "/attempts/:attemptId/answers",
  authMiddleware,
  quizController.saveAnswer
);

// =====================================================
// SUBMIT ATTEMPT
// =====================================================

router.post(
  "/attempts/:attemptId/submit",
  authMiddleware,
  quizController.submitAttempt
);

// =====================================================
// START ATTEMPT
// =====================================================

router.post(
  "/:quizId/attempts",
  authMiddleware,
  quizController.startAttempt
);

// =====================================================
// GET QUIZZES BY COURSE
// MUST COME BEFORE /:id
// =====================================================

router.get(
  "/course/:courseId",
  quizController.getByCourse
);

// =====================================================
// GET QUIZ BY ID
// =====================================================

router.get(
  "/:id",
  quizController.getById
);

// =====================================================
// CREATE QUIZ
// =====================================================

router.post(
  "/",
  authMiddleware,
  quizController.create
);

// =====================================================
// ADD QUESTION
// =====================================================

router.post(
  "/:quizId/questions",
  authMiddleware,
  quizController.addQuestion
);

module.exports = router;