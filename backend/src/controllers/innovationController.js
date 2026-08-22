const InnovationIdea = require("../models/InnovationIdea");
const Startup = require("../models/Startup");

const innovationController = {
  async getIdeas(req, res) {
    try {
      const ideas = await InnovationIdea.findAll();
      res.json(ideas);
    } catch (error) {
      console.error("Get ideas error:", error);
      res.status(500).json({
        message: "Failed to fetch innovation ideas",
      });
    }
  },

  async getIdea(req, res) {
    try {
      const idea = await InnovationIdea.findById(req.params.id);

      if (!idea) {
        return res.status(404).json({
          message: "Innovation idea not found",
        });
      }

      res.json(idea);
    } catch (error) {
      console.error("Get idea error:", error);
      res.status(500).json({
        message: "Failed to fetch innovation idea",
      });
    }
  },

  async createIdea(req, res) {
    try {
      const { title, description, category } = req.body;

      if (!title) {
        return res.status(400).json({
          message: "Title is required",
        });
      }

      const id = await InnovationIdea.create({
        title,
        description,
        category,
        userId: req.user.id,
      });

      const idea = await InnovationIdea.findById(id);

      res.status(201).json({
        message: "Innovation idea submitted successfully",
        idea,
      });
    } catch (error) {
      console.error("Create idea error:", error);
      res.status(500).json({
        message: "Failed to submit innovation idea",
      });
    }
  },

  async voteIdea(req, res) {
    try {
      await InnovationIdea.vote(
        req.params.id,
        req.user.id
      );

      res.json({
        message: "Vote recorded successfully",
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "You already voted for this idea",
        });
      }

      console.error("Vote idea error:", error);
      res.status(500).json({
        message: "Failed to vote for idea",
      });
    }
  },

  async getStartups(req, res) {
    try {
      const startups = await Startup.findAll();
      res.json(startups);
    } catch (error) {
      console.error("Get startups error:", error);
      res.status(500).json({
        message: "Failed to fetch startups",
      });
    }
  },

  async createStartup(req, res) {
    try {
      const {
        name,
        description,
        category,
        stage,
        website,
      } = req.body;

      if (!name) {
        return res.status(400).json({
          message: "Startup name is required",
        });
      }

      const id = await Startup.create({
        name,
        description,
        founderId: req.user.id,
        category,
        stage,
        website,
      });

      const startup = await Startup.findById(id);

      res.status(201).json({
        message: "Startup created successfully",
        startup,
      });
    } catch (error) {
      console.error("Create startup error:", error);
      res.status(500).json({
        message: "Failed to create startup",
      });
    }
  },
};

module.exports = innovationController;