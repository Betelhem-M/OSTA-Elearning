const express = require("express");

const innovationController =
  require("../controllers/innovationController");

const authMiddleware =
  require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// PUBLIC
// =====================================================

// Published innovation ideas
router.get(
  "/ideas",
  innovationController.getIdeas
);

// Published innovation idea details
router.get(
  "/ideas/:id",
  innovationController.getIdea
);

// Public startups
router.get(
  "/startups",
  innovationController.getStartups
);

// =====================================================
// AUTHENTICATED
// =====================================================

// Vote for an idea
router.post(
  "/ideas/:id/vote",
  authMiddleware,
  innovationController.voteIdea
);

// =====================================================
// INNOVATOR ONLY
// account_type = entrepreneur
// =====================================================

// Submit innovation idea
router.post(
  "/ideas",
  authMiddleware,
  innovationController.createIdea
);

// Submit startup
router.post(
  "/startups",
  authMiddleware,
  innovationController.createStartup
);

module.exports = router;