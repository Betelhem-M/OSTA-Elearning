const express = require("express");

const innovationController = require("../controllers/innovationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/ideas", innovationController.getIdeas);

router.get("/ideas/:id", innovationController.getIdea);

router.post(
  "/ideas",
  authMiddleware,
  innovationController.createIdea
);

router.post(
  "/ideas/:id/vote",
  authMiddleware,
  innovationController.voteIdea
);

router.get("/startups", innovationController.getStartups);

router.post(
  "/startups",
  authMiddleware,
  innovationController.createStartup
);

module.exports = router;