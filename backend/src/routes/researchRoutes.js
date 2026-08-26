const express =
  require("express");

const researchController =
  require("../controllers/researchController");

const authMiddleware =
  require("../middleware/authMiddleware");

const router =
  express.Router();

// =====================================================
// PUBLIC
// =====================================================

router.get(
  "/researchers",
  researchController.getResearchers
);

router.get(
  "/researchers/:id",
  researchController.getResearcher
);

router.get(
  "/publications",
  researchController.getPublications
);

// =====================================================
// AUTHENTICATED RESEARCH ACCESS
// =====================================================

router.get(
  "/publications/:id",
  authMiddleware,
  researchController.getPublication
);

// =====================================================
// RESEARCHER PROFILE
// =====================================================

router.post(
  "/researchers",
  authMiddleware,
  researchController.createResearcher
);

// =====================================================
// PUBLICATION MANAGEMENT
// =====================================================

router.post(
  "/publications",
  authMiddleware,
  researchController.createPublication
);

router.put(
  "/publications/:id",
  authMiddleware,
  researchController.updatePublication
);

router.delete(
  "/publications/:id",
  authMiddleware,
  researchController.deletePublication
);

// =====================================================
// ADMIN MODERATION
// =====================================================

router.get(
  "/admin/publications",
  authMiddleware,
  researchController.getAllForAdmin
);

router.put(
  "/admin/publications/:id/status",
  authMiddleware,
  researchController.updatePublicationStatus
);

module.exports =
  router;