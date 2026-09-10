const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/instructorApplicationUploadMiddleware");
const controller = require("../controllers/instructorApplicationController");

const router = express.Router();

// Publicly registered users submit their own instructor application.
router.post(
  "/",
  authMiddleware,
  upload.single("cv"),
  controller.submit
);

router.get(
  "/mine",
  authMiddleware,
  controller.mine
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  controller.list
);

router.get(
  "/:id/cv",
  authMiddleware,
  roleMiddleware("admin"),
  controller.cv
);

router.put(
  "/:id/review",
  authMiddleware,
  roleMiddleware("admin"),
  controller.review
);

module.exports = router;
