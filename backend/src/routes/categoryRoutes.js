const express = require("express");

const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", categoryController.getAll);

router.post("/", authMiddleware, categoryController.create);

module.exports = router;