const Researcher =
  require("../models/Researcher");

const Publication =
  require("../models/Publication");

const User =
  require("../models/User");

const researchController = {
  // =====================================================
  // PUBLIC RESEARCHERS
  // =====================================================

  async getResearchers(req, res) {
    try {
      const researchers =
        await Researcher.findAll();

      return res.status(200).json(
        Array.isArray(researchers)
          ? researchers
          : []
      );
    } catch (error) {
      console.error(
        "Get researchers error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch researchers",
      });
    }
  },

  // =====================================================
  // RESEARCHER PROFILE
  // =====================================================

  async getResearcher(req, res) {
    try {
      const researcher =
        await Researcher.findById(
          req.params.id
        );

      if (!researcher) {
        return res.status(404).json({
          message:
            "Researcher not found",
        });
      }

      const publications =
        await Publication.findPublished();

      const researcherPublications =
        publications.filter(
          (publication) =>
            Number(
              publication.researcher_id
            ) ===
            Number(
              researcher.id
            )
        );

      return res.status(200).json({
        ...researcher,
        publications:
          researcherPublications,
      });
    } catch (error) {
      console.error(
        "Get researcher error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch researcher",
      });
    }
  },

  // =====================================================
  // PUBLIC PUBLISHED PUBLICATIONS
  // =====================================================

  async getPublications(req, res) {
    try {
      const publications =
        await Publication.findPublished();

      const publicData =
        publications.map(
          (publication) => ({
            id:
              publication.id,

            researcher_id:
              publication.researcher_id,

            title:
              publication.title,

            abstract:
              publication.abstract
                ? `${publication.abstract.slice(
                    0,
                    220
                  )}${
                    publication.abstract
                      .length >
                    220
                      ? "..."
                      : ""
                  }`
                : null,

            field:
              publication.field,

            publication_year:
              publication.publication_year,

            researcher_name:
              publication.researcher_name,

            status:
              publication.status,

            created_at:
              publication.created_at,

            updated_at:
              publication.updated_at,
          })
        );

      return res.status(200).json(
        publicData
      );
    } catch (error) {
      console.error(
        "Get public publications error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch publications",
      });
    }
  },

  // =====================================================
  // FULL PUBLICATION
  // RESEARCHER / ADMIN
  // =====================================================

  async getPublication(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          message:
            "Authentication required",
        });
      }

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

      const publication =
        await Publication.findById(
          req.params.id
        );

      if (!publication) {
        return res.status(404).json({
          message:
            "Publication not found",
        });
      }

      // Admin can see everything.
      if (
        user.role === "admin"
      ) {
        return res.status(200).json(
          publication
        );
      }

      // Researcher can see
      // their own publication.
      if (
        user.account_type ===
        "researcher"
      ) {
        const researcher =
          await Researcher.findByUserId(
            user.id
          );

        if (
          researcher &&
          Number(
            publication.researcher_id
          ) ===
            Number(
              researcher.id
            )
        ) {
          return res.status(200).json(
            publication
          );
        }

        // Other researchers can only
        // see already published work.
        if (
          publication.status ===
          "published"
        ) {
          return res.status(200).json(
            publication
          );
        }
      }

      return res.status(403).json({
        message:
          "You do not have access to this publication",
      });
    } catch (error) {
      console.error(
        "Get publication error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch publication",
      });
    }
  },

  // =====================================================
  // CREATE RESEARCHER PROFILE
  // =====================================================

  async createResearcher(req, res) {
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

      if (
        user.account_type !==
        "researcher"
      ) {
        return res.status(403).json({
          message:
            "Only researcher accounts can create a researcher profile",
        });
      }

      const existing =
        await Researcher.findByUserId(
          req.user.id
        );

      if (existing) {
        return res.status(409).json({
          message:
            "Researcher profile already exists",
        });
      }

      const {
        field,
        bio,
        affiliation,
      } = req.body;

      const researcherId =
        await Researcher.create({
          userId:
            req.user.id,
          field,
          bio,
          affiliation,
        });

      const researcher =
        await Researcher.findById(
          researcherId
        );

      return res.status(201).json({
        message:
          "Researcher profile created successfully",
        researcher,
      });
    } catch (error) {
      console.error(
        "Create researcher error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to create researcher profile",
      });
    }
  },

  // =====================================================
  // CREATE PUBLICATION
  // RESEARCHER ONLY
  // =====================================================

  async createPublication(req, res) {
    try {
      const user =
        await User.findById(
          req.user.id
        );

      if (
        !user ||
        user.account_type !==
          "researcher"
      ) {
        return res.status(403).json({
          message:
            "Only researcher accounts can create publications",
        });
      }

      const researcher =
        await Researcher.findByUserId(
          req.user.id
        );

      if (!researcher) {
        return res.status(400).json({
          message:
            "Create a researcher profile first",
        });
      }

      const {
        title,
        abstract,
        field,
        publicationYear,
        publicationUrl,
      } = req.body;

      const cleanTitle =
        String(
          title || ""
        ).trim();

      if (!cleanTitle) {
        return res.status(400).json({
          message:
            "Publication title is required",
        });
      }

      const publicationId =
        await Publication.create({
          researcherId:
            researcher.id,
          title:
            cleanTitle,
          abstract,
          field,
          publicationYear,
          publicationUrl,
          status:
            "pending",
        });

      const publication =
        await Publication.findById(
          publicationId
        );

      return res.status(201).json({
        message:
          "Publication submitted for review",
        publication,
      });
    } catch (error) {
      console.error(
        "Create publication error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to create publication",
      });
    }
  },

  // =====================================================
  // UPDATE PUBLICATION
  // OWNER ONLY
  // =====================================================

  async updatePublication(req, res) {
    try {
      const researcher =
        await Researcher.findByUserId(
          req.user.id
        );

      if (!researcher) {
        return res.status(403).json({
          message:
            "Researcher profile not found",
        });
      }

      const publication =
        await Publication.findById(
          req.params.id
        );

      if (!publication) {
        return res.status(404).json({
          message:
            "Publication not found",
        });
      }

      if (
        Number(
          publication.researcher_id
        ) !==
        Number(
          researcher.id
        )
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to update this publication",
        });
      }

      await Publication.update(
        req.params.id,
        req.body
      );

      // Any content modification
      // goes back to review.
      await Publication.updateStatus(
        req.params.id,
        "pending"
      );

      const updatedPublication =
        await Publication.findById(
          req.params.id
        );

      return res.status(200).json({
        message:
          "Publication updated and submitted for review",
        publication:
          updatedPublication,
      });
    } catch (error) {
      console.error(
        "Update publication error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update publication",
      });
    }
  },

  // =====================================================
  // DELETE PUBLICATION
  // OWNER / ADMIN
  // =====================================================

  async deletePublication(req, res) {
    try {
      const publication =
        await Publication.findById(
          req.params.id
        );

      if (!publication) {
        return res.status(404).json({
          message:
            "Publication not found",
        });
      }

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

      if (
        user.role ===
        "admin"
      ) {
        await Publication.delete(
          req.params.id
        );

        return res.status(200).json({
          message:
            "Publication deleted successfully",
        });
      }

      const researcher =
        await Researcher.findByUserId(
          req.user.id
        );

      if (
        !researcher ||
        Number(
          publication.researcher_id
        ) !==
          Number(
            researcher.id
          )
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to delete this publication",
        });
      }

      await Publication.delete(
        req.params.id
      );

      return res.status(200).json({
        message:
          "Publication deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete publication error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to delete publication",
      });
    }
  },

  // =====================================================
  // ADMIN: GET ALL
  // =====================================================

  async getAllForAdmin(req, res) {
    try {
      if (
        req.user.role !==
        "admin"
      ) {
        return res.status(403).json({
          message:
            "Admin access required",
        });
      }

      const publications =
        await Publication.findAll();

      return res.status(200).json(
        publications
      );
    } catch (error) {
      console.error(
        "Get admin publications error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch publications",
      });
    }
  },

  // =====================================================
  // ADMIN: CHANGE STATUS
  // =====================================================

  async updatePublicationStatus(
    req,
    res
  ) {
    try {
      if (
        req.user.role !==
        "admin"
      ) {
        return res.status(403).json({
          message:
            "Admin access required",
        });
      }

      const allowedStatuses = [
        "draft",
        "pending",
        "published",
        "rejected",
      ];

      const {
        status,
      } = req.body;

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid publication status",
        });
      }

      const publication =
        await Publication.findById(
          req.params.id
        );

      if (!publication) {
        return res.status(404).json({
          message:
            "Publication not found",
        });
      }

      await Publication.updateStatus(
        req.params.id,
        status
      );

      const updatedPublication =
        await Publication.findById(
          req.params.id
        );

      return res.status(200).json({
        message:
          `Publication status changed to ${status}`,
        publication:
          updatedPublication,
      });
    } catch (error) {
      console.error(
        "Update publication status error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update publication status",
      });
    }
  },
};

module.exports =
  researchController;