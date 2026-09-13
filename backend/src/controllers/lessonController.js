const Lesson = require("../models/Lesson");

const canManageLessons = (user) => {
  const role = String(user?.role || "").toLowerCase();
  const accountType = String(user?.account_type || "").toLowerCase();

  return (
    role === "instructor" ||
    role === "admin" ||
    accountType === "instructor" ||
    accountType === "admin"
  );
};

const lessonController = {
  async getById(req, res) {
    try {
      const lesson = await Lesson.findById(req.params.id);

      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      return res.status(200).json(lesson);
    } catch (error) {
      console.error("Get lesson error:", error);
      return res.status(500).json({ message: "Failed to fetch lesson" });
    }
  },

  async getBySection(req, res) {
    try {
      const lessons = await Lesson.findBySection(req.params.sectionId);
      return res.status(200).json(lessons);
    } catch (error) {
      console.error("Get section lessons error:", error);
      return res.status(500).json({ message: "Failed to fetch lessons" });
    }
  },

  async create(req, res) {
    try {
      if (!canManageLessons(req.user)) {
        return res.status(403).json({
          message: "Only instructors and admins can create lessons",
        });
      }

      const {
        courseId,
        course_id,
        sectionId,
        section_id,
        title,
        description,
        summary,
        videoUrl,
        video_url,
        durationMinutes,
        duration_minutes,
        lessonOrder,
        lesson_order,
        isPublished,
        is_published,
      } = req.body;

      const resolvedSectionId = sectionId ?? section_id;
      const resolvedCourseId = courseId ?? course_id;
      const resolvedTitle = String(title || "").trim();

      if (!resolvedSectionId || !resolvedTitle) {
        return res.status(400).json({
          message: "Section ID and title are required",
        });
      }

      const lessonId = await Lesson.create({
        courseId: resolvedCourseId,
        sectionId: resolvedSectionId,
        title: resolvedTitle,
        description: description ?? summary,
        videoUrl: videoUrl ?? video_url,
        durationMinutes: durationMinutes ?? duration_minutes,
        lessonOrder: lessonOrder ?? lesson_order,
        isPublished: isPublished ?? is_published ?? true,
      });

      const lesson = await Lesson.findById(lessonId);

      return res.status(201).json({
        message: "Lesson created successfully",
        lesson,
      });
    } catch (error) {
      console.error("Create lesson error:", error);

      return res.status(500).json({
        message: error?.message || "Failed to create lesson",
      });
    }
  },

  async update(req, res) {
    try {
      if (!canManageLessons(req.user)) {
        return res.status(403).json({
          message: "Only instructors and admins can update lessons",
        });
      }

      const lesson = await Lesson.findById(req.params.id);

      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const {
        title,
        description,
        summary,
        videoUrl,
        video_url,
        durationMinutes,
        duration_minutes,
        lessonOrder,
        lesson_order,
        isPublished,
        is_published,
      } = req.body;

      await Lesson.update(req.params.id, {
        title: title !== undefined ? String(title).trim() : undefined,
        description: description ?? summary,
        videoUrl: videoUrl ?? video_url,
        durationMinutes: durationMinutes ?? duration_minutes,
        lessonOrder: lessonOrder ?? lesson_order,
        isPublished: isPublished ?? is_published,
      });

      const updatedLesson = await Lesson.findById(req.params.id);

      return res.status(200).json({
        message: "Lesson updated successfully",
        lesson: updatedLesson,
      });
    } catch (error) {
      console.error("Update lesson error:", error);
      return res.status(500).json({
        message: error?.message || "Failed to update lesson",
      });
    }
  },

  async delete(req, res) {
    try {
      if (!canManageLessons(req.user)) {
        return res.status(403).json({
          message: "Only instructors and admins can delete lessons",
        });
      }

      const lesson = await Lesson.findById(req.params.id);

      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      await Lesson.delete(req.params.id);

      return res.status(200).json({ message: "Lesson deleted successfully" });
    } catch (error) {
      console.error("Delete lesson error:", error);
      return res.status(500).json({
        message: error?.message || "Failed to delete lesson",
      });
    }
  },
};

module.exports = lessonController;
