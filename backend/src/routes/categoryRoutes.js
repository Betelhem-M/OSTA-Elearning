const express = require("express");

const certificateController =
  require("../controllers/certificateController");

const authMiddleware =
  require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// MY CERTIFICATES
// =====================================================

router.get(
  "/my",
  authMiddleware,
  certificateController.getMyCertificates
);

// =====================================================
// GENERATE CERTIFICATE
// =====================================================

router.post(
  "/generate/:courseId",
  authMiddleware,
  certificateController.generate
);

// =====================================================
// CHECK CERTIFICATE ELIGIBILITY (diagnostic)
// =====================================================

router.get(
  "/eligibility/:courseId",
  authMiddleware,
  certificateController.getEligibility
);

// =====================================================
// GET SINGLE CERTIFICATE
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  certificateController.getById
);

module.exports = router;