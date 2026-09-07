const path = require("path");
const fs = require("fs");

const pool = require("../config/database");
const Notification = require("../models/Notification");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

// Must match the directories the upload middlewares write into.
const ASSIGNMENT_UPLOAD_DIR = path.join(
  process.cwd(),
  "secure-uploads",
  "assignments"
);

const SUBMISSION_UPLOAD_DIR = path.join(
  process.cwd(),
  "secure-uploads",
  "submissions"
);

/**
 * Adds a ready-to-use, auth-gated download URL for an assignment's
 * attachment instead of exposing the raw disk path to the client.
 */
function withAttachmentUrl(row) {
  if (!row) return row;

  return {
    ...row,
    attachment_url: row.attachment_path
      ? `/api/assignments/${row.id}/attachment`
      : null,
  };
}

/**
 * =========================================================
 * CREATE ASSIGNMENT
 * Instructor/Admin
 * =========================================================
 */
exports.createAssignment = async (req, res) => {
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
      maxFileSizeMb,
      status,
    } = req.body;

    if (!courseId || !title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "courseId and title are required",
      });
    }

    const [[course]] = await pool.query(
      `
      SELECT id
      FROM courses
      WHERE id = ?
        AND instructor_id = ?
      LIMIT 1
      `,
      [courseId, req.user.id]
    );

    if (!course) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to add assignments to this course",
      });
    }

    // Store just the filename — it lives under secure-uploads/assignments,
    // which is NOT publicly served. Downloads go through the authenticated
    // GET /api/assignments/:id/attachment endpoint below, never a raw URL.
    const attachmentPath = req.file
      ? req.file.filename
      : null;

    const attachmentName = req.file
      ? req.file.originalname
      : null;

    const attachmentSize = req.file
      ? req.file.size
      : null;

    const assignmentId = await Assignment.create({
      courseId: Number(courseId),
      lessonId: lessonId ? Number(lessonId) : null,
      title: title.trim(),
      description: description?.trim() || null,
      instructions: instructions?.trim() || null,
      dueDate: dueDate || null,
      points:
        points !== undefined && points !== ""
          ? Number(points)
          : 100,
      allowedFileTypes: allowedFileTypes || null,
      maxFileSizeMb:
        maxFileSizeMb !== undefined && maxFileSizeMb !== ""
          ? Number(maxFileSizeMb)
          : 10,
      status: status || "draft",
      attachmentPath,
      attachmentName,
      attachmentSize,
    });

    const assignment = await Assignment.findById(assignmentId);

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: withAttachmentUrl(assignment),
    });
  } catch (error) {
    console.error("Create assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create assignment",
    });
  }
};

/**
 * =========================================================
 * GET INSTRUCTOR ASSIGNMENTS
 * Instructor/Admin
 * =========================================================
 */
exports.getInstructorAssignments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        a.id,
        a.course_id,
        a.lesson_id,
        a.title,
        a.description,
        a.instructions,
        a.due_date,
        a.points,
        a.allowed_file_types,
        a.max_file_size_mb,
        a.status,
        a.attachment_path,
        a.attachment_name,
        a.attachment_size,
        a.created_at,
        a.updated_at,
        c.title AS course_title,

        COUNT(s.id) AS total_submissions,

        SUM(
          CASE
            WHEN s.status = 'graded' THEN 1
            ELSE 0
          END
        ) AS graded_submissions,

        SUM(
          CASE
            WHEN s.status IS NOT NULL
             AND s.status != 'graded'
            THEN 1
            ELSE 0
          END
        ) AS pending_submissions

      FROM assignments a

      JOIN courses c
        ON a.course_id = c.id

      LEFT JOIN submissions s
        ON s.assignment_id = a.id

      WHERE c.instructor_id = ?

      GROUP BY
        a.id,
        a.course_id,
        a.lesson_id,
        a.title,
        a.description,
        a.instructions,
        a.due_date,
        a.points,
        a.allowed_file_types,
        a.max_file_size_mb,
        a.status,
        a.attachment_path,
        a.attachment_name,
        a.attachment_size,
        a.created_at,
        a.updated_at,
        c.title

      ORDER BY a.created_at DESC
      `,
      [req.user.id]
    );

    return res.json({
      success: true,
      data: rows.map(withAttachmentUrl),
    });
  } catch (error) {
    console.error("Get instructor assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
    });
  }
};

/**
 * =========================================================
 * GET STUDENT ASSIGNMENTS
 * Student
 * =========================================================
 */
exports.getStudentAssignments = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT
        a.id,
        a.course_id,
        a.lesson_id,
        a.title,
        a.description,
        a.instructions,
        a.due_date,
        a.points,
        a.allowed_file_types,
        a.max_file_size_mb,
        a.status,
        a.attachment_path,
        a.attachment_name,
        a.attachment_size,
        a.created_at,

        c.title AS course_title,

        CONCAT(
          u.first_name,
          ' ',
          u.last_name
        ) AS instructor_name,

        s.id AS submission_id,
        s.status AS submission_status,
        s.submitted_at,
        s.score,
        s.instructor_comment,
        s.graded_at

      FROM assignments a

      JOIN courses c
        ON c.id = a.course_id

      JOIN enrollments e
        ON e.course_id = a.course_id
        AND e.user_id = ?
        AND e.status = 'active'

      LEFT JOIN users u
        ON c.instructor_id = u.id

      LEFT JOIN submissions s
        ON s.assignment_id = a.id
        AND s.user_id = ?

      WHERE a.status = 'published'

      ORDER BY
        a.due_date IS NULL,
        a.due_date ASC,
        a.created_at DESC
      `,
      [userId, userId]
    );

    return res.json({
      success: true,
      data: rows.map(withAttachmentUrl),
    });
  } catch (error) {
    console.error("Get student assignments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your assignments",
    });
  }
};

/**
 * =========================================================
 * GET SINGLE ASSIGNMENT
 * Student
 *
 * FIXES:
 * GET /api/assignments/:id
 * =========================================================
 */
exports.getAssignmentById = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    const userId = req.user.id;

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    const [[assignment]] = await pool.query(
      `
      SELECT
        a.id,
        a.course_id,
        a.lesson_id,
        a.title,
        a.description,
        a.instructions,
        a.due_date,
        a.points,
        a.allowed_file_types,
        a.max_file_size_mb,
        a.status,
        a.attachment_path,
        a.attachment_name,
        a.attachment_size,
        a.created_at,
        a.updated_at,

        c.title AS course_title,

        CONCAT(
          u.first_name,
          ' ',
          u.last_name
        ) AS instructor_name

      FROM assignments a

      JOIN courses c
        ON c.id = a.course_id

      LEFT JOIN users u
        ON u.id = c.instructor_id

      JOIN enrollments e
        ON e.course_id = a.course_id
        AND e.user_id = ?
        AND e.status = 'active'

      WHERE a.id = ?
        AND a.status = 'published'

      LIMIT 1
      `,
      [userId, assignmentId]
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "Assignment not found or you are not enrolled in this course",
      });
    }

    return res.json({
      success: true,
      data: withAttachmentUrl(assignment),
    });
  } catch (error) {
    console.error("Get assignment by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignment",
    });
  }
};

/**
 * =========================================================
 * GET MY SUBMISSION
 * Student
 *
 * FIXES:
 * GET /api/assignments/:id/my-submission
 * =========================================================
 */
exports.getMySubmission = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    const userId = req.user.id;

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    const [[assignment]] = await pool.query(
      `
      SELECT a.id
      FROM assignments a

      JOIN enrollments e
        ON e.course_id = a.course_id
        AND e.user_id = ?
        AND e.status = 'active'

      WHERE a.id = ?

      LIMIT 1
      `,
      [userId, assignmentId]
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const [[submission]] = await pool.query(
      `
      SELECT
        s.id,
        s.assignment_id,
        s.user_id,
        s.comment,
        s.score,
        s.instructor_comment,
        s.graded_at,
        s.status,
        s.submitted_at

      FROM submissions s

      WHERE s.assignment_id = ?
        AND s.user_id = ?

      ORDER BY s.submitted_at DESC

      LIMIT 1
      `,
      [assignmentId, userId]
    );

    if (!submission) {
      return res.json({
        success: true,
        data: null,
      });
    }

    const files = await Submission.getFilesBySubmissionId(
      submission.id
    );

    return res.json({
      success: true,
      data: {
        ...submission,
        files: files.map((file) => ({
          id: file.id,
          original_name: file.original_name,
          file_size: file.file_size,
          url: `/api/assignments/submissions/${submission.id}/files/${file.id}`,
        })),
      },
    });
  } catch (error) {
    console.error("Get my submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your submission",
    });
  }
};

/**
 * =========================================================
 * GET ALL INSTRUCTOR SUBMISSIONS
 * Instructor/Admin
 * =========================================================
 */
exports.getInstructorSubmissions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        s.id,
        s.assignment_id,
        s.comment,
        s.score,
        s.instructor_comment,
        s.graded_at,
        s.status,
        s.submitted_at,

        u.id AS student_id,

        CONCAT(
          u.first_name,
          ' ',
          u.last_name
        ) AS student_name,

        u.email AS student_email,

        a.title AS assignment_title,
        a.points AS max_points,

        c.id AS course_id,
        c.title AS course_title

      FROM submissions s

      JOIN users u
        ON s.user_id = u.id

      JOIN assignments a
        ON s.assignment_id = a.id

      JOIN courses c
        ON a.course_id = c.id

      WHERE c.instructor_id = ?

      ORDER BY s.submitted_at DESC
      `,
      [req.user.id]
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get instructor submissions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch student submissions",
    });
  }
};

/**
 * =========================================================
 * GET SINGLE SUBMISSION
 * Instructor/Admin
 * =========================================================
 */
exports.getSubmissionById = async (req, res) => {
  try {
    const submissionId = Number(req.params.id);

    if (!Number.isInteger(submissionId) || submissionId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID",
      });
    }

    const [[submission]] = await pool.query(
      `
      SELECT
        s.id,
        s.assignment_id,
        s.user_id AS student_id,
        s.comment,
        s.score,
        s.instructor_comment,
        s.graded_at,
        s.status,
        s.submitted_at,

        u.first_name,
        u.last_name,
        u.email,

        a.title AS assignment_title,
        a.description AS assignment_description,
        a.instructions,
        a.points AS max_points,

        c.id AS course_id,
        c.title AS course_title

      FROM submissions s

      JOIN users u
        ON u.id = s.user_id

      JOIN assignments a
        ON a.id = s.assignment_id

      JOIN courses c
        ON c.id = a.course_id

      WHERE s.id = ?
        AND c.instructor_id = ?

      LIMIT 1
      `,
      [submissionId, req.user.id]
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    const files = await Submission.getFilesBySubmissionId(
      submission.id
    );

    return res.json({
      success: true,
      data: {
        ...submission,
        files: files.map((file) => ({
          id: file.id,
          original_name: file.original_name,
          file_size: file.file_size,
          url: `/api/assignments/submissions/${submission.id}/files/${file.id}`,
        })),
      },
    });
  } catch (error) {
    console.error("Get submission by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch submission",
    });
  }
};

/**
 * =========================================================
 * GRADE SUBMISSION
 * Instructor/Admin
 * =========================================================
 */
exports.gradeSubmission = async (req, res) => {
  try {
    const submissionId = Number(req.params.id);

    const score = Number(req.body.score);

    const feedback = String(
      req.body.feedback ??
        req.body.instructorComment ??
        ""
    ).trim();

    if (
      !Number.isInteger(submissionId) ||
      submissionId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission ID",
      });
    }

    if (!Number.isFinite(score) || score < 0) {
      return res.status(400).json({
        success: false,
        message:
          "A valid non-negative score is required",
      });
    }

    const [[row]] = await pool.query(
      `
      SELECT
        s.id,
        s.user_id,
        s.assignment_id,

        a.points,
        a.title AS assignment_title,

        c.title AS course_title

      FROM submissions s

      JOIN assignments a
        ON s.assignment_id = a.id

      JOIN courses c
        ON a.course_id = c.id

      WHERE s.id = ?
        AND c.instructor_id = ?

      LIMIT 1
      `,
      [submissionId, req.user.id]
    );

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    const maxPoints = Number(row.points);

    if (score > maxPoints) {
      return res.status(400).json({
        success: false,
        message: `Score cannot exceed ${maxPoints}`,
      });
    }

    await pool.query(
      `
      UPDATE submissions

      SET
        score = ?,
        instructor_comment = ?,
        graded_at = NOW(),
        status = 'graded'

      WHERE id = ?
      `,
      [score, feedback || null, submissionId]
    );

    /**
     * Notify student
     */
    try {
      await Notification.create({
        userId: row.user_id,
        title: "Assignment graded",
        message: `Your assignment "${row.assignment_title}" has been graded. You received ${score}/${maxPoints}.`,
        category: "Assignments",
        entityType: "submission",
        entityId: submissionId,
        targetPath: `/assignments/${row.assignment_id}`,
      });
    } catch (notificationError) {
      console.error(
        "Notification creation error:",
        notificationError
      );
    }

    const [[updatedSubmission]] = await pool.query(
      `
      SELECT
        s.id,
        s.assignment_id,
        s.user_id,
        s.score,
        s.instructor_comment,
        s.status,
        s.submitted_at,
        s.graded_at

      FROM submissions s

      WHERE s.id = ?

      LIMIT 1
      `,
      [submissionId]
    );

    return res.json({
      success: true,
      message: "Assignment graded successfully",
      data: updatedSubmission,
    });
  } catch (error) {
    console.error("Grade submission error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to grade submission",
    });
  }
};

/**
 * =========================================================
 * GET STUDENT ASSIGNMENT RESULT
 * Student
 * =========================================================
 */
exports.getMyAssignmentResult = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    const userId = req.user.id;

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    const [[result]] = await pool.query(
      `
      SELECT
        s.id AS submission_id,
        s.assignment_id,
        s.score,
        s.instructor_comment,
        s.status,
        s.submitted_at,
        s.graded_at,

        a.title AS assignment_title,
        a.points AS max_points,

        c.title AS course_title

      FROM submissions s

      JOIN assignments a
        ON a.id = s.assignment_id

      JOIN courses c
        ON c.id = a.course_id

      WHERE s.assignment_id = ?
        AND s.user_id = ?

      ORDER BY s.submitted_at DESC

      LIMIT 1
      `,
      [assignmentId, userId]
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "You have not submitted this assignment yet",
      });
    }

    const maxPoints = Number(result.max_points);
    const score = Number(result.score);

    const percentage =
      result.score !== null &&
      maxPoints > 0
        ? Number(((score / maxPoints) * 100).toFixed(2))
        : null;

    return res.json({
      success: true,
      data: {
        ...result,
        percentage,
      },
    });
  } catch (error) {
    console.error(
      "Get assignment result error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assignment result",
    });
  }
};

/**
 * =========================================================
 * SUBMIT ASSIGNMENT
 * Student
 *
 * POST /api/assignments/:id/submit  (multipart, field "files")
 * =========================================================
 */
exports.submitAssignment = async (req, res) => {
  // If multer rejected the files (bad type/too big/too many), it
  // calls next(err) and errorMiddleware would return a generic 500.
  // We check for that up front so the student gets a clear message.
  try {
    const assignmentId = Number(req.params.id);
    const userId = req.user.id;
    const comment = (req.body.comment || "").trim();
    const files = req.files || [];

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    if (files.length === 0 && !comment) {
      return res.status(400).json({
        success: false,
        message:
          "Add at least one file or a comment before submitting",
      });
    }

    const [[assignment]] = await pool.query(
      `
      SELECT
        a.id,
        a.status,
        a.due_date

      FROM assignments a

      JOIN enrollments e
        ON e.course_id = a.course_id
        AND e.user_id = ?
        AND e.status = 'active'

      WHERE a.id = ?

      LIMIT 1
      `,
      [userId, assignmentId]
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message:
          "Assignment not found or you are not enrolled in this course",
      });
    }

    if (assignment.status !== "published") {
      return res.status(403).json({
        success: false,
        message: "This assignment is not open for submissions",
      });
    }

    const isLate =
      assignment.due_date &&
      new Date(assignment.due_date).getTime() < Date.now();

    const submissionId = await Submission.createWithFiles({
      assignmentId,
      userId,
      comment: comment || null,
      status: isLate ? "late" : "submitted",
      files: files.map((file) => ({
        filePath: file.filename,
        originalName: file.originalname,
        fileSize: file.size,
      })),
    });

    const [[submission]] = await pool.query(
      `
      SELECT id, assignment_id, user_id, comment, status, submitted_at
      FROM submissions
      WHERE id = ?
      LIMIT 1
      `,
      [submissionId]
    );

    const savedFiles = await Submission.getFilesBySubmissionId(
      submissionId
    );

    return res.status(201).json({
      success: true,
      message: "Assignment submitted successfully",
      data: {
        ...submission,
        files: savedFiles.map((file) => ({
          id: file.id,
          original_name: file.original_name,
          file_size: file.file_size,
          url: `/api/assignments/submissions/${submissionId}/files/${file.id}`,
        })),
      },
    });
  } catch (error) {
    console.error("Submit assignment error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message && error.message.includes("not allowed")
          ? error.message
          : "Failed to submit assignment",
    });
  }
};

/**
 * =========================================================
 * DOWNLOAD ASSIGNMENT ATTACHMENT
 * Instructor (owns the course) OR Student (enrolled, published)
 *
 * GET /api/assignments/:id/attachment
 *
 * SECURITY: the file lives outside the public "uploads" static
 * folder (see assignmentUploadMiddleware.js). This is the only
 * way to reach it, and only after an ownership/enrollment check.
 * =========================================================
 */
exports.downloadAssignmentAttachment = async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    const [[assignment]] = await pool.query(
      `
      SELECT
        a.id,
        a.status,
        a.attachment_path,
        a.attachment_name,
        c.instructor_id

      FROM assignments a

      JOIN courses c
        ON c.id = a.course_id

      WHERE a.id = ?

      LIMIT 1
      `,
      [assignmentId]
    );

    if (!assignment || !assignment.attachment_path) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found",
      });
    }

    const isOwnerInstructor =
      (userRole === "instructor" || userRole === "admin") &&
      assignment.instructor_id === userId;

    let isEnrolledStudent = false;

    if (!isOwnerInstructor) {
      const [[enrollment]] = await pool.query(
        `
        SELECT 1
        FROM enrollments
        WHERE course_id = (
          SELECT course_id FROM assignments WHERE id = ?
        )
          AND user_id = ?
          AND status = 'active'
        LIMIT 1
        `,
        [assignmentId, userId]
      );

      isEnrolledStudent =
        !!enrollment && assignment.status === "published";
    }

    if (!isOwnerInstructor && !isEnrolledStudent) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this file",
      });
    }

    const filePath = path.join(
      ASSIGNMENT_UPLOAD_DIR,
      path.basename(assignment.attachment_path)
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Attachment file is missing on the server",
      });
    }

    return res.download(
      filePath,
      assignment.attachment_name || path.basename(filePath)
    );
  } catch (error) {
    console.error("Download assignment attachment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to download attachment",
    });
  }
};

/**
 * =========================================================
 * DOWNLOAD SUBMISSION FILE
 * Instructor (owns the course) OR the submitting student
 *
 * GET /api/assignments/submissions/:submissionId/files/:fileId
 * =========================================================
 */
exports.downloadSubmissionFile = async (req, res) => {
  try {
    const submissionId = Number(req.params.submissionId);
    const fileId = Number(req.params.fileId);
    const userId = req.user.id;
    const userRole = req.user.role;

    if (
      !Number.isInteger(submissionId) ||
      submissionId <= 0 ||
      !Number.isInteger(fileId) ||
      fileId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission or file ID",
      });
    }

    const [[submission]] = await pool.query(
      `
      SELECT
        s.id,
        s.user_id AS student_id,
        c.instructor_id

      FROM submissions s

      JOIN assignments a
        ON a.id = s.assignment_id

      JOIN courses c
        ON c.id = a.course_id

      WHERE s.id = ?

      LIMIT 1
      `,
      [submissionId]
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    const isOwnerInstructor =
      (userRole === "instructor" || userRole === "admin") &&
      submission.instructor_id === userId;

    const isSubmittingStudent =
      submission.student_id === userId;

    if (!isOwnerInstructor && !isSubmittingStudent) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this file",
      });
    }

    const file = await Submission.getFileById(fileId);

    if (!file || file.submission_id !== submissionId) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const filePath = path.join(
      SUBMISSION_UPLOAD_DIR,
      path.basename(file.file_path)
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File is missing on the server",
      });
    }

    return res.download(filePath, file.original_name);
  } catch (error) {
    console.error("Download submission file error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to download file",
    });
  }
};