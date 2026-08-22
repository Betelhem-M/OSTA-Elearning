const express = require("express");

const discussionController = require("../controllers/discussionController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", discussionController.getAll);

router.post(
  "/",
  authMiddleware,
  discussionController.create
);

router.post(
  "/:topicId/replies",
  authMiddleware,
  discussionController.addReply
);

router.put(
  "/:topicId/replies/:replyId",
  authMiddleware,
  discussionController.updateReply
);

router.delete(
  "/:topicId/replies/:replyId",
  authMiddleware,
  discussionController.deleteReply
);

router.get("/:id", discussionController.getById);

router.put(
  "/:id",
  authMiddleware,
  discussionController.update
);

router.delete(
  "/:id",
  authMiddleware,
  discussionController.delete
);

module.exports = router;