const db = require("../config/database");

const LessonNote = {
  async findByLessonAndUser(lessonId, userId) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        user_id,
        lesson_id,
        timestamp_seconds,
        note_text,
        created_at,
        updated_at
      FROM lesson_notes
      WHERE lesson_id = ?
        AND user_id = ?
      ORDER BY timestamp_seconds ASC, id ASC
      `,
      [lessonId, userId]
    );

    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(
      `
      SELECT
        id,
        user_id,
        lesson_id,
        timestamp_seconds,
        note_text,
        created_at,
        updated_at
      FROM lesson_notes
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  async create({
    userId,
    lessonId,
    timestampSeconds,
    noteText,
  }) {
    const [result] = await db.query(
      `
      INSERT INTO lesson_notes (
        user_id,
        lesson_id,
        timestamp_seconds,
        note_text
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        userId,
        lessonId,
        timestampSeconds,
        noteText,
      ]
    );

    return result.insertId;
  },

  async update(id, noteText) {
    await db.query(
      `
      UPDATE lesson_notes
      SET note_text = ?
      WHERE id = ?
      `,
      [noteText, id]
    );
  },

  async delete(id) {
    await db.query(
      `
      DELETE FROM lesson_notes
      WHERE id = ?
      `,
      [id]
    );
  },
};

module.exports = LessonNote;