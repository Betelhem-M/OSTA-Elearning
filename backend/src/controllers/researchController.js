const Researcher = require("../models/Researcher");
const Publication = require("../models/Publication");

const researchController = {
  async getResearchers(req, res) {
    try {
      const researchers = await Researcher.findAll();
      res.json(researchers);
    } catch (error) {
      console.error("Get researchers error:", error);
      res.status(500).json({
        message: "Failed to fetch researchers",
      });
    }
  },

  async getResearcher(req, res) {
    try {
      const researcher = await Researcher.findById(req.params.id);

      if (!researcher) {
        return res.status(404).json({
          message: "Researcher not found",
        });
      }

      const publications = await Publication.findByResearcher(
        researcher.id
      );

      res.json({
        ...researcher,
        publications,
      });
    } catch (error) {
      console.error("Get researcher error:", error);
      res.status(500).json({
        message: "Failed to fetch researcher",
      });
    }
  },

  async createResearcher(req, res) {
    try {
      const existing = await Researcher.findByUserId(req.user.id);

      if (existing) {
        return res.status(409).json({
          message: "Researcher profile already exists",
        });
      }

      const {
        field,
        bio,
        affiliation,
      } = req.body;

      const researcherId = await Researcher.create({
        userId: req.user.id,
        field,
        bio,
        affiliation,
      });

      const researcher = await Researcher.findById(researcherId);

      res.status(201).json({
        message: "Researcher profile created successfully",
        researcher,
      });
    } catch (error) {
      console.error("Create researcher error:", error);
      res.status(500).json({
        message: "Failed to create researcher profile",
      });
    }
  },

  async createPublication(req, res) {
    try {
      const researcher = await Researcher.findByUserId(req.user.id);

      if (!researcher) {
        return res.status(400).json({
          message: "Create a researcher profile first",
        });
      }

      const {
        title,
        abstract,
        field,
        publicationYear,
        publicationUrl,
      } = req.body;

      if (!title) {
        return res.status(400).json({
          message: "Publication title is required",
        });
      }

      const publicationId = await Publication.create({
        researcherId: researcher.id,
        title,
        abstract,
        field,
        publicationYear,
        publicationUrl,
      });

      const publication = await Publication.findById(
        publicationId
      );

      res.status(201).json({
        message: "Publication created successfully",
        publication,
      });
    } catch (error) {
      console.error("Create publication error:", error);
      res.status(500).json({
        message: "Failed to create publication",
      });
    }
  },

  async updatePublication(req, res) {
    try {
      const researcher = await Researcher.findByUserId(req.user.id);

      if (!researcher) {
        return res.status(403).json({
          message: "Researcher profile not found",
        });
      }

      const publication = await Publication.findById(
        req.params.id
      );

      if (!publication) {
        return res.status(404).json({
          message: "Publication not found",
        });
      }

      if (publication.researcher_id !== researcher.id) {
        return res.status(403).json({
          message: "You are not allowed to update this publication",
        });
      }

      await Publication.update(
        req.params.id,
        req.body
      );

      const updatedPublication =
        await Publication.findById(req.params.id);

      res.json({
        message: "Publication updated successfully",
        publication: updatedPublication,
      });
    } catch (error) {
      console.error("Update publication error:", error);
      res.status(500).json({
        message: "Failed to update publication",
      });
    }
  },

  async deletePublication(req, res) {
    try {
      const researcher = await Researcher.findByUserId(req.user.id);

      if (!researcher) {
        return res.status(403).json({
          message: "Researcher profile not found",
        });
      }

      const publication = await Publication.findById(
        req.params.id
      );

      if (!publication) {
        return res.status(404).json({
          message: "Publication not found",
        });
      }

      if (publication.researcher_id !== researcher.id) {
        return res.status(403).json({
          message: "You are not allowed to delete this publication",
        });
      }

      await Publication.delete(req.params.id);

      res.json({
        message: "Publication deleted successfully",
      });
    } catch (error) {
      console.error("Delete publication error:", error);
      res.status(500).json({
        message: "Failed to delete publication",
      });
    }
  },
};

module.exports = researchController;