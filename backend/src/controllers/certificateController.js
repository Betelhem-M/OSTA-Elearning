const Certificate = require("../models/Certificate");
const User = require("../models/User");
const Course = require("../models/Course");

const certificateController = {
  async getMyCertificates(req, res) {
    try {
      const certificates = await Certificate.findByUser(req.user.id);

      return res.status(200).json(certificates);
    } catch (error) {
      console.error("Get certificates error:", error);

      return res.status(500).json({
        message: "Failed to fetch certificates",
      });
    }
  },

  async getById(req, res) {
    try {
      const certificate = await Certificate.findById(req.params.id);

      if (!certificate) {
        return res.status(404).json({
          message: "Certificate not found",
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

  async issue(req, res) {
    try {
      const { userId, courseId, score, skills } = req.body;

      if (!userId || !courseId) {
        return res.status(400).json({
          message: "User ID and course ID are required",
        });
      }

      const user = await User.findById(userId);
      const course = await Course.findById(courseId);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      const existing = await Certificate.findByUserAndCourse(
        userId,
        courseId
      );

      if (existing) {
        return res.status(409).json({
          message: "Certificate already exists for this course",
          certificate: existing,
        });
      }

      const certificateNumber =
        `OSTA-${courseId}-${userId}-${Date.now()}`;

      const recipientName =
        `${user.first_name} ${user.last_name}`;

      const completionDate =
        new Date().toISOString().split("T")[0];

      const certificateId = await Certificate.create({
        userId,
        courseId,
        certificateNumber,
        recipientName,
        completionDate,
        score,
        skills,
      });

      const certificate =
        await Certificate.findById(certificateId);

      return res.status(201).json({
        message: "Certificate issued successfully",
        certificate,
      });
    } catch (error) {
      console.error("Issue certificate error:", error);

      return res.status(500).json({
        message: "Failed to issue certificate",
      });
    }
  },
};

module.exports = certificateController;