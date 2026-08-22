const express = require("express");

const courseSectionController = require("../controllers/courseSectionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/course/:courseId",
  courseSectionController.getByCourse
);

router.get(
  "/:id",
  courseSectionController.getById
);

router.post(
  "/",
  authMiddleware,
  courseSectionController.create
);

router.put(
  "/:id",
  authMiddleware,
  courseSectionController.update
);

router.delete(
  "/:id",
  authMiddleware,
  courseSectionController.delete
);

module.exports = router;