const crypto = require("crypto");

const Certificate =
  require("../models/Certificate");

const Course =
  require("../models/Course");

const Enrollment =
  require("../models/Enrollment");

const pool =
  require("../config/database");

function makeCertificateNumber() {
  const randomPart =
    crypto
      .randomBytes(5)
      .toString("hex")
      .toUpperCase();

  return `OSTA-${new Date().getFullYear()}-${randomPart}`;
}

const certificateController = {
  // =====================================================
  // GET MY CERTIFICATES
  // =====================================================

  async getMyCertificates(req, res) {
    try {
      const certificates =
        await Certificate.findByUser(
          req.user.id
        );

      return res.status(200).json(
        Array.isArray(certificates)
          ? certificates
          : []
      );
    } catch (error) {
      console.error(
        "Get my certificates error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch certificates",
      });
    }
  },

  // =====================================================
  // GET SINGLE CERTIFICATE
  // =====================================================

  async getById(req, res) {
    try {
      const certificate =
        await Certificate.findById(
          req.params.id
        );

      if (!certificate) {
        return res.status(404).json({
          message:
            "Certificate not found",
        });
      }

      // Students can only view their own certificate.
      // Admins can view any certificate.

      if (
        req.user.role !== "admin" &&
        Number(certificate.user_id) !==
          Number(req.user.id)
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to view this certificate",
        });
      }

      return res.status(200).json(
        certificate
      );
    } catch (error) {
      console.error(
        "Get certificate error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch certificate",
      });
    }
  },

  // =====================================================
  // GENERATE CERTIFICATE
  // =====================================================

  async generate(req, res) {
    try {
      const userId =
        Number(req.user.id);

      const courseId =
        Number(req.params.courseId);

      if (
        !Number.isInteger(courseId) ||
        courseId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid course ID",
        });
      }

      // -------------------------------------------------
      // STUDENT ONLY
      // -------------------------------------------------

      if (req.user.role !== "student") {
        return res.status(403).json({
          message:
            "Only students can receive course certificates",
        });
      }

      // -------------------------------------------------
      // COURSE
      // -------------------------------------------------

      const course =
        await Course.findById(
          courseId
        );

      if (!course) {
        return res.status(404).json({
          message:
            "Course not found",
        });
      }

      // -------------------------------------------------
      // ENROLLMENT
      // -------------------------------------------------

      const enrollment =
        await Enrollment.findByUserAndCourse(
          userId,
          courseId
        );

      if (!enrollment) {
        return res.status(403).json({
          message:
            "You are not enrolled in this course",
        });
      }

      // -------------------------------------------------
      // EXISTING CERTIFICATE
      // -------------------------------------------------

      const existing =
        await Certificate.findByUserAndCourse(
          userId,
          courseId
        );

      if (existing) {
        return res.status(200).json({
          message:
            "Certificate already exists",
          certificate: existing,
        });
      }

      // -------------------------------------------------
      // GET PUBLISHED LESSONS
      // -------------------------------------------------

      const [lessonRows] =
        await pool.execute(
          `
          SELECT
            l.id,
            l.title
          FROM lessons l
          JOIN course_sections cs
            ON l.section_id = cs.id
          WHERE cs.course_id = ?
            AND l.is_published = 1
          ORDER BY
            cs.section_order,
            l.lesson_order
          `,
          [courseId]
        );

      if (
        lessonRows.length === 0
      ) {
        return res.status(400).json({
          message:
            "This course does not have any published lessons yet",
        });
      }

      // -------------------------------------------------
      // CHECK EVERY LESSON
      // -------------------------------------------------

      const lessonIds =
        lessonRows.map(
          (lesson) =>
            Number(lesson.id)
        );

      const placeholders =
        lessonIds
          .map(() => "?")
          .join(",");

      const [
        progressRows,
      ] = await pool.execute(
        `
        SELECT
          lesson_id,
          completed
        FROM lesson_progress
        WHERE user_id = ?
          AND lesson_id IN (${placeholders})
        `,
        [
          userId,
          ...lessonIds,
        ]
      );

      const completedIds =
        new Set(
          progressRows
            .filter(
              (row) =>
                Boolean(
                  row.completed
                )
            )
            .map((row) =>
              Number(
                row.lesson_id
              )
            )
        );

      const missingLessons =
        lessonRows.filter(
          (lesson) =>
            !completedIds.has(
              Number(
                lesson.id
              )
            )
        );

      if (
        missingLessons.length > 0
      ) {
        return res.status(400).json({
          message:
            "Complete all lessons before requesting your certificate",
          missingLessons:
            missingLessons.map(
              (lesson) =>
                lesson.title
            ),
        });
      }

      // -------------------------------------------------
      // FIND COURSE QUIZZES
      // -------------------------------------------------

      const [
        quizRows,
      ] = await pool.execute(
        `
        SELECT
          id,
          title,
          pass_percent
        FROM quizzes
        WHERE course_id = ?
          AND status = 'published'
        ORDER BY id
        `,
        [courseId]
      );

      // -------------------------------------------------
      // IF COURSE HAS QUIZ, REQUIRE ONE PASSED ATTEMPT
      // -------------------------------------------------

      if (quizRows.length > 0) {
        const quizIds =
          quizRows.map(
            (quiz) =>
              Number(quiz.id)
          );

        const quizPlaceholders =
          quizIds
            .map(() => "?")
            .join(",");

        const [
          passedAttempts,
        ] = await pool.execute(
          `
          SELECT
            qa.id,
            qa.quiz_id,
            qa.percentage,
            qa.score
          FROM quiz_attempts qa
          WHERE qa.user_id = ?
            AND qa.quiz_id IN (${quizPlaceholders})
            AND qa.status = 'submitted'
            AND qa.passed = 1
          ORDER BY qa.percentage DESC, qa.id DESC
          `,
          [
            userId,
            ...quizIds,
          ]
        );

        if (
          passedAttempts.length === 0
        ) {
          return res.status(400).json({
            message:
              "Pass at least one course quiz before requesting your certificate",
          });
        }
      }

      // -------------------------------------------------
      // CALCULATE SCORE
      // -------------------------------------------------

      let score = null;

      const [
        bestAttempts,
      ] = await pool.execute(
        `
        SELECT
          qa.percentage
        FROM quiz_attempts qa
        JOIN quizzes q
          ON qa.quiz_id = q.id
        WHERE qa.user_id = ?
          AND q.course_id = ?
          AND qa.status = 'submitted'
          AND qa.passed = 1
        ORDER BY
          qa.percentage DESC,
          qa.id DESC
        LIMIT 1
        `,
        [userId, courseId]
      );

      if (
        bestAttempts.length > 0
      ) {
        score = Number(
          bestAttempts[0].percentage
        );
      }

      // -------------------------------------------------
      // RECIPIENT
      // -------------------------------------------------

      const [
        userRows,
      ] = await pool.execute(
        `
        SELECT
          first_name,
          last_name
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [userId]
      );

      if (userRows.length === 0) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      const recipientName =
        `${userRows[0].first_name} ${userRows[0].last_name}`;

      // -------------------------------------------------
      // SKILLS
      // -------------------------------------------------

      const skills =
        lessonRows
          .slice(0, 8)
          .map(
            (lesson) =>
              lesson.title
          )
          .join(", ");

      // -------------------------------------------------
      // CREATE CERTIFICATE
      // -------------------------------------------------

      const certificateNumber =
        makeCertificateNumber();

      const completionDate =
        new Date()
          .toISOString()
          .slice(0, 10);

      const certificateId =
        await Certificate.create({
          userId,
          courseId,
          certificateNumber,
          recipientName,
          completionDate,
          score,
          skills,
        });

      const certificate =
        await Certificate.findById(
          certificateId
        );

      return res.status(201).json({
        message:
          "Certificate generated successfully",
        certificate,
      });
    } catch (error) {
      console.error(
        "Generate certificate error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to generate certificate",
      });
    }
  },
};

module.exports =
  certificateController;