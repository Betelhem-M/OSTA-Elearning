const Certificate = require("../models/Certificate");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const certificateService = require("../services/certificateService");

const certificateController = {
  // =====================================================
  // GET MY CERTIFICATES
  //
  // Also proactively syncs certificate eligibility for every course this
  // student is enrolled in before returning the list. This is what makes
  // a certificate appear on page load/refresh even if the course was
  // actually finished before the automatic hooks existed (or a hook was
  // otherwise missed) — the student doesn't have to take one more action
  // to "re-trigger" anything.
  //
  // Response shape: { certificates: [...], pending: [...] } — `pending`
  // covers every enrolled course that doesn't have a certificate yet,
  // with the specific requirements still outstanding for each, so the
  // frontend can show real per-course status instead of one generic
  // "keep learning" message.
  // =====================================================

  async getMyCertificates(req, res) {
    const userId = Number(req.user.id);

    try {
      const enrollments = await Enrollment.findByUser(userId);

      for (const enrollment of enrollments) {
        try {
          await certificateService.issueCertificateIfEligible(
            userId,
            enrollment.course_id
          );
        } catch (syncError) {
          console.error(
            `Certificate sync failed (userId=${userId}, courseId=${enrollment.course_id}):`,
            syncError
          );
        }
      }

      const certificates = await certificateService.getStudentCertificates(
        userId
      );

      const certifiedCourseIds = new Set(
        (certificates || []).map((c) => Number(c.course_id))
      );

      const pending = [];

      for (const enrollment of enrollments) {
        if (certifiedCourseIds.has(Number(enrollment.course_id))) continue;

        try {
          const eligibility = await certificateService.checkCertificateEligibility(
            userId,
            enrollment.course_id
          );

          pending.push({
            courseId: enrollment.course_id,
            courseTitle: enrollment.course_title,
            ...eligibility,
          });
        } catch (eligibilityError) {
          console.error(
            `Eligibility check failed (userId=${userId}, courseId=${enrollment.course_id}):`,
            eligibilityError
          );
        }
      }

      return res.status(200).json({
        certificates: Array.isArray(certificates) ? certificates : [],
        pending,
      });
    } catch (error) {
      console.error(
        `Get my certificates error (userId=${userId}):`,
        error
      );

      return res.status(500).json({
        message: "Failed to fetch certificates",
      });
    }
  },

  // =====================================================
  // GET SINGLE CERTIFICATE
  // =====================================================

  async getById(req, res) {
    try {
      const certificate = await certificateService.getCertificateById(
        req.params.id
      );

      if (!certificate) {
        return res.status(404).json({
          message: "Certificate not found",
        });
      }

      // Students can only view their own certificate.
      // Admins can view any certificate.

      if (
        req.user.role !== "admin" &&
        Number(certificate.user_id) !== Number(req.user.id)
      ) {
        return res.status(403).json({
          message: "You are not allowed to view this certificate",
        });
      }

      return res.status(200).json(certificate);
    } catch (error) {
      console.error("Get certificate error:", error);

      return res.status(500).json({
        message: "Failed to fetch certificate",
      });
    }
  },

  // =====================================================
  // CHECK ELIGIBILITY (diagnostic — also usable by the frontend to show
  // exactly what's left for one specific course)
  // GET /api/certificates/eligibility/:courseId
  // =====================================================

  async getEligibility(req, res) {
    try {
      const userId = Number(req.user.id);
      const courseId = Number(req.params.courseId);

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({
          message: "Invalid course ID",
        });
      }

      const enrollment = await Enrollment.findByUserAndCourse(
        userId,
        courseId
      );

      if (!enrollment) {
        return res.status(403).json({
          message: "You are not enrolled in this course",
        });
      }

      const existing = await Certificate.findByUserAndCourse(
        userId,
        courseId
      );

      if (existing) {
        return res.status(200).json({
          eligible: true,
          alreadyIssued: true,
          certificate: existing,
        });
      }

      const eligibility = await certificateService.checkCertificateEligibility(
        userId,
        courseId
      );

      return res.status(200).json({
        alreadyIssued: false,
        ...eligibility,
      });
    } catch (error) {
      console.error("Get certificate eligibility error:", error);

      return res.status(500).json({
        message: "Failed to check certificate eligibility",
      });
    }
  },

  // =====================================================
  // GENERATE CERTIFICATE (manual check-and-claim)
  //
  // Certificates are normally issued automatically (see
  // certificateService.issueCertificateIfEligible, called from lesson
  // completion, quiz submission, assignment grading, and a sync check on
  // every /certificates/my load). This endpoint exists so a student can
  // proactively check "am I eligible yet?" and get a certificate
  // immediately if so, with a clear reason list if not.
  // =====================================================

  async generate(req, res) {
    try {
      const userId = Number(req.user.id);
      const courseId = Number(req.params.courseId);

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({
          message: "Invalid course ID",
        });
      }

      if (req.user.role !== "student") {
        return res.status(403).json({
          message: "Only students can receive course certificates",
        });
      }

      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      const enrollment = await Enrollment.findByUserAndCourse(
        userId,
        courseId
      );

      if (!enrollment) {
        return res.status(403).json({
          message: "You are not enrolled in this course",
        });
      }

      const existing = await Certificate.findByUserAndCourse(
        userId,
        courseId
      );

      if (existing) {
        return res.status(200).json({
          message: "Certificate already exists",
          certificate: existing,
        });
      }

      const eligibility = await certificateService.checkCertificateEligibility(
        userId,
        courseId
      );

      if (!eligibility.eligible) {
        return res.status(400).json({
          message: "You have not met all certificate requirements yet",
          pendingRequirements: eligibility.pendingRequirements,
          ...eligibility,
        });
      }

      const certificate = await certificateService.issueCertificateIfEligible(
        userId,
        courseId
      );

      if (!certificate) {
        console.error(
          `Manual generate: eligibility passed but issueCertificateIfEligible returned null (userId=${userId}, courseId=${courseId}) — likely a database error, check the issueCertificateIfEligible log line above.`
        );

        return res.status(500).json({
          message: "Failed to generate certificate",
        });
      }

      return res.status(201).json({
        message: "Certificate generated successfully",
        certificate,
      });
    } catch (error) {
      console.error("Generate certificate error:", error);

      return res.status(500).json({
        message: "Failed to generate certificate",
      });
    }
  },
};

module.exports = certificateController;