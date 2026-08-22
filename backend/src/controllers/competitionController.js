const Competition = require("../models/Competition");

const competitionController = {
  async getAll(req, res) {
    try {
      const competitions = await Competition.findAll();
      res.json(competitions);
    } catch (error) {
      console.error("Get competitions error:", error);
      res.status(500).json({
        message: "Failed to fetch competitions",
      });
    }
  },

  async getById(req, res) {
    try {
      const competition = await Competition.findById(req.params.id);

      if (!competition) {
        return res.status(404).json({
          message: "Competition not found",
        });
      }

      res.json(competition);
    } catch (error) {
      console.error("Get competition error:", error);
      res.status(500).json({
        message: "Failed to fetch competition",
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
          message: "Only instructors and admins can create competitions",
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

      const id = await Competition.create({
        title,
        description,
        category,
        deadline,
        prize,
        createdBy: req.user.id,
        status,
      });

      const competition = await Competition.findById(id);

      res.status(201).json({
        message: "Competition created successfully",
        competition,
      });
    } catch (error) {
      console.error("Create competition error:", error);
      res.status(500).json({
        message: "Failed to create competition",
      });
    }
  },

  async join(req, res) {
    try {
      const competition = await Competition.findById(
        req.params.id
      );

      if (!competition) {
        return res.status(404).json({
          message: "Competition not found",
        });
      }

      const participantId = await Competition.join(
        req.params.id,
        req.user.id,
        req.body.teamName
      );

      res.status(201).json({
        message: "Successfully joined competition",
        participantId,
      });
    } catch (error) {
      console.error("Join competition error:", error);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "You already joined this competition",
        });
      }

      res.status(500).json({
        message: "Failed to join competition",
      });
    }
  },

  async leaderboard(req, res) {
    try {
      const leaderboard = await Competition.getLeaderboard(
        req.params.id
      );

      res.json(leaderboard);
    } catch (error) {
      console.error("Get leaderboard error:", error);
      res.status(500).json({
        message: "Failed to fetch leaderboard",
      });
    }
  },
};

module.exports = competitionController;