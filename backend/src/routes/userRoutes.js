const express = require("express");

const userController =
  require("../controllers/userController");

const authMiddleware =
  require("../middleware/authMiddleware");

const profileUpload =
  require("../middleware/profileUploadMiddleware");

const router =
  express.Router();

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
// UPLOAD PROFILE PHOTO
// =====================================================

router.post(
  "/me/profile-image",
  authMiddleware,
  profileUpload.single(
    "profileImage"
  ),
  userController.uploadProfileImage
);

// =====================================================
// REMOVE PROFILE PHOTO
// =====================================================

router.delete(
  "/me/profile-image",
  authMiddleware,
  userController.removeProfileImage
);

// =====================================================
// CHANGE PASSWORD
// =====================================================

router.put(
  "/me/password",
  authMiddleware,
  userController.changePassword
);

module.exports =
  router;