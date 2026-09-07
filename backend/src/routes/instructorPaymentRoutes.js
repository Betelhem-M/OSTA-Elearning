const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const controller = require("../controllers/instructorPaymentController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", controller.list);
router.put("/", controller.save);
router.put("/:id/verify", controller.verify);

module.exports = router;
