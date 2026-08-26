const InnovationIdea =
  require("../models/InnovationIdea");

const Startup =
  require("../models/Startup");

const User =
  require("../models/User");

// =====================================================
// HELPERS
// =====================================================

async function getCurrentUser(
  userId
) {
  const user =
    await User.findById(
      userId
    );

  return user;
}

function isInnovator(user) {
  return (
    user?.account_type ===
    "entrepreneur"
  );
}

function isStaff(user) {
  return (
    user?.role ===
      "admin" ||
    user?.role ===
      "instructor"
  );
}

const innovationController = {
  // =====================================================
  // PUBLIC IDEAS
  // =====================================================

  async getIdeas(req, res) {
    try {
      const ideas =
        await InnovationIdea.findPublished();

      return res.status(200).json(
        Array.isArray(ideas)
          ? ideas
          : []
      );
    } catch (error) {
      console.error(
        "Get published ideas error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch innovation ideas",
      });
    }
  },

  // =====================================================
  // PUBLIC IDEA DETAILS
  // =====================================================

  async getIdea(req, res) {
    try {
      const idea =
        await InnovationIdea.findPublishedById(
          req.params.id
        );

      if (!idea) {
        return res.status(404).json({
          message:
            "Innovation idea not found or not publicly available",
        });
      }

      return res.status(200).json(
        idea
      );
    } catch (error) {
      console.error(
        "Get idea error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch innovation idea",
      });
    }
  },

  // =====================================================
  // CREATE IDEA
  // INNOVATOR ONLY
  // =====================================================

  async createIdea(req, res) {
    try {
      const user =
        await getCurrentUser(
          req.user.id
        );

      if (!user) {
        return res.status(401).json({
          message:
            "User account could not be found",
        });
      }

      if (
        !isInnovator(user) &&
        !isStaff(user)
      ) {
        return res.status(403).json({
          message:
            "Only registered innovators can submit innovation ideas",
        });
      }

      const {
        title,
        description,
        category,
      } = req.body;

      const cleanTitle =
        String(
          title || ""
        ).trim();

      const cleanDescription =
        String(
          description || ""
        ).trim();

      if (
        !cleanTitle ||
        !cleanDescription
      ) {
        return res.status(400).json({
          message:
            "Title and description are required",
        });
      }

      const id =
        await InnovationIdea.create({
          title:
            cleanTitle,
          description:
            cleanDescription,
          category:
            category ||
            null,
          userId:
            req.user.id,
        });

      const idea =
        await InnovationIdea.findById(
          id
        );

      return res.status(201).json({
        message:
          "Innovation idea submitted for review",
        idea,
      });
    } catch (error) {
      console.error(
        "Create idea error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to submit innovation idea",
      });
    }
  },

  // =====================================================
  // VOTE
  // AUTHENTICATED USERS
  // =====================================================

  async voteIdea(req, res) {
    try {
      const user =
        await getCurrentUser(
          req.user.id
        );

      if (!user) {
        return res.status(401).json({
          message:
            "User account could not be found",
        });
      }

      await InnovationIdea.vote(
        req.params.id,
        req.user.id
      );

      return res.status(200).json({
        message:
          "Vote recorded successfully",
      });
    } catch (error) {
      if (
        error.code ===
        "ER_DUP_ENTRY"
      ) {
        return res.status(409).json({
          message:
            "You already voted for this idea",
        });
      }

      if (
        error.code ===
        "IDEA_NOT_PUBLIC"
      ) {
        return res.status(404).json({
          message:
            "This innovation idea is not publicly available",
        });
      }

      console.error(
        "Vote idea error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to vote for idea",
      });
    }
  },

  // =====================================================
  // PUBLIC STARTUPS
  // =====================================================

  async getStartups(req, res) {
    try {
      const startups =
        await Startup.findAll();

      return res.status(200).json(
        Array.isArray(
          startups
        )
          ? startups
          : []
      );
    } catch (error) {
      console.error(
        "Get startups error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch startups",
      });
    }
  },

  // =====================================================
  // CREATE STARTUP
  // INNOVATOR ONLY
  // =====================================================

  async createStartup(
    req,
    res
  ) {
    try {
      const user =
        await getCurrentUser(
          req.user.id
        );

      if (!user) {
        return res.status(401).json({
          message:
            "User account could not be found",
        });
      }

      if (
        !isInnovator(user) &&
        !isStaff(user)
      ) {
        return res.status(403).json({
          message:
            "Only registered innovators can submit startups",
        });
      }

      const {
        name,
        description,
        category,
        stage,
        website,
      } = req.body;

      const cleanName =
        String(
          name || ""
        ).trim();

      if (!cleanName) {
        return res.status(400).json({
          message:
            "Startup name is required",
        });
      }

      const id =
        await Startup.create({
          name:
            cleanName,
          description:
            String(
              description ||
                ""
            ).trim(),
          founderId:
            req.user.id,
          category:
            String(
              category ||
                ""
            ).trim(),
          stage:
            stage ||
            "Idea",
          website:
            String(
              website ||
                ""
            ).trim(),
        });

      const startup =
        await Startup.findById(
          id
        );

      return res.status(201).json({
        message:
          "Startup submitted successfully",
        startup,
      });
    } catch (error) {
      console.error(
        "Create startup error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to create startup",
      });
    }
  },
};

module.exports =
  innovationController;