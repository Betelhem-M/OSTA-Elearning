const express = require("express");

const certificateController = require("../controllers/certificateController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/my",
  authMiddleware,
  certificateController.getMyCertificates
);

router.get(
  "/:id",
  authMiddleware,
  certificateController.getById
);

router.post(
  "/issue",
  authMiddleware,
  certificateController.issue
);

module.exports = router;