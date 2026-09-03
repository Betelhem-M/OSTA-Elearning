const express = require("express");

const {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getQuizzesByCourse,
  updateQuiz,
  updateQuizStatus,
  deleteQuiz,
  publishQuiz,
} = require("../controllers/quizController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// PUBLIC ROUTES
// =====================================================

router.get(
  "/",
  getAllQuizzes
);

router.get(
  "/course/:courseId",
  getQuizzesByCourse
);

router.get(
  "/:id",
  getQuizById
);

// =====================================================
// PROTECTED ROUTES
// =====================================================

// Create quiz
router.post(
  "/",
  authMiddleware,
  createQuiz
);

// Update quiz
router.patch(
  "/:id",
  authMiddleware,
  updateQuiz
);

// Publish quiz
router.patch(
  "/:id/publish",
  authMiddleware,
  publishQuiz
);

// Update quiz status
router.patch(
  "/:id/status",
  authMiddleware,
  updateQuizStatus
);

// Delete quiz
router.delete(
  "/:id",
  authMiddleware,
  deleteQuiz
);

module.exports = router;