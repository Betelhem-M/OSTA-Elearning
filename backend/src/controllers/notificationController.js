const Notification =
  require("../models/Notification");

const notificationController = {
  async getMyNotifications(
    req,
    res
  ) {
    try {
      const notifications =
        await Notification.findByUser(
          req.user.id
        );

      return res.status(200).json(
        Array.isArray(
          notifications
        )
          ? notifications
          : []
      );
    } catch (error) {
      console.error(
        "Get notifications error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch notifications",
      });
    }
  },

  async markRead(
    req,
    res
  ) {
    try {
      const id =
        Number(
          req.params.id
        );

      if (
        !Number.isInteger(id)
      ) {
        return res.status(400).json({
          message:
            "Invalid notification ID",
        });
      }

      const updated =
        await Notification.markRead(
          id,
          req.user.id
        );

      if (!updated) {
        return res.status(404).json({
          message:
            "Notification not found",
        });
      }

      return res.status(200).json({
        message:
          "Notification marked as read",
      });
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update notification",
      });
    }
  },

  async markAllRead(
    req,
    res
  ) {
    try {
      const updated =
        await Notification.markAllRead(
          req.user.id
        );

      return res.status(200).json({
        message:
          "All notifications marked as read",
        updated,
      });
    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to mark notifications as read",
      });
    }
  },

  async delete(
    req,
    res
  ) {
    try {
      const id =
        Number(
          req.params.id
        );

      if (
        !Number.isInteger(id)
      ) {
        return res.status(400).json({
          message:
            "Invalid notification ID",
        });
      }

      const deleted =
        await Notification.delete(
          id,
          req.user.id
        );

      if (!deleted) {
        return res.status(404).json({
          message:
            "Notification not found",
        });
      }

      return res.status(200).json({
        message:
          "Notification deleted",
      });
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to delete notification",
      });
    }
  },
};

module.exports =
  notificationController;