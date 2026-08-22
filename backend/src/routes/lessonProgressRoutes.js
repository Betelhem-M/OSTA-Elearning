const express = require("express");

const lessonProgressController = require("../controllers/lessonProgressController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/my",
  authMiddleware,
  lessonProgressController.getMyProgress
);

router.get(
  "/lesson/:lessonId",
  authMiddleware,
  lessonProgressController.getLessonProgress
);

router.put(
  "/lesson/:lessonId",
  authMiddleware,
  lessonProgressController.updateProgress
);

router.put(
  "/lesson/:lessonId/complete",
  authMiddleware,
  lessonProgressController.completeLesson
);

module.exports = router;