const Course = require("../models/Course");
const Submission = require("../models/Submission");

const instructorController = {
  async getDashboard(req, res) {
    try {
      const courses = await Course.findAll();

      const instructorCourses = courses.filter(
        (course) => course.instructor_id === req.user.id
      );

      return res.json({
        stats: {
          activeCourses: instructorCourses.filter(
            (course) => course.status === "published"
          ).length,
          totalCourses: instructorCourses.length,
        },
        courses: instructorCourses,
      });
    } catch (error) {
      console.error("Instructor dashboard error:", error);

      res.status(500).json({
        message: "Failed to fetch instructor dashboard",
      });
    }
  },
};

module.exports = instructorController;