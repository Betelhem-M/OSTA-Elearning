const express = require("express");

const competitionController = require("../controllers/competitionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// PUBLIC
// ============================================================

router.get(
  "/",
  competitionController.getAll
);

// ============================================================
// ADMIN
// IMPORTANT: /admin MUST COME BEFORE /:id
// ============================================================

router.get(
  "/admin",
  authMiddleware,
  competitionController.getAllAdmin
);

// ============================================================
// SINGLE COMPETITION
// ============================================================

router.get(
  "/:id",
  competitionController.getById
);

// ============================================================
// PARTICIPANTS
// ============================================================

router.get(
  "/:id/participants",
  authMiddleware,
  competitionController.getParticipants
);

// ============================================================
// LEADERBOARD
// ============================================================

router.get(
  "/:id/leaderboard",
  authMiddleware,
  competitionController.getLeaderboard
);

// ============================================================
// SUBMISSIONS
// ============================================================

router.get(
  "/:id/submissions",
  authMiddleware,
  competitionController.getSubmissions
);

// ============================================================
// JOIN
// ============================================================

router.post(
  "/:id/join",
  authMiddleware,
  competitionController.join
);

// ============================================================
// SCORE
// ============================================================

router.patch(
  "/:id/participants/:participantId/score",
  authMiddleware,
  competitionController.updateParticipantScore
);

// ============================================================
// CREATE
// ============================================================

router.post(
  "/",
  authMiddleware,
  competitionController.create
);

// ============================================================
// UPDATE
// ============================================================

router.put(
  "/:id",
  authMiddleware,
  competitionController.update
);

// ============================================================
// STATUS
// ============================================================

router.patch(
  "/:id/status",
  authMiddleware,
  competitionController.updateStatus
);

// ============================================================
// DELETE
// ============================================================

router.delete(
  "/:id",
  authMiddleware,
  competitionController.delete
);

module.exports = router;