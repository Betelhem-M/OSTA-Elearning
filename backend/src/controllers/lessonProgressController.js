const LessonProgress = require("../models/LessonProgress");

const lessonProgressController = {
  // ============================================================
  // GET ALL PROGRESS FOR CURRENT STUDENT
  // GET /api/progress/my
  // ============================================================

  async getMyProgress(req, res) {
    try {
      const userId = Number(req.user.id);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          message: "Invalid user.",
        });
      }

      const progress = await LessonProgress.findByUser(userId);

      return res.status(200).json(progress);
    } catch (error) {
      console.error("Get my lesson progress error:", error);

      return res.status(500).json({
        message: "Failed to fetch lesson progress.",
      });
    }
  },

  // ============================================================
  // GET PROGRESS FOR ONE LESSON
  // GET /api/progress/lesson/:lessonId
  //
  // IMPORTANT:
  // If the student has never opened the lesson before,
  // return a default 0% progress object instead of 404.
  // ============================================================

  async getLessonProgress(req, res) {
    try {
      const userId = Number(req.user.id);
      const lessonId = Number(req.params.lessonId);

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          message: "Invalid user.",
        });
      }

      if (!Number.isInteger(lessonId) || lessonId <= 0) {
        return res.status(400).json({
          message: "Invalid lesson ID.",
        });
      }

      const progress =
        await LessonProgress.findByUserAndLesson(
          userId,
          lessonId
        );

      // ----------------------------------------------------------
      // FIRST TIME OPENING LESSON
      // ----------------------------------------------------------

      if (!progress) {
        return res.status(200).json({
          id: null,
          user_id: userId,
          lesson_id: lessonId,

          completed: false,
          progress_percent: 0,
          last_position_seconds: 0,
          completed_at: null,

          updated_at: null,
        });
      }

      return res.status(200).json(progress);
    } catch (error) {
      console.error(
        "Get lesson progress detail error:",
        error
      );

      return res.status(500).json({
        message: "Failed to fetch lesson progress.",
      });
    }
  },

  // ============================================================
  // UPDATE LESSON PROGRESS
  // PUT /api/progress/lesson/:lessonId
  // ============================================================

  async updateProgress(req, res) {
    try {
      const userId = Number(req.user.id);
      const lessonId = Number(req.params.lessonId);

      const {
        progressPercent,
        lastPositionSeconds,
        completed,
      } = req.body;

      // ----------------------------------------------------------
      // VALIDATE USER
      // ----------------------------------------------------------

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          message: "Invalid user.",
        });
      }

      // ----------------------------------------------------------
      // VALIDATE LESSON
      // ----------------------------------------------------------

      if (!Number.isInteger(lessonId) || lessonId <= 0) {
        return res.status(400).json({
          message: "Invalid lesson ID.",
        });
      }

      // ----------------------------------------------------------
      // VALIDATE REQUIRED FIELDS
      // ----------------------------------------------------------

      if (
        progressPercent === undefined ||
        lastPositionSeconds === undefined
      ) {
        return res.status(400).json({
          message:
            "progressPercent and lastPositionSeconds are required.",
        });
      }

      const percent = Number(progressPercent);
      const position = Number(lastPositionSeconds);

      if (!Number.isFinite(percent)) {
        return res.status(400).json({
          message: "progressPercent must be a valid number.",
        });
      }

      if (!Number.isFinite(position)) {
        return res.status(400).json({
          message:
            "lastPositionSeconds must be a valid number.",
        });
      }

      // ----------------------------------------------------------
      // NORMALIZE VALUES
      // ----------------------------------------------------------

      const normalizedPercent = Math.min(
        Math.max(percent, 0),
        100
      );

      const normalizedPosition = Math.max(
        position,
        0
      );

      const isCompleted =
        Boolean(completed) ||
        normalizedPercent >= 100;

      // ----------------------------------------------------------
      // CREATE OR UPDATE
      // ----------------------------------------------------------

      await LessonProgress.createOrUpdate(
        userId,
        lessonId,
        normalizedPercent,
        normalizedPosition,
        isCompleted
      );

      // ----------------------------------------------------------
      // RETURN LATEST PROGRESS
      // ----------------------------------------------------------

      const progress =
        await LessonProgress.findByUserAndLesson(
          userId,
          lessonId
        );

      return res.status(200).json({
        message:
          "Lesson progress updated successfully.",
        progress,
      });
    } catch (error) {
      console.error(
        "Update lesson progress error:",
        error
      );

      return res.status(500).json({
        message: "Failed to update lesson progress.",
      });
    }
  },

  // ============================================================
  // COMPLETE LESSON
  // PUT /api/progress/lesson/:lessonId/complete
  // ============================================================

  async completeLesson(req, res) {
    try {
      const userId = Number(req.user.id);
      const lessonId = Number(req.params.lessonId);

      // ----------------------------------------------------------
      // VALIDATE USER
      // ----------------------------------------------------------

      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          message: "Invalid user.",
        });
      }

      // ----------------------------------------------------------
      // VALIDATE LESSON
      // ----------------------------------------------------------

      if (!Number.isInteger(lessonId) || lessonId <= 0) {
        return res.status(400).json({
          message: "Invalid lesson ID.",
        });
      }

      // ----------------------------------------------------------
      // MARK COMPLETED
      // ----------------------------------------------------------

      await LessonProgress.markCompleted(
        userId,
        lessonId
      );

      // ----------------------------------------------------------
      // RETURN UPDATED PROGRESS
      // ----------------------------------------------------------

      const progress =
        await LessonProgress.findByUserAndLesson(
          userId,
          lessonId
        );

      return res.status(200).json({
        message: "Lesson marked as completed.",
        progress,
      });
    } catch (error) {
      console.error(
        "Complete lesson error:",
        error
      );

      return res.status(500).json({
        message: "Failed to complete lesson.",
      });
    }
  },
};

module.exports = lessonProgressController;