const express = require("express");

const courseController = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================================
// PUBLIC
// ==========================================================

router.get("/", courseController.getAll);

// ==========================================================
// AUTHENTICATED USER'S COURSES
// ==========================================================

router.get(
  "/my-courses",
  authMiddleware,
  courseController.getMyCourses
);

// ==========================================================
// INSTRUCTOR COURSES
// Alias used by QuizBuilder and instructor pages
// ==========================================================

router.get(
  "/instructor",
  authMiddleware,
  courseController.getMyCourses
);

// ==========================================================
// COURSE BY ID
// IMPORTANT: Keep this AFTER specific routes
// ==========================================================

router.get(
  "/:id",
  courseController.getById
);

// ==========================================================
// CREATE
// ==========================================================

router.post(
  "/",
  authMiddleware,
  courseController.create
);

// ==========================================================
// UPDATE
// ==========================================================

router.put(
  "/:id",
  authMiddleware,
  courseController.update
);

// ==========================================================
// DELETE
// ==========================================================

router.delete(
  "/:id",
  authMiddleware,
  courseController.delete
);

module.exports = router;