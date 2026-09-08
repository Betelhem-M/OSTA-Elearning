const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const aiTutorController = require("../controllers/aiTutorController");

const router = express.Router();

router.post("/chat", authMiddleware, aiTutorController.chat);

module.exports = router;
