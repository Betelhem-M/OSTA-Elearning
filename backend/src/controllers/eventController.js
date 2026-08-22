const Event = require("../models/Event");

const eventController = {
  async getAll(req, res) {
    try {
      const events = await Event.findAll();
      res.json(events);
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({
        message: "Failed to fetch events",
      });
    }
  },

  async getById(req, res) {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({
          message: "Event not found",
        });
      }

      res.json(event);
    } catch (error) {
      console.error("Get event error:", error);
      res.status(500).json({
        message: "Failed to fetch event",
      });
    }
  },

  async create(req, res) {
    try {
      if (
        req.user.role !== "admin" &&
        req.user.role !== "instructor"
      ) {
        return res.status(403).json({
          message: "Only instructors and admins can create events",
        });
      }

      const {
        title,
        description,
        eventDate,
        eventTime,
        location,
        category,
      } = req.body;

      if (!title || !eventDate) {
        return res.status(400).json({
          message: "Title and event date are required",
        });
      }

      const id = await Event.create({
        title,
        description,
        eventDate,
        eventTime,
        location,
        category,
        createdBy: req.user.id,
      });

      const event = await Event.findById(id);

      res.status(201).json({
        message: "Event created successfully",
        event,
      });
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({
        message: "Failed to create event",
      });
    }
  },

  async update(req, res) {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({
          message: "Event not found",
        });
      }

      if (
        req.user.role !== "admin" &&
        event.created_by !== req.user.id
      ) {
        return res.status(403).json({
          message: "You are not allowed to update this event",
        });
      }

      await Event.update(req.params.id, req.body);

      const updatedEvent = await Event.findById(req.params.id);

      res.json({
        message: "Event updated successfully",
        event: updatedEvent,
      });
    } catch (error) {
      console.error("Update event error:", error);
      res.status(500).json({
        message: "Failed to update event",
      });
    }
  },

  async delete(req, res) {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({
          message: "Event not found",
        });
      }

      if (
        req.user.role !== "admin" &&
        event.created_by !== req.user.id
      ) {
        return res.status(403).json({
          message: "You are not allowed to delete this event",
        });
      }

      await Event.delete(req.params.id);

      res.json({
        message: "Event deleted successfully",
      });
    } catch (error) {
      console.error("Delete event error:", error);
      res.status(500).json({
        message: "Failed to delete event",
      });
    }
  },
};

module.exports = eventController;