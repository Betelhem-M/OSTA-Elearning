const express =
  require("express");

const notificationController =
  require("../controllers/notificationController");

const authMiddleware =
  require("../middleware/authMiddleware");

const router =
  express.Router();

// =====================================================
// MY NOTIFICATIONS
// =====================================================

router.get(
  "/my",
  authMiddleware,
  notificationController.getMyNotifications
);

// =====================================================
// MARK ALL READ
// MUST COME BEFORE /:id
// =====================================================

router.put(
  "/my/read-all",
  authMiddleware,
  notificationController.markAllRead
);

// =====================================================
// MARK ONE READ
// =====================================================

router.put(
  "/:id/read",
  authMiddleware,
  notificationController.markRead
);

// =====================================================
// DELETE
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  notificationController.delete
);

module.exports =
  router;