const express = require("express");

const lessonController =
  require("../controllers/lessonController");

const authMiddleware =
  require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// GET LESSONS BY SECTION
// IMPORTANT: This must come BEFORE /:id
// =====================================================

router.get(
  "/section/:sectionId",
  lessonController.getBySection
);

// =====================================================
// GET LESSON BY ID
// =====================================================

router.get(
  "/:id",
  lessonController.getById
);

// =====================================================
// CREATE LESSON
// =====================================================

router.post(
  "/",
  authMiddleware,
  lessonController.create
);

// =====================================================
// UPDATE LESSON
// =====================================================

router.put(
  "/:id",
  authMiddleware,
  lessonController.update
);

// =====================================================
// DELETE LESSON
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  lessonController.delete
);

module.exports = router;