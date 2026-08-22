const CourseSection = require("../models/CourseSection");

const courseSectionController = {
  async getById(req, res) {
    try {
      const section = await CourseSection.findById(req.params.id);

      if (!section) {
        return res.status(404).json({
          message: "Course section not found",
        });
      }

      res.status(200).json(section);
    } catch (error) {
      console.error("Get section error:", error);
      res.status(500).json({
        message: "Failed to fetch course section",
      });
    }
  },

  async getByCourse(req, res) {
    try {
      const sections = await CourseSection.findByCourse(
        req.params.courseId
      );

      res.status(200).json(sections);
    } catch (error) {
      console.error("Get course sections error:", error);
      res.status(500).json({
        message: "Failed to fetch course sections",
      });
    }
  },

  async create(req, res) {
    try {
      if (
        req.user.role !== "instructor" &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message: "Only instructors and admins can create sections",
        });
      }

      const { courseId, title, sectionOrder } = req.body;

      if (!courseId || !title) {
        return res.status(400).json({
          message: "Course ID and title are required",
        });
      }

      const sectionId = await CourseSection.create({
        courseId,
        title,
        sectionOrder,
      });

      const section = await CourseSection.findById(sectionId);

      res.status(201).json({
        message: "Course section created successfully",
        section,
      });
    } catch (error) {
      console.error("Create section error:", error);
      res.status(500).json({
        message: "Failed to create course section",
      });
    }
  },

  async update(req, res) {
    try {
      if (
        req.user.role !== "instructor" &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message: "Only instructors and admins can update sections",
        });
      }

      const section = await CourseSection.findById(req.params.id);

      if (!section) {
        return res.status(404).json({
          message: "Course section not found",
        });
      }

      const { title, sectionOrder } = req.body;

      await CourseSection.update(req.params.id, {
        title,
        sectionOrder,
      });

      const updatedSection = await CourseSection.findById(
        req.params.id
      );

      res.status(200).json({
        message: "Course section updated successfully",
        section: updatedSection,
      });
    } catch (error) {
      console.error("Update section error:", error);
      res.status(500).json({
        message: "Failed to update course section",
      });
    }
  },

  async delete(req, res) {
    try {
      if (
        req.user.role !== "instructor" &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message: "Only instructors and admins can delete sections",
        });
      }

      const section = await CourseSection.findById(req.params.id);

      if (!section) {
        return res.status(404).json({
          message: "Course section not found",
        });
      }

      await CourseSection.delete(req.params.id);

      res.status(200).json({
        message: "Course section deleted successfully",
      });
    } catch (error) {
      console.error("Delete section error:", error);
      res.status(500).json({
        message: "Failed to delete course section",
      });
    }
  },
};

module.exports = courseSectionController;