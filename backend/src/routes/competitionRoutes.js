const express = require("express");

const competitionController = require("../controllers/competitionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", competitionController.getAll);
router.get("/:id", competitionController.getById);

router.post(
  "/",
  authMiddleware,
  competitionController.create
);

router.post(
  "/:id/join",
  authMiddleware,
  competitionController.join
);

router.get(
  "/:id/leaderboard",
  competitionController.leaderboard
);

module.exports = router;