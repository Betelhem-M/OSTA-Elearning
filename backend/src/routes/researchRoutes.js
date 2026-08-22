const express = require("express");

const researchController = require("../controllers/researchController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/researchers",
  researchController.getResearchers
);

router.get(
  "/researchers/:id",
  researchController.getResearcher
);

router.post(
  "/researchers",
  authMiddleware,
  researchController.createResearcher
);

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

module.exports = router;