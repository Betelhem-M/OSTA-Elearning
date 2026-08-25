const express = require("express");

const noteController =
  require("../controllers/noteController");

const authMiddleware =
  require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// GET NOTES FOR A LESSON
// =====================================================

router.get(
  "/lesson/:lessonId",
  authMiddleware,
  noteController.getByLesson
);

// =====================================================
// CREATE NOTE
// =====================================================

router.post(
  "/lesson/:lessonId",
  authMiddleware,
  noteController.create
);

// =====================================================
// UPDATE NOTE
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  noteController.update
);

// =====================================================
// DELETE NOTE
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  noteController.delete
);

module.exports = router;