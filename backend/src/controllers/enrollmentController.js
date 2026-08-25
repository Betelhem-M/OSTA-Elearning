const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

const enrollmentController = {
  // =====================================================
  // ENROLL IN COURSE
  // STUDENTS ONLY
  // =====================================================

  async enroll(req, res) {
    try {
      // ===================================================
      // ROLE CHECK
      // ===================================================

      if (req.user.role !== "student") {
        return res.status(403).json({
          message:
            "Only students can enroll in courses",
        });
      }

      const userId = req.user.id;
      const { courseId } = req.body;

      // ===================================================
      // VALIDATE COURSE ID
      // ===================================================

      if (!courseId) {
        return res.status(400).json({
          message: "Course ID is required",
        });
      }

      const numericCourseId =
        Number(courseId);

      if (!Number.isInteger(numericCourseId)) {
        return res.status(400).json({
          message: "Invalid course ID",
        });
      }

      // ===================================================
      // CHECK COURSE
      // ===================================================

      const course =
        await Course.findById(
          numericCourseId
        );

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      // ===================================================
      // ONLY PUBLISHED COURSES
      // ===================================================

      if (
        course.status &&
        course.status !== "published"
      ) {
        return res.status(400).json({
          message:
            "This course is not available for enrollment",
        });
      }

      // ===================================================
      // CHECK EXISTING ENROLLMENT
      // ===================================================

      const existingEnrollment =
        await Enrollment.findByUserAndCourse(
          userId,
          numericCourseId
        );

      if (existingEnrollment) {
        return res.status(409).json({
          message:
            "You are already enrolled in this course",
          enrollment:
            existingEnrollment,
        });
      }

      // ===================================================
      // CREATE ENROLLMENT
      // ===================================================

      const enrollmentId =
        await Enrollment.create(
          userId,
          numericCourseId
        );

      // ===================================================
      // GET CREATED ENROLLMENT
      // ===================================================

      const enrollment =
        await Enrollment.findByUserAndCourse(
          userId,
          numericCourseId
        );

      return res.status(201).json({
        message:
          "Successfully enrolled in course",

        enrollment,

        enrollmentId,
      });
    } catch (error) {
      console.error(
        "Enroll error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to enroll in course",
      });
    }
  },

  // =====================================================
  // GET MY ENROLLMENTS
  // =====================================================

  async getMyEnrollments(req, res) {
    try {
      const enrollments =
        await Enrollment.findByUser(
          req.user.id
        );

      return res.status(200).json(
        Array.isArray(enrollments)
          ? enrollments
          : []
      );
    } catch (error) {
      console.error(
        "Get enrollments error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch enrollments",
      });
    }
  },

  // =====================================================
  // GET COURSE STUDENTS
  // INSTRUCTOR / ADMIN
  // =====================================================

  async getCourseStudents(req, res) {
    try {
      const enrollments =
        await Enrollment.findByCourse(
          req.params.courseId
        );

      return res.status(200).json(
        Array.isArray(enrollments)
          ? enrollments
          : []
      );
    } catch (error) {
      console.error(
        "Get course students error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch course students",
      });
    }
  },

  // =====================================================
  // UPDATE ENROLLMENT STATUS
  // =====================================================

  async updateStatus(req, res) {
    try {
      const enrollmentId =
        Number(req.params.id);

      const { status } = req.body;

      const allowedStatuses = [
        "active",
        "completed",
        "dropped",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid enrollment status",
        });
      }

      if (
        !Number.isInteger(
          enrollmentId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid enrollment ID",
        });
      }

      const updated =
        await Enrollment.updateStatus(
          enrollmentId,
          status
        );

      if (!updated) {
        return res.status(404).json({
          message:
            "Enrollment not found",
        });
      }

      return res.status(200).json({
        message:
          "Enrollment status updated successfully",
      });
    } catch (error) {
      console.error(
        "Update enrollment status error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update enrollment status",
      });
    }
  },

  // =====================================================
  // REMOVE ENROLLMENT
  // =====================================================

  async remove(req, res) {
    try {
      const enrollmentId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          enrollmentId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid enrollment ID",
        });
      }

      const deleted =
        await Enrollment.delete(
          enrollmentId
        );

      if (!deleted) {
        return res.status(404).json({
          message:
            "Enrollment not found",
        });
      }

      return res.status(200).json({
        message:
          "Enrollment removed successfully",
      });
    } catch (error) {
      console.error(
        "Delete enrollment error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to remove enrollment",
      });
    }
  },
};

module.exports =
  enrollmentController;