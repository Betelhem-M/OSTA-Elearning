const bcrypt = require("bcryptjs");
const User = require("../models/User");

const userController = {
  // =====================================================
  // GET CURRENT USER
  // =====================================================

  async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.status(200).json({
        user,
      });
    } catch (error) {
      console.error(
        "Get current user error:",
        error
      );

      return res.status(500).json({
        message: "Failed to fetch user profile",
      });
    }
  },

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;

      const {
        firstName,
        lastName,
        email,
        phone,
        region,
      } = req.body;

      // -------------------------------------------------
      // VALIDATION
      // -------------------------------------------------

      if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !region
      ) {
        return res.status(400).json({
          message:
            "First name, last name, email, phone, and region are required",
        });
      }

      // -------------------------------------------------
      // CHECK IF EMAIL BELONGS TO ANOTHER USER
      // -------------------------------------------------

      const existingUser =
        await User.findByEmail(email);

      if (
        existingUser &&
        Number(existingUser.id) !== Number(userId)
      ) {
        return res.status(409).json({
          message:
            "This email is already registered to another account",
        });
      }

      // -------------------------------------------------
      // UPDATE
      // -------------------------------------------------

      await User.updateProfile(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        region: region.trim(),
      });

      // -------------------------------------------------
      // GET UPDATED USER
      // -------------------------------------------------

      const updatedUser =
        await User.findById(userId);

      return res.status(200).json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      return res.status(500).json({
        message: "Failed to update profile",
      });
    }
  },

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  async changePassword(req, res) {
    try {
      const userId = req.user.id;

      const {
        currentPassword,
        newPassword,
      } = req.body;

      // -------------------------------------------------
      // VALIDATION
      // -------------------------------------------------

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message:
            "Current password and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message:
            "New password must be at least 6 characters",
        });
      }

      // -------------------------------------------------
      // GET USER INCLUDING PASSWORD
      // -------------------------------------------------

      const user = await User.findByEmail(
        req.user.email
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // -------------------------------------------------
      // CHECK CURRENT PASSWORD
      // -------------------------------------------------

      const passwordMatch =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!passwordMatch) {
        return res.status(400).json({
          message: "Current password is incorrect",
        });
      }

      // -------------------------------------------------
      // HASH NEW PASSWORD
      // -------------------------------------------------

      const hashedPassword =
        await bcrypt.hash(newPassword, 10);

      // -------------------------------------------------
      // UPDATE PASSWORD
      // -------------------------------------------------

      await User.updatePassword(
        userId,
        hashedPassword
      );

      return res.status(200).json({
        message:
          "Password changed successfully",
      });
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to change password",
      });
    }
  },
};

module.exports = userController;