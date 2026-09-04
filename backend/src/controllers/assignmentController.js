const pool = require('../config/database');
const Notification = require('../models/Notification');
const Assignment = require('../models/Assignment');

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

    if (!courseId || !title) {
      return res.status(400).json({
        success: false,
        message: 'courseId and title are required',
      });
    }

    const [[course]] = await pool.query(
      `SELECT id FROM courses WHERE id = ? AND instructor_id = ?`,
      [courseId, req.user.id]
    );

    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add assignments to this course',
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
      maxFileSizeMb,
      status,
    });

    const assignment = await Assignment.findById(assignmentId);

    res.status(201).json({ success: true, data: assignment });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment',
    });
  }
};

exports.getInstructorSubmissions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id,s.assignment_id,s.comment,s.score,s.instructor_comment,s.graded_at,s.status,s.submitted_at,u.id student_id,CONCAT(u.first_name,' ',u.last_name) student_name,u.email student_email,a.title assignment_title,a.points,c.id course_id,c.title course_title FROM submissions s JOIN users u ON s.user_id=u.id JOIN assignments a ON s.assignment_id=a.id JOIN courses c ON a.course_id=c.id WHERE c.instructor_id=? ORDER BY s.submitted_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to fetch student submissions' });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const score = Number(req.body.score);
    const feedback = String(req.body.feedback ?? req.body.instructorComment ?? '').trim();

    if (!Number.isInteger(id) || !Number.isFinite(score) || score < 0) {
      return res.status(400).json({ success: false, message: 'A valid non-negative score is required' });
    }

    const [[row]] = await pool.query(
      `SELECT s.id,s.user_id,a.points,a.title assignment_title,c.title course_title FROM submissions s JOIN assignments a ON s.assignment_id=a.id JOIN courses c ON a.course_id=c.id WHERE s.id=? AND c.instructor_id=?`,
      [id, req.user.id]
    );

    if (!row) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    if (score > Number(row.points)) {
      return res.status(400).json({ success: false, message: `Score cannot exceed ${row.points}` });
    }

    await pool.query(
      `UPDATE submissions SET score=?,instructor_comment=?,graded_at=NOW(),status='graded' WHERE id=?`,
      [score, feedback, id]
    );

    await Notification.create({
      userId: row.user_id,
      title: 'Assignment graded',
      message: `Your assignment "${row.assignment_title}" has been graded.`,
      category: 'Assignments',
      entityType: 'submission',
      entityId: id,
      targetPath: `/assignments/${row.id}`,
    });

    res.json({ success: true, message: 'Assignment graded successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Failed to grade submission' });
  }
};