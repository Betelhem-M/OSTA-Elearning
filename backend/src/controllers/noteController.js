const LessonNote = require("../models/LessonNote");

const noteController = {
  async getByLesson(req, res) {
    try {
      const lessonId = Number(req.params.lessonId);
      const userId = req.user.id;

      if (!Number.isInteger(lessonId) || lessonId <= 0) {
        return res.status(400).json({
          message: "Invalid lesson ID",
        });
      }

      const notes = await LessonNote.findByLessonAndUser(
        lessonId,
        userId
      );

      return res.status(200).json(notes);
    } catch (error) {
      console.error("Get lesson notes error:", error);

      return res.status(500).json({
        message: "Failed to fetch lesson notes",
      });
    }
  },

  async create(req, res) {
    try {
      const lessonId = Number(req.params.lessonId);
      const userId = req.user.id;
      const { timestampSeconds = 0, noteText } = req.body;

      if (!Number.isInteger(lessonId) || lessonId <= 0) {
        return res.status(400).json({
          message: "Invalid lesson ID",
        });
      }

      if (
        typeof noteText !== "string" ||
        !noteText.trim()
      ) {
        return res.status(400).json({
          message: "Note text is required",
        });
      }

      const seconds = Math.max(
        0,
        Math.floor(Number(timestampSeconds) || 0)
      );

      const noteId = await LessonNote.create({
        userId,
        lessonId,
        timestampSeconds: seconds,
        noteText: noteText.trim(),
      });

      const note = await LessonNote.findById(noteId);

      return res.status(201).json({
        message: "Note created successfully",
        note,
      });
    } catch (error) {
      console.error("Create lesson note error:", error);

      return res.status(500).json({
        message: "Failed to create note",
      });
    }
  },

  async update(req, res) {
    try {
      const noteId = Number(req.params.id);
      const userId = req.user.id;
      const { noteText } = req.body;

      if (!Number.isInteger(noteId) || noteId <= 0) {
        return res.status(400).json({
          message: "Invalid note ID",
        });
      }

      if (
        typeof noteText !== "string" ||
        !noteText.trim()
      ) {
        return res.status(400).json({
          message: "Note text is required",
        });
      }

      const note = await LessonNote.findById(noteId);

      if (!note) {
        return res.status(404).json({
          message: "Note not found",
        });
      }

      if (Number(note.user_id) !== Number(userId)) {
        return res.status(403).json({
          message: "You are not allowed to update this note",
        });
      }

      await LessonNote.update(noteId, noteText.trim());

      const updatedNote =
        await LessonNote.findById(noteId);

      return res.status(200).json({
        message: "Note updated successfully",
        note: updatedNote,
      });
    } catch (error) {
      console.error("Update lesson note error:", error);

      return res.status(500).json({
        message: "Failed to update note",
      });
    }
  },

  async delete(req, res) {
    try {
      const noteId = Number(req.params.id);
      const userId = req.user.id;

      if (!Number.isInteger(noteId) || noteId <= 0) {
        return res.status(400).json({
          message: "Invalid note ID",
        });
      }

      const note = await LessonNote.findById(noteId);

      if (!note) {
        return res.status(404).json({
          message: "Note not found",
        });
      }

      if (Number(note.user_id) !== Number(userId)) {
        return res.status(403).json({
          message: "You are not allowed to delete this note",
        });
      }

      await LessonNote.delete(noteId);

      return res.status(200).json({
        message: "Note deleted successfully",
      });
    } catch (error) {
      console.error("Delete lesson note error:", error);

      return res.status(500).json({
        message: "Failed to delete note",
      });
    }
  },
};

module.exports = noteController;