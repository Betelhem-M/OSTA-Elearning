const Competition = require("../models/Competition");

// ============================================================
// CONSTANTS
// ============================================================

const ALLOWED_STATUSES = [
  "draft",
  "published",
  "upcoming",
  "active",
  "completed",
  "cancelled",
];

// ============================================================
// HELPERS
// ============================================================

/**
 * Checks whether the authenticated user has the admin role.
 */
const isAdmin = (user) => user?.role === "admin";

/**
 * Checks whether the authenticated user has the instructor role.
 */
const isInstructor = (user) => user?.role === "instructor";

/**
 * Checks whether the authenticated user has the student role.
 */
const isStudent = (user) => user?.role === "student";

/**
 * Checks whether the authenticated user created the given competition.
 */
const isOwner = (competition, user) =>
  Number(competition.created_by) === Number(user.id);

/**
 * Admins can manage any competition. Instructors can only manage
 * competitions they created themselves.
 */
const canManage = (competition, user) =>
  isAdmin(user) || (isInstructor(user) && isOwner(competition, user));

/**
 * Validates that a route param is a positive integer ID.
 */
const isValidId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

/**
 * Validates the fields required to create or update a competition.
 * Returns an object keyed by field name; empty object means valid.
 */
const validateCompetitionInput = ({ title, deadline, status }) => {
  const errors = {};

  if (typeof title !== "string" || !title.trim()) {
    errors.title = "Title is required";
  }

  if (!deadline) {
    errors.deadline = "Deadline is required";
  } else if (Number.isNaN(new Date(deadline).getTime())) {
    errors.deadline = "Invalid deadline";
  }

  if (status && !ALLOWED_STATUSES.includes(status)) {
    errors.status = "Invalid competition status";
  }

  return errors;
};

// ============================================================
// CONTROLLER
// ============================================================

const competitionController = {
  // ==========================================================
  // PUBLIC — LIST
  // ==========================================================

  /**
   * GET /competitions
   * Returns all publicly visible competitions (drafts excluded).
   */
  async getAll(req, res) {
    try {
      const competitions = await Competition.findAllPublic();

      return res.status(200).json({
        success: true,
        count: competitions.length,
        competitions,
      });
    } catch (error) {
      console.error("Competition getAll:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch competitions",
      });
    }
  },

  // ==========================================================
  // ADMIN — LIST EVERYTHING
  // ==========================================================

  /**
   * GET /competitions/admin
   * Returns every competition, including drafts. Admin only.
   */
  async getAllAdmin(req, res) {
    try {
      if (!isAdmin(req.user)) {
        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      }

      const competitions = await Competition.findAllAdmin();

      return res.status(200).json({
        success: true,
        count: competitions.length,
        competitions,
      });
    } catch (error) {
      console.error("Competition admin getAll:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch competitions",
      });
    }
  },

  // ==========================================================
  // GET BY ID
  // ==========================================================

  /**
   * GET /competitions/:id
   * Returns a single competition. Drafts are treated as private
   * and return 404 to unauthenticated/public callers.
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid competition ID",
        });
      }

      const competition = await Competition.findById(id);

      if (!competition) {
        return res.status(404).json({
          success: false,
          message: "Competition not found",
        });
      }

      // Draft competitions are private.
      if (competition.status === "draft") {
        return res.status(404).json({
          success: false,
          message: "Competition is not publicly available",
        });
      }

      return res.status(200).json({
        success: true,
        competition,
      });
    } catch (error) {
      console.error("Competition getById:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch competition",
      });
    }
  },

  // ==========================================================
  // PARTICIPANTS
  // ==========================================================

  /**
   * GET /competitions/:id/participants
   */
  async getParticipants(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid competition ID",
        });
      }

      const competition = await Competition.findById(id);

      if (!competition) {
        return res.status(404).json({
          success: false,
          message: "Competition not found",
        });
      }

      const participants = await Competition.getParticipants(id);

      return res.status(200).json({
        success: true,
        participants,
      });
    } catch (error) {
      console.error("Competition participants:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch participants",
      });
    }
  },

  // ==========================================================
  // LEADERBOARD
  // ==========================================================

  /**
   * GET /competitions/:id/leaderboard
   */
  async getLeaderboard(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid competition ID",
        });
      }

      const competition = await Competition.findById(id);

      if (!competition) {
        return res.status(404).json({
          success: false,
          message: "Competition not found",
        });
      }

      const leaderboard = await Competition.getLeaderboard(id);

      return res.status(200).json({
        success: true,
        leaderboard,
      });
    } catch (error) {
      console.error("Competition leaderboard:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch leaderboard",
      });
    }
  },

  // ==========================================================
  // SUBMISSIONS
  // ==========================================================

  /**
   * GET /competitions/:id/submissions
   */
  async getSubmissions(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid competition ID",
        });
      }

      const competition = await Competition.findById(id);

      if (!competition) {
        return res.status(404).json({
          success: false,
          message: "Competition not found",
        });
      }

      const submissions = await Competition.getSubmissions(id);

      return res.status(200).json({
        success: true,
        submissions,
      });
    } catch (error) {
      console.error("Competition submissions:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch submissions",
      });
    }
  },

  // ==========================================================
  // JOIN
  // ==========================================================

  /**
   * POST /competitions/:id/join
   * Registers the authenticated student as a participant.
   * Optional body: { teamName }
   */
  async join(req, res) {
    try {
      const { id } = req.params;
      const { teamName } = req.body || {};

      if (!isValidId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid competition ID",
        });
      }

      if (!isStudent(req.user)) {
        return res.status(403).json({
          success: false,
          message: "Only students can join competitions",
        });
      }

      const competition = await Competition.findById(id);

      if (!competition) {
        return res.status(404).json({
          success: false,
          message: "Competition not found",
        });
      }

      const joinableStatuses = ["published", "upcoming", "active"];

      if (!joinableStatuses.includes(competition.status)) {
        return res.status(400).json({
          success: false,
          message: "This competition is not currently open for joining",
        });
      }

      if (
        competition.deadline &&
        new Date(competition.deadline) < new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "The deadline for this competition has passed",
        });
      }

      const existingParticipant =
        await Competition.findParticipantByUser(id, req.user.id);

      if (existingParticipant) {
        return res.status(409).json({
          success: false,
          message: "You have already joined this competition",
        });
      }

      const participantId = await Competition.join(
        id,
        req.user.id,
        teamName
      );

      return res.status(201).json({
        success: true,
        message: "Successfully joined the competition",
        participantId,
      });
    } catch (error) {
      console.error("Competition join:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to join competition",
      });
    }
  },

  // ==========================================================
  // UPDATE PARTICIPANT SCORE
  // ==========================================================

  /**
   * PATCH /competitions/:id/participants/:participantId/score
   * Admins, or the instructor who owns the competition.
   * Recalculates every participant's rank after the update.
   */
  async updateParticipantScore(req, res) {
    try {
      const { id, participantId } = req.params;
      const { score } = req.body || {};

      if (!isValidId(id) || !isValidId(participantId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid competition or participant ID",
        });
      }

      const parsedScore = Number(score);

      if (score === undefined || Number.isNaN(parsedScore)) {
        return res.status(400).json({
          success: false,
          message: "A numeric score is required",
        });
      }

      const competition = await Competition.findById(id);

      if (!competition) {
        return res.status(404).json({
          success: false,
          message: "Competition not found",
        });
      }

      if (!canManage(competition, req.user)) {
        return res.status(403).json({
          success: false,
          message:
            "You are not allowed to score participants in this competition",
        });
      }

      const updated = await Competition.updateParticipantScore(
        participantId,
        id,
        parsedScore
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Participant not found in this competition",
        });
      }

      await Competition.recalculateRankings(id);

      const leaderboard = await Competition.getLeaderboard(id);

      return res.status(200).json({
        success: true,
        message: "Score updated successfully",
        leaderboard,
      });
    } catch (error) {
      console.error("Competition update score:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update score",
      });
    }
  },

  // ==========================================================
  // UPDATE PARTICIPANT SCORE
  // ==========================================================

  /**
   * PATCH /competitions/:id/participants/:participantId/score
   * Sets a participant's score and recalculates the leaderboard
   * ranking for the whole competition. Admins, or the instructor
   * who owns the competition.
   */
  async updateParticipantScore(req, res) {
    try {
      const { id, participantId } = req.params;
      const { score } = req.body || {};

      if (!isValidId(id) || !isValidId(participantId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid competition or participant ID",
        });
      }

      const scoreNumber = Number(score);

      if (score === undefined || score === null || Number.isNaN(scoreNumber)) {
        return res.status(400).json({
          success: false,
          message: "A valid numeric score is required",
        });
      }

      const competition = await Competition.findById(id);

      if (!competition) {
        return res.status(404).json({
          success: false,
          message: "Competition not found",
        });
      }

      if (!canManage(competition, req.user)) {
        return res.status(403).json({
          success: false,
          message:
            "You are not allowed to update scores for this competition",
        });
      }

      const updated = await Competition.updateScore(
        participantId,
        scoreNumber
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Participant not found",
        });
      }

      await Competition.recalculateRanks(id);

      const leaderboard = await Competition.getLeaderboard(id);

      return res.status(200).json({
        success: true,
        message: "Score updated successfully",
        leaderboard,
      });
    } catch (error) {
      console.error("Competition update score:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update score",
      });
    }
  },

  // ==========================================================
  // CREATE
  // ==========================================================

  /**
   * POST /competitions
   * Admins and instructors only.
   */
  async create(req, res) {
    try {
      if (!isAdmin(req.user) && !isInstructor(req.user)) {
        return res.status(403).json({
          success: false,
          message:
            "Only admins and instructors can create competitions",
        });
      }

      const {
        title,
        description,
        category,
        deadline,
        prize,
        status = "draft",
      } = req.body;

      const errors = validateCompetitionInput({
        title,
        deadline,
        status,
      });

      if (Object.keys(errors).length) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }

      const competitionId = await Competition.create({
        title: title.trim(),
        description,
        category,
        deadline,
        prize,
        status,
        createdBy: req.user.id,
      });

      const competition = await Competition.findById(competitionId);

      return res.status(201).json({
        success: true,
        message: "Competition created successfully",
        competition,
      });
    } catch (error) {
      console.error("Competition create:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create competition",
      });
    }
  },

  // ==========================================================
  // UPDATE
  // ==========================================================

  /**
   * PUT /competitions/:id
   * Admins, or the instructor who owns the competition.
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid competition ID",
        });
      }

      const competition = await Competition.findById(id);

      if (!competition) {
        return res.status(404).json({
          success: false,
          message: "Competition not found",
        });
      }

      if (!canManage(competition, req.user)) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to update this competition",
        });
      }

      const { title, description, category, deadline, prize, status } =
        req.body;

      const errors = validateCompetitionInput({
        title,
        deadline,
        status,
      });

      if (Object.keys(errors).length) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }

      await Competition.update(id, {
        title: title.trim(),
        description,
        category,
        deadline,
        prize,
        status: status || competition.status,
      });

      const updated = await Competition.findById(id);

      return res.status(200).json({
        success: true,
        message: "Competition updated successfully",
        competition: updated,
      });
    } catch (error) {
      console.error("Competition update:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update competition",
      });
    }
  },

  // ==========================================================
  // CHANGE STATUS
  // ==========================================================

  /**
   * PATCH /competitions/:id/status
   * Admins, or the instructor who owns the competition.
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!isValidId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid competition ID",
        });
      }

      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid competition status",
          allowedStatuses: ALLOWED_STATUSES,
        });
      }

      const competition = await Competition.findById(id);

      if (!competition) {
        return res.status(404).json({
          success: false,
          message: "Competition not found",
        });
      }

      if (!canManage(competition, req.user)) {
        return res.status(403).json({
          success: false,
          message:
            "You are not allowed to change this competition status",
        });
      }

      if (competition.status === status) {
        return res.status(200).json({
          success: true,
          message: "Competition already has this status",
          competition,
        });
      }

      await Competition.updateStatus(id, status);

      const updated = await Competition.findById(id);

      return res.status(200).json({
        success: true,
        message: "Competition status updated successfully",
        competition: updated,
      });
    } catch (error) {
      console.error("Competition status update:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update competition status",
      });
    }
  },

  // ==========================================================
  // DELETE
  // ==========================================================

  /**
   * DELETE /competitions/:id
   * Admins, or the instructor who owns the competition.
   * Refuses to delete a competition that already has participants.
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid competition ID",
        });
      }

      const competition = await Competition.findById(id);

      if (!competition) {
        return res.status(404).json({
          success: false,
          message: "Competition not found",
        });
      }

      if (!canManage(competition, req.user)) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to delete this competition",
        });
      }

      // Safety: don't delete competitions that already have participants.
      if (Number(competition.participant_count) > 0) {
        return res.status(409).json({
          success: false,
          message:
            "Cannot delete a competition that already has participants. Cancel it instead.",
        });
      }

      await Competition.delete(id);

      return res.status(200).json({
        success: true,
        message: "Competition deleted successfully",
      });
    } catch (error) {
      console.error("Competition delete:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete competition",
      });
    }
  },
};

module.exports = competitionController;