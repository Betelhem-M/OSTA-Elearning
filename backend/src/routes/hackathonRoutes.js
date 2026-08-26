const express =
  require("express");

const hackathonController =
  require("../controllers/hackathonController");

const authMiddleware =
  require("../middleware/authMiddleware");

const router =
  express.Router();

// =====================================================
// PUBLIC
// =====================================================

router.get(
  "/",
  hackathonController.getAll
);

router.get(
  "/:id",
  hackathonController.getById
);

// =====================================================
// ADMIN / INSTRUCTOR MANAGEMENT
// Controller performs the permission check.
// =====================================================

router.post(
  "/",
  authMiddleware,
  hackathonController.create
);

router.put(
  "/:id",
  authMiddleware,
  hackathonController.update
);

router.delete(
  "/:id",
  authMiddleware,
  hackathonController.delete
);

module.exports =
  router;