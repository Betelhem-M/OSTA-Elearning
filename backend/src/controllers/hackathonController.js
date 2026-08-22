const Hackathon = require("../models/Hackathon");

const hackathonController = {
  async getAll(req, res) {
    try {
      const hackathons = await Hackathon.findAll();
      res.json(hackathons);
    } catch (error) {
      console.error("Get hackathons error:", error);
      res.status(500).json({
        message: "Failed to fetch hackathons",
      });
    }
  },

  async getById(req, res) {
    try {
      const hackathon = await Hackathon.findById(req.params.id);

      if (!hackathon) {
        return res.status(404).json({
          message: "Hackathon not found",
        });
      }

      res.json(hackathon);
    } catch (error) {
      console.error("Get hackathon error:", error);
      res.status(500).json({
        message: "Failed to fetch hackathon",
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
          message: "Only instructors and admins can create hackathons",
        });
      }

      const {
        title,
        description,
        category,
        deadline,
        prize,
        status,
      } = req.body;

      if (!title || !deadline) {
        return res.status(400).json({
          message: "Title and deadline are required",
        });
      }

      const id = await Hackathon.create({
        title,
        description,
        category,
        deadline,
        prize,
        status,
        createdBy: req.user.id,
      });

      const hackathon = await Hackathon.findById(id);

      res.status(201).json({
        message: "Hackathon created successfully",
        hackathon,
      });
    } catch (error) {
      console.error("Create hackathon error:", error);
      res.status(500).json({
        message: "Failed to create hackathon",
      });
    }
  },

  async update(req, res) {
    try {
      const hackathon = await Hackathon.findById(req.params.id);

      if (!hackathon) {
        return res.status(404).json({
          message: "Hackathon not found",
        });
      }

      if (
        req.user.role !== "admin" &&
        hackathon.created_by !== req.user.id
      ) {
        return res.status(403).json({
          message: "You are not allowed to update this hackathon",
        });
      }

      await Hackathon.update(req.params.id, req.body);

      const updatedHackathon = await Hackathon.findById(
        req.params.id
      );

      res.json({
        message: "Hackathon updated successfully",
        hackathon: updatedHackathon,
      });
    } catch (error) {
      console.error("Update hackathon error:", error);
      res.status(500).json({
        message: "Failed to update hackathon",
      });
    }
  },

  async delete(req, res) {
    try {
      const hackathon = await Hackathon.findById(req.params.id);

      if (!hackathon) {
        return res.status(404).json({
          message: "Hackathon not found",
        });
      }

      if (
        req.user.role !== "admin" &&
        hackathon.created_by !== req.user.id
      ) {
        return res.status(403).json({
          message: "You are not allowed to delete this hackathon",
        });
      }

      await Hackathon.delete(req.params.id);

      res.json({
        message: "Hackathon deleted successfully",
      });
    } catch (error) {
      console.error("Delete hackathon error:", error);
      res.status(500).json({
        message: "Failed to delete hackathon",
      });
    }
  },
};

module.exports = hackathonController;