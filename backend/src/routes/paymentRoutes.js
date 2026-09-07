const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

router.get("/methods", paymentController.methods);
router.post("/", authMiddleware, paymentController.create);

module.exports = router;
