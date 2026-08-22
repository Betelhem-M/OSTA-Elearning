const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

const assignmentController = {
  async getById(req, res) {
    try {
      const assignment = await Assignment.findById(req.params.id);

      if (!assignment) {
        return res.status(404).json({
          message: "Assignment not found",
        });
      }

      const rubrics = await Assignment.findRubrics(
        assignment.id
      );

      return res.status(200).json({
        ...assignment,
        rubrics,
      });
    } catch (error) {
      console.error("Get assignment error:", error);

      return res.status(500).json({
        message: "Failed to fetch assignment",
      });
    }
  },

  async getByCourse(req, res) {
    try {
      const assignments = await Assignment.findByCourse(
        req.params.courseId
      );

      return res.status(200).json(assignments);
    } catch (error) {
      console.error("Get course assignments error:", error);

      return res.status(500).json({
        message: "Failed to fetch assignments",
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
          message:
            "Only instructors and admins can create assignments",
        });
      }

      const {
        courseId,
        lessonId,
        title,
        description,
        instructions,
        dueDate,
        points,
        allowedFileTypes,
        maxFileSizeMB,
        status,
      } = req.body;

      if (!courseId || !title) {
        return res.status(400).json({
          message: "Course ID and title are required",
        });
      }

      const assignmentId = await Assignment.create({
        courseId,
        lessonId,
        title,
        description,
        instructions,
        dueDate,
        points,
        allowedFileTypes,
        maxFileSizeMB,
        status,
      });

      const assignment = await Assignment.findById(
        assignmentId
      );

      return res.status(201).json({
        message: "Assignment created successfully",
        assignment,
      });
    } catch (error) {
      console.error("Create assignment error:", error);

      return res.status(500).json({
        message: "Failed to create assignment",
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
          message:
            "Only instructors and admins can update assignments",
        });
      }

      const assignment = await Assignment.findById(
        req.params.id
      );

      if (!assignment) {
        return res.status(404).json({
          message: "Assignment not found",
        });
      }

      await Assignment.update(
        req.params.id,
        req.body
      );

      const updatedAssignment =
        await Assignment.findById(req.params.id);

      return res.status(200).json({
        message: "Assignment updated successfully",
        assignment: updatedAssignment,
      });
    } catch (error) {
      console.error("Update assignment error:", error);

      return res.status(500).json({
        message: "Failed to update assignment",
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
          message:
            "Only instructors and admins can delete assignments",
        });
      }

      const deleted = await Assignment.delete(
        req.params.id
      );

      if (!deleted) {
        return res.status(404).json({
          message: "Assignment not found",
        });
      }

      return res.status(200).json({
        message: "Assignment deleted successfully",
      });
    } catch (error) {
      console.error("Delete assignment error:", error);

      return res.status(500).json({
        message: "Failed to delete assignment",
      });
    }
  },

  async getSubmissions(req, res) {
    try {
      const submissions =
        await Submission.findByAssignment(
          req.params.assignmentId
        );

      return res.status(200).json(submissions);
    } catch (error) {
      console.error("Get submissions error:", error);

      return res.status(500).json({
        message: "Failed to fetch submissions",
      });
    }
  },

  async submit(req, res) {
    try {
      const assignmentId = Number(
        req.params.assignmentId
      );

      const assignment =
        await Assignment.findById(assignmentId);

      if (!assignment) {
        return res.status(404).json({
          message: "Assignment not found",
        });
      }

      const existing =
        await Submission.findByUserAndAssignment(
          req.user.id,
          assignmentId
        );

      if (existing) {
        return res.status(409).json({
          message: "You already submitted this assignment",
        });
      }

      const submissionId =
        await Submission.create({
          assignmentId,
          userId: req.user.id,
          comment: req.body.comment,
        });

      const submission =
        await Submission.findById(submissionId);

      return res.status(201).json({
        message: "Assignment submitted successfully",
        submission,
      });
    } catch (error) {
      console.error("Submit assignment error:", error);

      return res.status(500).json({
        message: "Failed to submit assignment",
      });
    }
  },

  async gradeSubmission(req, res) {
    try {
      if (
        req.user.role !== "instructor" &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message:
            "Only instructors and admins can grade submissions",
        });
      }

      const submission = await Submission.findById(
        req.params.submissionId
      );

      if (!submission) {
        return res.status(404).json({
          message: "Submission not found",
        });
      }

      const { score, instructorComment } = req.body;

      if (score === undefined) {
        return res.status(400).json({
          message: "Score is required",
        });
      }

      await Submission.grade(
        req.params.submissionId,
        {
          score,
          instructorComment,
        }
      );

      const updatedSubmission =
        await Submission.findById(
          req.params.submissionId
        );

      return res.status(200).json({
        message: "Submission graded successfully",
        submission: updatedSubmission,
      });
    } catch (error) {
      console.error("Grade submission error:", error);

      return res.status(500).json({
        message: "Failed to grade submission",
      });
    }
  },
};

module.exports = assignmentController;