const LessonProgress = require("../models/LessonProgress");

const lessonProgressController = {
  async getMyProgress(req, res) {
    try {
      const progress = await LessonProgress.findByUser(
        req.user.id
      );

      return res.status(200).json(progress);
    } catch (error) {
      console.error("Get lesson progress error:", error);

      return res.status(500).json({
        message: "Failed to fetch lesson progress",
      });
    }
  },

  async getLessonProgress(req, res) {
    try {
      const progress =
        await LessonProgress.findByUserAndLesson(
          req.user.id,
          req.params.lessonId
        );

      if (!progress) {
        return res.status(404).json({
          message: "Lesson progress not found",
        });
      }

      return res.status(200).json(progress);
    } catch (error) {
      console.error(
        "Get lesson progress detail error:",
        error
      );

      return res.status(500).json({
        message: "Failed to fetch lesson progress",
      });
    }
  },

  async updateProgress(req, res) {
    try {
      const userId = req.user.id;
      const lessonId = Number(req.params.lessonId);

      const {
        progressPercent,
        lastPositionSeconds,
        completed,
      } = req.body;

      if (
        progressPercent === undefined ||
        lastPositionSeconds === undefined
      ) {
        return res.status(400).json({
          message:
            "progressPercent and lastPositionSeconds are required",
        });
      }

      const percent = Number(progressPercent);
      const position = Number(lastPositionSeconds);
      const isCompleted = Boolean(completed);

      if (percent < 0 || percent > 100) {
        return res.status(400).json({
          message: "Progress percent must be between 0 and 100",
        });
      }

      await LessonProgress.createOrUpdate(
        userId,
        lessonId,
        percent,
        position,
        isCompleted
      );

      const progress =
        await LessonProgress.findByUserAndLesson(
          userId,
          lessonId
        );

      return res.status(200).json({
        message: "Lesson progress updated successfully",
        progress,
      });
    } catch (error) {
      console.error("Update lesson progress error:", error);

      return res.status(500).json({
        message: "Failed to update lesson progress",
      });
    }
  },

  async completeLesson(req, res) {
    try {
      const userId = req.user.id;
      const lessonId = Number(req.params.lessonId);

      await LessonProgress.markCompleted(
        userId,
        lessonId
      );

      const progress =
        await LessonProgress.findByUserAndLesson(
          userId,
          lessonId
        );

      return res.status(200).json({
        message: "Lesson marked as completed",
        progress,
      });
    } catch (error) {
      console.error("Complete lesson error:", error);

      return res.status(500).json({
        message: "Failed to complete lesson",
      });
    }
  },
};

module.exports = lessonProgressController;