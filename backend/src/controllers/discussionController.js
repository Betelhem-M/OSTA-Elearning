const Discussion = require("../models/Discussion");
const Reply = require("../models/Reply");

const discussionController = {
  async getAll(req, res) {
    try {
      const topics = await Discussion.findAll();

      return res.status(200).json(topics);
    } catch (error) {
      console.error("Get discussion topics error:", error);

      return res.status(500).json({
        message: "Failed to fetch discussion topics",
      });
    }
  },

  async getById(req, res) {
    try {
      const topic = await Discussion.findById(req.params.id);

      if (!topic) {
        return res.status(404).json({
          message: "Discussion topic not found",
        });
      }

      const replies = await Reply.findByTopic(topic.id);

      return res.status(200).json({
        ...topic,
        replies,
      });
    } catch (error) {
      console.error("Get discussion topic error:", error);

      return res.status(500).json({
        message: "Failed to fetch discussion topic",
      });
    }
  },

  async create(req, res) {
    try {
      const {
        title,
        category,
        body,
      } = req.body;

      if (!title || !category || !body) {
        return res.status(400).json({
          message: "Title, category, and body are required",
        });
      }

      const topicId = await Discussion.create({
        userId: req.user.id,
        title,
        category,
        body,
      });

      const topic = await Discussion.findById(topicId);

      return res.status(201).json({
        message: "Discussion topic created successfully",
        topic,
      });
    } catch (error) {
      console.error("Create discussion topic error:", error);

      return res.status(500).json({
        message: "Failed to create discussion topic",
      });
    }
  },

  async update(req, res) {
    try {
      const topic = await Discussion.findById(req.params.id);

      if (!topic) {
        return res.status(404).json({
          message: "Discussion topic not found",
        });
      }

      if (
        req.user.role !== "admin" &&
        topic.user_id !== req.user.id
      ) {
        return res.status(403).json({
          message: "You are not allowed to update this topic",
        });
      }

      const {
        title,
        category,
        body,
      } = req.body;

      await Discussion.update(
        req.params.id,
        {
          title,
          category,
          body,
        }
      );

      const updatedTopic = await Discussion.findById(
        req.params.id
      );

      return res.status(200).json({
        message: "Discussion topic updated successfully",
        topic: updatedTopic,
      });
    } catch (error) {
      console.error("Update discussion topic error:", error);

      return res.status(500).json({
        message: "Failed to update discussion topic",
      });
    }
  },

  async delete(req, res) {
    try {
      const topic = await Discussion.findById(req.params.id);

      if (!topic) {
        return res.status(404).json({
          message: "Discussion topic not found",
        });
      }

      if (
        req.user.role !== "admin" &&
        topic.user_id !== req.user.id
      ) {
        return res.status(403).json({
          message: "You are not allowed to delete this topic",
        });
      }

      await Discussion.delete(req.params.id);

      return res.status(200).json({
        message: "Discussion topic deleted successfully",
      });
    } catch (error) {
      console.error("Delete discussion topic error:", error);

      return res.status(500).json({
        message: "Failed to delete discussion topic",
      });
    }
  },

  async addReply(req, res) {
    try {
      const topic = await Discussion.findById(req.params.topicId);

      if (!topic) {
        return res.status(404).json({
          message: "Discussion topic not found",
        });
      }

      const { body } = req.body;

      if (!body) {
        return res.status(400).json({
          message: "Reply body is required",
        });
      }

      const replyId = await Reply.create({
        topicId: req.params.topicId,
        userId: req.user.id,
        body,
      });

      const reply = await Reply.findById(replyId);

      return res.status(201).json({
        message: "Reply added successfully",
        reply,
      });
    } catch (error) {
      console.error("Add discussion reply error:", error);

      return res.status(500).json({
        message: "Failed to add reply",
      });
    }
  },

  async updateReply(req, res) {
    try {
      const reply = await Reply.findById(req.params.replyId);

      if (!reply) {
        return res.status(404).json({
          message: "Reply not found",
        });
      }

      if (
        req.user.role !== "admin" &&
        reply.user_id !== req.user.id
      ) {
        return res.status(403).json({
          message: "You are not allowed to update this reply",
        });
      }

      if (!req.body.body) {
        return res.status(400).json({
          message: "Reply body is required",
        });
      }

      await Reply.update(
        req.params.replyId,
        req.body.body
      );

      const updatedReply = await Reply.findById(
        req.params.replyId
      );

      return res.status(200).json({
        message: "Reply updated successfully",
        reply: updatedReply,
      });
    } catch (error) {
      console.error("Update reply error:", error);

      return res.status(500).json({
        message: "Failed to update reply",
      });
    }
  },

  async deleteReply(req, res) {
    try {
      const reply = await Reply.findById(req.params.replyId);

      if (!reply) {
        return res.status(404).json({
          message: "Reply not found",
        });
      }

      if (
        req.user.role !== "admin" &&
        reply.user_id !== req.user.id
      ) {
        return res.status(403).json({
          message: "You are not allowed to delete this reply",
        });
      }

      await Reply.delete(req.params.replyId);

      return res.status(200).json({
        message: "Reply deleted successfully",
      });
    } catch (error) {
      console.error("Delete reply error:", error);

      return res.status(500).json({
        message: "Failed to delete reply",
      });
    }
  },
};

module.exports = discussionController;