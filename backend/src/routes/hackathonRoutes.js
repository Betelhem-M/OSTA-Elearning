const express = require("express");

const hackathonController = require("../controllers/hackathonController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", hackathonController.getAll);

router.get("/:id", hackathonController.getById);

router.post(
  "/",
  authMiddleware,
  hackathonController.create
);

router.put(
  "/:id",
  authMiddleware,
  hackathonController.update
);

router.delete(
  "/:id",
  authMiddleware,
  hackathonController.delete
);

module.exports = router;