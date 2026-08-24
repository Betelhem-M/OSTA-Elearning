const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

const assignmentController = {
  // =========================
  // GET ASSIGNMENT BY ID
  // =========================

  async getById(req, res) {
    try {
      const assignment =
        await Assignment.findById(req.params.id);

      if (!assignment) {
        return res.status(404).json({
          message: "Assignment not found",
        });
      }

      const rubrics =
        await Assignment.findRubrics(
          assignment.id
        );

      return res.status(200).json({
        ...assignment,
        rubrics,
      });
    } catch (error) {
      console.error(
        "Get assignment error:",
        error
      );

      return res.status(500).json({
        message: "Failed to fetch assignment",
      });
    }
  },

  // =========================
  // GET ASSIGNMENTS BY COURSE
  // =========================

  async getByCourse(req, res) {
    try {
      const assignments =
        await Assignment.findByCourse(
          req.params.courseId
        );

      return res.status(200).json(assignments);
    } catch (error) {
      console.error(
        "Get course assignments error:",
        error
      );

      return res.status(500).json({
        message: "Failed to fetch assignments",
      });
    }
  },

  // =========================
  // CREATE
  // =========================

  async create(req, res) {
    try {
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
          message:
            "Course ID and title are required",
        });
      }

      const assignmentId =
        await Assignment.create({
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

      const assignment =
        await Assignment.findById(
          assignmentId
        );

      return res.status(201).json({
        message:
          "Assignment created successfully",
        assignment,
      });
    } catch (error) {
      console.error(
        "Create assignment error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to create assignment",
      });
    }
  },

  // =========================
  // UPDATE
  // =========================

  async update(req, res) {
    try {
      const assignment =
        await Assignment.findById(
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
        await Assignment.findById(
          req.params.id
        );

      return res.status(200).json({
        message:
          "Assignment updated successfully",
        assignment: updatedAssignment,
      });
    } catch (error) {
      console.error(
        "Update assignment error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update assignment",
      });
    }
  },

  // =========================
  // DELETE
  // =========================

  async delete(req, res) {
    try {
      const deleted =
        await Assignment.delete(
          req.params.id
        );

      if (!deleted) {
        return res.status(404).json({
          message: "Assignment not found",
        });
      }

      return res.status(200).json({
        message:
          "Assignment deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete assignment error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to delete assignment",
      });
    }
  },

  async getMySubmission(req, res) {
  try {
    const submission =
      await Submission.findByUserAndAssignment(
        req.user.id,
        req.params.assignmentId
      );

    return res.status(200).json(
      submission || null
    );
  } catch (error) {
    console.error(
      "Get my submission error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch your submission",
    });
  }
},

  // =========================
  // GET SUBMISSIONS
  // =========================

  async getSubmissions(req, res) {
    try {
      const submissions =
        await Submission.findByAssignment(
          req.params.assignmentId
        );

      return res.status(200).json(
        submissions
      );
    } catch (error) {
      console.error(
        "Get submissions error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch submissions",
      });
    }
  },

  // =========================
  // SUBMIT ASSIGNMENT
  // =========================

  async submit(req, res) {
    try {
      const assignmentId = Number(
        req.params.assignmentId
      );

      // =========================
      // CHECK ASSIGNMENT
      // =========================

      const assignment =
        await Assignment.findById(
          assignmentId
        );

      if (!assignment) {
        // Delete uploaded files if assignment
        // doesn't exist
        if (req.files) {
          deleteUploadedFiles(req.files);
        }

        return res.status(404).json({
          message: "Assignment not found",
        });
      }

      // =========================
      // CHECK EXISTING SUBMISSION
      // =========================

      const existing =
        await Submission.findByUserAndAssignment(
          req.user.id,
          assignmentId
        );

      if (existing) {
        if (req.files) {
          deleteUploadedFiles(req.files);
        }

        return res.status(409).json({
          message:
            "You already submitted this assignment",
        });
      }

      // =========================
      // CHECK FILES
      // =========================

      if (
        !req.files ||
        req.files.length === 0
      ) {
        return res.status(400).json({
          message:
            "Attach at least one file before submitting.",
        });
      }

      // =========================
      // CREATE SUBMISSION
      // =========================

      const submissionId =
        await Submission.create({
          assignmentId,
          userId: req.user.id,
          comment: req.body.comment,
        });

      // =========================
      // SAVE FILE INFORMATION
      // =========================

      for (const file of req.files) {
        await Submission.addFile({
          submissionId,
          originalName:
            file.originalname,
          storedName:
            file.filename,
          filePath:
            file.path,
          fileSize:
            file.size,
          mimeType:
            file.mimetype,
        });
      }

      // =========================
      // GET COMPLETE SUBMISSION
      // =========================

      const submission =
        await Submission.findById(
          submissionId
        );

      return res.status(201).json({
        message:
          "Assignment submitted successfully",
        submission,
      });
    } catch (error) {
      console.error(
        "Submit assignment error:",
        error
      );

      // Remove uploaded files if something failed
      if (req.files) {
        deleteUploadedFiles(req.files);
      }

      if (
        error.code === "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          message:
            "File size cannot exceed 10 MB.",
        });
      }

      if (
        error.code === "LIMIT_FILE_COUNT"
      ) {
        return res.status(400).json({
          message:
            "You can upload a maximum of 5 files.",
        });
      }

      return res.status(500).json({
        message:
          error.message ||
          "Failed to submit assignment",
      });
    }
  },

  // =========================
  // GRADE SUBMISSION
  // =========================

  async gradeSubmission(req, res) {
    try {
      const submission =
        await Submission.findById(
          req.params.submissionId
        );

      if (!submission) {
        return res.status(404).json({
          message:
            "Submission not found",
        });
      }

      const {
        score,
        instructorComment,
      } = req.body;

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
        message:
          "Submission graded successfully",
        submission:
          updatedSubmission,
      });
    } catch (error) {
      console.error(
        "Grade submission error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to grade submission",
      });
    }
  },
};

// =========================
// DELETE UPLOADED FILES
// =========================

function deleteUploadedFiles(files) {
  const fs = require("fs");

  for (const file of files) {
    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error(
        "Failed to delete uploaded file:",
        error
      );
    }
  }
}

module.exports = assignmentController;