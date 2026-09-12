const Course = require("../models/Course");

function validateCourseMetadata({ language, duration, estimatedHours }) {
  if (!language || !String(language).trim()) {
    return "Course language is required";
  }

  if (!duration || !String(duration).trim()) {
    return "Course duration is required";
  }

  const hours = Number(estimatedHours);
  if (!Number.isFinite(hours) || hours <= 0) {
    return "Estimated learning hours must be greater than 0";
  }

  return null;
}

const courseController = {
  // =====================================================
  // GET ALL COURSES
  // =====================================================
  async getAll(req, res) {
    try {
      const courses = await Course.findAll();
      return res.status(200).json(courses);
    } catch (error) {
      console.error("Get courses error:", error);
      return res.status(500).json({ message: "Failed to fetch courses" });
    }
  },

  // =====================================================
  // GET COURSE BY ID
  // =====================================================
  async getById(req, res) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      return res.status(200).json(course);
    } catch (error) {
      console.error("Get course error:", error);
      return res.status(500).json({ message: "Failed to fetch course" });
    }
  },

  // =====================================================
  // CREATE COURSE
  // =====================================================
  async create(req, res) {
    try {
      const {
        title,
        description,
        longDescription,
        categoryId,
        level,
        language,
        duration,
        estimatedHours,
        price,
        thumbnailColor,
        status,
      } = req.body;

      if (!title || !description || !categoryId) {
        return res.status(400).json({
          message: "Title, description, and category are required",
        });
      }

      const metadataError = validateCourseMetadata({
        language,
        duration,
        estimatedHours,
      });

      if (metadataError) {
        return res.status(400).json({ message: metadataError });
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
        language: String(language).trim(),
        duration: String(duration).trim(),
        estimatedHours: Number(estimatedHours),
        price,
        thumbnailColor,
        status,
      });

      const course = await Course.findById(courseId);

      return res.status(201).json({
        message: "Course and default section created successfully",
        course,
      });
    } catch (error) {
      console.error("Create course error:", error);
      return res.status(500).json({ message: "Failed to create course" });
    }
  },

  // =====================================================
  // UPDATE COURSE
  // =====================================================
  async update(req, res) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (
        req.user.role !== "admin" &&
        Number(course.instructor_id) !== Number(req.user.id)
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
        language,
        duration,
        estimatedHours,
        price,
        thumbnailColor,
        status,
      } = req.body;

      if (!title || !description || !categoryId) {
        return res.status(400).json({
          message: "Title, description, and category are required",
        });
      }

      const metadataError = validateCourseMetadata({
        language,
        duration,
        estimatedHours,
      });

      if (metadataError) {
        return res.status(400).json({ message: metadataError });
      }

      await Course.update(req.params.id, {
        title,
        description,
        longDescription,
        categoryId,
        level,
        language: String(language).trim(),
        duration: String(duration).trim(),
        estimatedHours: Number(estimatedHours),
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
      return res.status(500).json({ message: "Failed to update course" });
    }
  },

  // =====================================================
  // DELETE COURSE
  // =====================================================
  async delete(req, res) {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (
        req.user.role !== "admin" &&
        Number(course.instructor_id) !== Number(req.user.id)
      ) {
        return res.status(403).json({
          message: "You are not allowed to delete this course",
        });
      }

      await Course.delete(req.params.id);
      return res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Delete course error:", error);
      return res.status(500).json({ message: "Failed to delete course" });
    }
  },

  // =====================================================
  // GET MY COURSES
  // =====================================================
  async getMyCourses(req, res) {
    try {
      if (req.user.role !== "instructor" && req.user.role !== "admin") {
        return res.status(403).json({
          message: "Only instructors and admins can access this route",
        });
      }

      const courses = await Course.findByInstructorId(req.user.id);
      return res.status(200).json(Array.isArray(courses) ? courses : []);
    } catch (error) {
      console.error("Get my courses error:", error);
      return res.status(500).json({ message: "Failed to fetch your courses" });
    }
  },
};

module.exports = courseController;
