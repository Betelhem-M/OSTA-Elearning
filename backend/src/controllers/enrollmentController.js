const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

const enrollmentController = {
  async enroll(req, res) {
    try {
      const userId = req.user.id;
      const { courseId } = req.body;

      if (!courseId) {
        return res.status(400).json({
          message: "Course ID is required",
        });
      }

      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      const existingEnrollment =
        await Enrollment.findByUserAndCourse(userId, courseId);

      if (existingEnrollment) {
        return res.status(409).json({
          message: "You are already enrolled in this course",
        });
      }

      const enrollmentId = await Enrollment.create(
        userId,
        courseId
      );

      const enrollment =
        await Enrollment.findByUserAndCourse(
          userId,
          courseId
        );

      return res.status(201).json({
        message: "Successfully enrolled in course",
        enrollment,
        enrollmentId,
      });
    } catch (error) {
      console.error("Enroll error:", error);

      return res.status(500).json({
        message: "Failed to enroll in course",
      });
    }
  },

  async getMyEnrollments(req, res) {
    try {
      const enrollments = await Enrollment.findByUser(
        req.user.id
      );

      return res.status(200).json(enrollments);
    } catch (error) {
      console.error("Get enrollments error:", error);

      return res.status(500).json({
        message: "Failed to fetch enrollments",
      });
    }
  },

  async getCourseStudents(req, res) {
    try {
      const enrollments = await Enrollment.findByCourse(
        req.params.courseId
      );

      return res.status(200).json(enrollments);
    } catch (error) {
      console.error("Get course students error:", error);

      return res.status(500).json({
        message: "Failed to fetch course students",
      });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;

      const allowedStatuses = [
        "active",
        "completed",
        "dropped",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid enrollment status",
        });
      }

      const updated = await Enrollment.updateStatus(
        req.params.id,
        status
      );

      if (!updated) {
        return res.status(404).json({
          message: "Enrollment not found",
        });
      }

      return res.status(200).json({
        message: "Enrollment status updated successfully",
      });
    } catch (error) {
      console.error("Update enrollment status error:", error);

      return res.status(500).json({
        message: "Failed to update enrollment status",
      });
    }
  },

  async remove(req, res) {
    try {
      const deleted = await Enrollment.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          message: "Enrollment not found",
        });
      }

      return res.status(200).json({
        message: "Enrollment removed successfully",
      });
    } catch (error) {
      console.error("Delete enrollment error:", error);

      return res.status(500).json({
        message: "Failed to remove enrollment",
      });
    }
  },
};

module.exports = enrollmentController;