const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const User = require("../models/User");

const userController = {
  // =====================================================
  // GET CURRENT USER
  // =====================================================

  async getMe(req, res) {
    try {
      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
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
        message:
          "Failed to fetch user profile",
      });
    }
  },

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  async updateProfile(req, res) {
    try {
      const userId =
        req.user.id;

      const {
        firstName,
        lastName,
        email,
        phone,
        region,
      } = req.body;

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

      const existingUser =
        await User.findByEmail(
          email.trim()
        );

      if (
        existingUser &&
        Number(existingUser.id) !==
          Number(userId)
      ) {
        return res.status(409).json({
          message:
            "This email is already registered to another account",
        });
      }

      await User.updateProfile(
        userId,
        {
          firstName:
            firstName.trim(),
          lastName:
            lastName.trim(),
          email:
            email.trim(),
          phone:
            phone.trim(),
          region:
            region.trim(),
        }
      );

      const updatedUser =
        await User.findById(
          userId
        );

      return res.status(200).json({
        message:
          "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update profile",
      });
    }
  },

  // =====================================================
  // UPLOAD PROFILE IMAGE
  // =====================================================

  async uploadProfileImage(
    req,
    res
  ) {
    try {
      if (!req.file) {
        return res.status(400).json({
          message:
            "Please choose a profile image",
        });
      }

      const currentUser =
        await User.findById(
          req.user.id
        );

      if (!currentUser) {
        if (
          req.file.path &&
          fs.existsSync(
            req.file.path
          )
        ) {
          fs.unlinkSync(
            req.file.path
          );
        }

        return res.status(404).json({
          message:
            "User not found",
        });
      }

      // Remove previous profile image
      if (
        currentUser.profile_image
      ) {
        const oldFilePath =
          path.join(
            process.cwd(),
            currentUser.profile_image.replace(
              /^\/+/,
              ""
            )
          );

        if (
          fs.existsSync(
            oldFilePath
          )
        ) {
          try {
            fs.unlinkSync(
              oldFilePath
            );
          } catch (fileError) {
            console.error(
              "Failed to remove old profile image:",
              fileError
            );
          }
        }
      }

      const relativePath =
        `/uploads/profiles/${req.file.filename}`;

      await User.updateProfileImage(
        req.user.id,
        relativePath
      );

      const updatedUser =
        await User.findById(
          req.user.id
        );

      return res.status(200).json({
        message:
          "Profile photo updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error(
        "Upload profile image error:",
        error
      );

      if (
        req.file?.path &&
        fs.existsSync(
          req.file.path
        )
      ) {
        try {
          fs.unlinkSync(
            req.file.path
          );
        } catch {}
      }

      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          message:
            "Profile photo must be 5 MB or smaller.",
        });
      }

      return res.status(400).json({
        message:
          error.message ||
          "Failed to upload profile photo",
      });
    }
  },

  // =====================================================
  // REMOVE PROFILE IMAGE
  // =====================================================

  async removeProfileImage(
    req,
    res
  ) {
    try {
      const currentUser =
        await User.findById(
          req.user.id
        );

      if (!currentUser) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      if (
        currentUser.profile_image
      ) {
        const filePath =
          path.join(
            process.cwd(),
            currentUser.profile_image.replace(
              /^\/+/,
              ""
            )
          );

        if (
          fs.existsSync(
            filePath
          )
        ) {
          try {
            fs.unlinkSync(
              filePath
            );
          } catch (
            fileError
          ) {
            console.error(
              "Failed to delete profile image:",
              fileError
            );
          }
        }
      }

      await User.removeProfileImage(
        req.user.id
      );

      const updatedUser =
        await User.findById(
          req.user.id
        );

      return res.status(200).json({
        message:
          "Profile photo removed successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error(
        "Remove profile image error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to remove profile photo",
      });
    }
  },

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  async changePassword(req, res) {
    try {
      const userId =
        req.user.id;

      const {
        currentPassword,
        newPassword,
      } = req.body;

      if (
        !currentPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          message:
            "Current password and new password are required",
        });
      }

      if (
        newPassword.length < 6
      ) {
        return res.status(400).json({
          message:
            "New password must be at least 6 characters",
        });
      }

      const user =
        await User.findByEmail(
          req.user.email
        );

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          currentPassword,
          user.password
        );

      if (!passwordMatch) {
        return res.status(400).json({
          message:
            "Current password is incorrect",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          newPassword,
          10
        );

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

module.exports =
  userController;