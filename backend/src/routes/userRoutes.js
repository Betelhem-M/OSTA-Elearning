const express = require("express");

const userController =
  require("../controllers/userController");

const authMiddleware =
  require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// CURRENT USER
// =====================================================

router.get(
  "/me",
  authMiddleware,
  userController.getMe
);

// =====================================================
// UPDATE PROFILE
// =====================================================

router.put(
  "/me",
  authMiddleware,
  userController.updateProfile
);

// =====================================================
// CHANGE PASSWORD
// =====================================================

router.put(
  "/me/password",
  authMiddleware,
  userController.changePassword
);

module.exports = router;