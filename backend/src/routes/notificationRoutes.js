const express = require("express");
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/my",
  authMiddleware,
  notificationController.getMyNotifications
);

router.put(
  "/:id/read",
  authMiddleware,
  notificationController.markRead
);

router.delete(
  "/:id",
  authMiddleware,
  notificationController.delete
);

module.exports = router;