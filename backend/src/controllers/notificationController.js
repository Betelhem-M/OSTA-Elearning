const Notification = require("../models/Notification");

const notificationController = {
  async getMyNotifications(req, res) {
    try {
      const notifications = await Notification.findByUser(req.user.id);
      res.json(notifications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  },

  async markRead(req, res) {
    try {
      const updated = await Notification.markRead(
        req.params.id,
        req.user.id
      );

      if (!updated) {
        return res.status(404).json({
          message: "Notification not found",
        });
      }

      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to update notification",
      });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await Notification.delete(
        req.params.id,
        req.user.id
      );

      if (!deleted) {
        return res.status(404).json({
          message: "Notification not found",
        });
      }

      res.json({ message: "Notification deleted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to delete notification",
      });
    }
  },
};

module.exports = notificationController;