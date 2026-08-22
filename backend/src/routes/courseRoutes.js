const express = require("express");

const courseController = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", courseController.getAll);

router.get("/:id", courseController.getById);

router.post(
  "/",
  authMiddleware,
  courseController.create
);

router.put(
  "/:id",
  authMiddleware,
  courseController.update
);

router.delete(
  "/:id",
  authMiddleware,
  courseController.delete
);

module.exports = router;