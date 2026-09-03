const CourseProgress = require("../models/CourseProgress");

const instructorProgressController = {
  // ==========================================================
  // ALL STUDENTS IN ONE COURSE
  // ==========================================================

  async getCourseStudentProgress(req, res) {
    try {
      const instructorId = req.user.id;
      const courseId = Number(req.params.courseId);

      if (!Number.isInteger(courseId)) {
        return res.status(400).json({
          message: "Invalid course ID",
        });
      }

      const progress =
        await CourseProgress.getInstructorCourseProgress(
          instructorId,
          courseId
        );

      return res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      console.error(
        "Get instructor course progress error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch student progress",
      });
    }
  },

  // ==========================================================
  // ONE STUDENT, ACROSS ALL THEIR COURSES WITH THIS INSTRUCTOR
  // ==========================================================

  /**
   * GET /instructor/students/:studentId/progress
   * Returns { success, student, progress } — one row per course
   * this student is enrolled in that also belongs to the
   * authenticated instructor.
   */
  async getStudentProgress(req, res) {
    try {
      const instructorId = req.user.id;
      const studentId = Number(req.params.studentId);

      if (!Number.isInteger(studentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid student ID",
        });
      }

      const rows =
        await CourseProgress.getInstructorStudentProgress(
          instructorId,
          studentId
        );

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found or not enrolled in any of your courses",
        });
      }

      const student = {
        id: rows[0].student_id,
        name: rows[0].student_name,
        email: rows[0].student_email,
      };

      const progress = rows.map((row) => ({
        courseId: row.course_id,
        courseTitle: row.course_title,
        totalLessons: row.total_lessons,
        completedLessons: row.completed_lessons,
        progressPercent: row.progress_percent,
      }));

      return res.status(200).json({
        success: true,
        student,
        progress,
      });
    } catch (error) {
      console.error(
        "Get instructor student progress error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch student progress",
      });
    }
  },
};

module.exports = instructorProgressController;