const crypto = require("crypto");

const pool = require("../config/database");
const Certificate = require("../models/Certificate");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Notification = require("../models/Notification");

function makeCertificateNumber() {
  const randomPart = crypto.randomBytes(5).toString("hex").toUpperCase();
  return `OSTA-${new Date().getFullYear()}-${randomPart}`;
}

/**
 * The single source of truth for "has this student earned a certificate
 * for this course yet?". Returns a detailed breakdown (not just a
 * yes/no) so both the automatic hooks and the student-facing UI can show
 * exactly what's still missing, per course, based on that course's own
 * configuration:
 *
 *  - Lessons are always required: every published lesson must be marked
 *    completed for this student.
 *  - A quiz is only required if the course actually has a published
 *    quiz — if it has none, this requirement is trivially satisfied.
 *    If it has one or more, at least one passed attempt is required.
 *  - Assignments are only required if the course has published
 *    assignments. If it does, every one of them needs a submission from
 *    this student with status 'graded'. (There's no minimum-score column
 *    for assignments yet — unlike quizzes' pass_percent — so "graded"
 *    is treated as "passing" for now.)
 */
async function checkCertificateEligibility(userId, courseId) {
  const pendingRequirements = [];

  // ---------------------------------------------------------------
  // LESSONS
  // ---------------------------------------------------------------
  const [lessonRows] = await pool.query(
    `
    SELECT l.id
    FROM lessons l
    JOIN course_sections cs ON l.section_id = cs.id
    WHERE cs.course_id = ?
      AND l.is_published = 1
    `,
    [courseId]
  );

  const totalRequiredLessons = lessonRows.length;
  let lessonsCompleted = 0;

  if (totalRequiredLessons > 0) {
    const lessonIds = lessonRows.map((row) => Number(row.id));
    const placeholders = lessonIds.map(() => "?").join(",");

    const [progressRows] = await pool.query(
      `
      SELECT lesson_id, completed
      FROM lesson_progress
      WHERE user_id = ?
        AND lesson_id IN (${placeholders})
      `,
      [userId, ...lessonIds]
    );

    const completedIds = new Set(
      progressRows
        .filter((row) => Boolean(row.completed))
        .map((row) => Number(row.lesson_id))
    );

    lessonsCompleted = lessonIds.filter((id) => completedIds.has(id)).length;
  }

  const lessonsComplete =
    totalRequiredLessons === 0 || lessonsCompleted === totalRequiredLessons;

  const progressPercentage =
    totalRequiredLessons === 0
      ? 100
      : Math.round((lessonsCompleted / totalRequiredLessons) * 100);

  if (!lessonsComplete) {
    pendingRequirements.push(
      `Complete all lessons (${lessonsCompleted}/${totalRequiredLessons} done)`
    );
  }

  // ---------------------------------------------------------------
  // ASSESSMENT / QUIZ — only required if the course has one
  // ---------------------------------------------------------------
  const [quizRows] = await pool.query(
    `SELECT id FROM quizzes WHERE course_id = ? AND status = 'published'`,
    [courseId]
  );

  const assessmentRequired = quizRows.length > 0;
  let assessmentPassed = true;

  if (assessmentRequired) {
    const quizIds = quizRows.map((row) => Number(row.id));
    const placeholders = quizIds.map(() => "?").join(",");

    const [passedRows] = await pool.query(
      `
      SELECT id
      FROM quiz_attempts
      WHERE user_id = ?
        AND quiz_id IN (${placeholders})
        AND status = 'submitted'
        AND passed = 1
      LIMIT 1
      `,
      [userId, ...quizIds]
    );

    assessmentPassed = passedRows.length > 0;
  }

  if (assessmentRequired && !assessmentPassed) {
    pendingRequirements.push("Pass the required assessment");
  }

  // ---------------------------------------------------------------
  // ASSIGNMENTS — only required if the course has published ones
  // ---------------------------------------------------------------
  const [assignmentRows] = await pool.query(
    `SELECT id FROM assignments WHERE course_id = ? AND status = 'published'`,
    [courseId]
  );

  const assignmentsRequired = assignmentRows.length;
  let assignmentsCompleted = 0;

  if (assignmentsRequired > 0) {
    const assignmentIds = assignmentRows.map((row) => Number(row.id));
    const placeholders = assignmentIds.map(() => "?").join(",");

    const [submissionRows] = await pool.query(
      `
      SELECT assignment_id, status
      FROM submissions
      WHERE user_id = ?
        AND assignment_id IN (${placeholders})
      `,
      [userId, ...assignmentIds]
    );

    const gradedIds = new Set(
      submissionRows
        .filter((row) => row.status === "graded")
        .map((row) => Number(row.assignment_id))
    );

    assignmentsCompleted = assignmentIds.filter((id) =>
      gradedIds.has(id)
    ).length;
  }

  const assignmentsComplete =
    assignmentsRequired === 0 || assignmentsCompleted === assignmentsRequired;

  if (!assignmentsComplete) {
    pendingRequirements.push(
      `Submit and get all assignments graded (${assignmentsCompleted}/${assignmentsRequired} graded)`
    );
  }

  return {
    eligible: lessonsComplete && assessmentPassed && assignmentsComplete,
    lessonsCompleted,
    totalRequiredLessons,
    progressPercentage,
    assessmentRequired,
    assessmentPassed,
    assignmentsRequired,
    assignmentsCompleted,
    pendingRequirements,
  };
}

/**
 * Creates the certificate record. Assumes eligibility has already been
 * verified and a duplicate check already passed — the only callers are
 * issueCertificateIfEligible() below and the controller's manual-generate
 * path, both of which do that check first.
 */
async function generateCertificate(userId, courseId) {
  const [bestAttempts] = await pool.query(
    `
    SELECT qa.percentage
    FROM quiz_attempts qa
    JOIN quizzes q ON qa.quiz_id = q.id
    WHERE qa.user_id = ?
      AND q.course_id = ?
      AND qa.status = 'submitted'
      AND qa.passed = 1
    ORDER BY qa.percentage DESC, qa.id DESC
    LIMIT 1
    `,
    [userId, courseId]
  );

  const score =
    bestAttempts.length > 0 ? Number(bestAttempts[0].percentage) : null;

  const [userRows] = await pool.query(
    `SELECT first_name, last_name FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );

  if (userRows.length === 0) {
    throw new Error("User not found");
  }

  const recipientName = `${userRows[0].first_name} ${userRows[0].last_name}`;

  const [lessonRows] = await pool.query(
    `
    SELECT l.title
    FROM lessons l
    JOIN course_sections cs ON l.section_id = cs.id
    WHERE cs.course_id = ?
      AND l.is_published = 1
    ORDER BY cs.section_order, l.lesson_order
    LIMIT 8
    `,
    [courseId]
  );

  const skills = lessonRows.map((row) => row.title).join(", ");

  const certificateNumber = makeCertificateNumber();
  const completionDate = new Date().toISOString().slice(0, 10);

  const certificateId = await Certificate.create({
    userId,
    courseId,
    certificateNumber,
    recipientName,
    completionDate,
    score,
    skills,
  });

  return Certificate.findById(certificateId);
}

/**
 * The automatic-issuance entry point. Safe — and cheap enough — to call
 * opportunistically from any progress-changing action (lesson completed,
 * quiz submitted, assignment graded) or a proactive sync (see
 * getMyCertificates in the controller, which calls this for every
 * enrolled course on page load to catch completions that happened before
 * this logic existed, or were otherwise missed).
 *
 * Idempotent: always checks for an existing certificate first, so calling
 * it many times for an already-certified student is a no-op. Never
 * throws — a problem here should never break the lesson/quiz/grading
 * flow (or page load) that triggered it; errors are logged with the
 * student/course context needed to debug them.
 *
 * Returns the certificate (existing or newly issued) or null if the
 * student isn't eligible yet (or on error).
 */
async function issueCertificateIfEligible(userId, courseId) {
  try {
    const enrollment = await Enrollment.findByUserAndCourse(userId, courseId);
    if (!enrollment) return null;

    const existing = await Certificate.findByUserAndCourse(userId, courseId);
    if (existing) return existing;

    const eligibility = await checkCertificateEligibility(userId, courseId);
    if (!eligibility.eligible) return null;

    const certificate = await generateCertificate(userId, courseId);

    try {
      const course = await Course.findById(courseId);

      await Notification.create({
        userId,
        title: "Certificate earned",
        message: `Congratulations! You have successfully completed ${
          course?.title || "the course"
        }. Your OSTA certificate is now available.`,
        category: "Certificates",
        entityType: "certificate",
        entityId: certificate.id,
        targetPath: `/certificates/${certificate.id}`,
      });
    } catch (notificationError) {
      console.error(
        `Certificate notification error (userId=${userId}, courseId=${courseId}):`,
        notificationError
      );
    }

    return certificate;
  } catch (error) {
    console.error(
      `issueCertificateIfEligible error (userId=${userId}, courseId=${courseId}):`,
      error
    );
    return null;
  }
}

async function getStudentCertificates(userId) {
  return Certificate.findByUser(userId);
}

async function getCertificateById(id) {
  return Certificate.findById(id);
}

module.exports = {
  checkCertificateEligibility,
  generateCertificate,
  issueCertificateIfEligible,
  getStudentCertificates,
  getCertificateById,
};