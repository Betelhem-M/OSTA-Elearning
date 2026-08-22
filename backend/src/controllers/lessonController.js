const Lesson = require("../models/Lesson");

const lessonController = {
  async getById(req, res) {
    try {
      const lesson = await Lesson.findById(req.params.id);

      if (!lesson) {
        return res.status(404).json({
          message: "Lesson not found",
        });
      }

      return res.status(200).json(lesson);
    } catch (error) {
      console.error("Get lesson error:", error);

      return res.status(500).json({
        message: "Failed to fetch lesson",
      });
    }
  },

  async getBySection(req, res) {
    try {
      const lessons = await Lesson.findBySection(req.params.sectionId);

      return res.status(200).json(lessons);
    } catch (error) {
      console.error("Get section lessons error:", error);

      return res.status(500).json({
        message: "Failed to fetch lessons",
      });
    }
  },

  async create(req, res) {
    try {
      const {
        sectionId,
        title,
        description,
        videoUrl,
        durationMinutes,
        lessonOrder,
        isPublished,
      } = req.body;

      if (!sectionId || !title) {
        return res.status(400).json({
          message: "Section ID and title are required",
        });
      }

      if (
        req.user.role !== "instructor" &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message: "Only instructors and admins can create lessons",
        });
      }

      const lessonId = await Lesson.create({
        sectionId,
        title,
        description,
        videoUrl,
        durationMinutes,
        lessonOrder,
        isPublished,
      });

      const lesson = await Lesson.findById(lessonId);

      return res.status(201).json({
        message: "Lesson created successfully",
        lesson,
      });
    } catch (error) {
      console.error("Create lesson error:", error);

      return res.status(500).json({
        message: "Failed to create lesson",
      });
    }
  },

  async update(req, res) {
    try {
      const lesson = await Lesson.findById(req.params.id);

      if (!lesson) {
        return res.status(404).json({
          message: "Lesson not found",
        });
      }

      if (
        req.user.role !== "instructor" &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message: "Only instructors and admins can update lessons",
        });
      }

      const {
        title,
        description,
        videoUrl,
        durationMinutes,
        lessonOrder,
        isPublished,
      } = req.body;

      await Lesson.update(req.params.id, {
        title,
        description,
        videoUrl,
        durationMinutes,
        lessonOrder,
        isPublished,
      });

      const updatedLesson = await Lesson.findById(req.params.id);

      return res.status(200).json({
        message: "Lesson updated successfully",
        lesson: updatedLesson,
      });
    } catch (error) {
      console.error("Update lesson error:", error);

      return res.status(500).json({
        message: "Failed to update lesson",
      });
    }
  },

  async delete(req, res) {
    try {
      const lesson = await Lesson.findById(req.params.id);

      if (!lesson) {
        return res.status(404).json({
          message: "Lesson not found",
        });
      }

      if (
        req.user.role !== "instructor" &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message: "Only instructors and admins can delete lessons",
        });
      }

      await Lesson.delete(req.params.id);

      return res.status(200).json({
        message: "Lesson deleted successfully",
      });
    } catch (error) {
      console.error("Delete lesson error:", error);

      return res.status(500).json({
        message: "Failed to delete lesson",
      });
    }
  },
};

module.exports = lessonController;