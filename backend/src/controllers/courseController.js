const Course = require("../models/Course");

const courseController = {
  async getAll(req, res) {
    try {
      const courses = await Course.findAll();

      return res.status(200).json(courses);
    } catch (error) {
      console.error("Get courses error:", error);

      return res.status(500).json({
        message: "Failed to fetch courses",
      });
    }
  },

  async getById(req, res) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      return res.status(200).json(course);
    } catch (error) {
      console.error("Get course error:", error);

      return res.status(500).json({
        message: "Failed to fetch course",
      });
    }
  },

  async create(req, res) {
    try {
      const {
        title,
        description,
        longDescription,
        categoryId,
        level,
        price,
        thumbnailColor,
        status,
      } = req.body;

      if (!title || !description || !categoryId) {
        return res.status(400).json({
          message: "Title, description, and category are required",
        });
      }

      if (req.user.role !== "instructor" && req.user.role !== "admin") {
        return res.status(403).json({
          message: "Only instructors and admins can create courses",
        });
      }

      const courseId = await Course.create({
        title,
        description,
        longDescription,
        instructorId: req.user.id,
        categoryId,
        level,
        price,
        thumbnailColor,
        status,
      });

      const course = await Course.findById(courseId);

      return res.status(201).json({
        message: "Course created successfully",
        course,
      });
    } catch (error) {
      console.error("Create course error:", error);

      return res.status(500).json({
        message: "Failed to create course",
      });
    }
  },

  async update(req, res) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      if (
        req.user.role !== "admin" &&
        course.instructor_id !== req.user.id
      ) {
        return res.status(403).json({
          message: "You are not allowed to update this course",
        });
      }

      const {
        title,
        description,
        longDescription,
        categoryId,
        level,
        price,
        thumbnailColor,
        status,
      } = req.body;

      await Course.update(req.params.id, {
        title,
        description,
        longDescription,
        categoryId,
        level,
        price,
        thumbnailColor,
        status,
      });

      const updatedCourse = await Course.findById(req.params.id);

      return res.status(200).json({
        message: "Course updated successfully",
        course: updatedCourse,
      });
    } catch (error) {
      console.error("Update course error:", error);

      return res.status(500).json({
        message: "Failed to update course",
      });
    }
  },

  async delete(req, res) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      if (
        req.user.role !== "admin" &&
        course.instructor_id !== req.user.id
      ) {
        return res.status(403).json({
          message: "You are not allowed to delete this course",
        });
      }

      await Course.delete(req.params.id);

      return res.status(200).json({
        message: "Course deleted successfully",
      });
    } catch (error) {
      console.error("Delete course error:", error);

      return res.status(500).json({
        message: "Failed to delete course",
      });
    }
  },
};

module.exports = courseController;