const pool = require("../config/database");

const Lesson = {
  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        l.id,
        l.section_id,
        l.title,
        l.description,
        l.video_url,
        l.duration_minutes,
        l.lesson_order,
        l.is_published,
        l.created_at,
        l.updated_at,
        s.title AS section_title,
        s.course_id
      FROM lessons l
      JOIN course_sections s ON l.section_id = s.id
      WHERE l.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  async findBySection(sectionId) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        section_id,
        title,
        description,
        video_url,
        duration_minutes,
        lesson_order,
        is_published,
        created_at,
        updated_at
      FROM lessons
      WHERE section_id = ?
      ORDER BY lesson_order ASC
      `,
      [sectionId]
    );

    return rows;
  },

  async create({
    sectionId,
    title,
    description,
    videoUrl,
    durationMinutes,
    lessonOrder,
    isPublished = false,
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO lessons
      (
        section_id,
        title,
        description,
        video_url,
        duration_minutes,
        lesson_order,
        is_published
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        sectionId,
        title,
        description || null,
        videoUrl || null,
        durationMinutes || 0,
        lessonOrder || 1,
        isPublished,
      ]
    );

    return result.insertId;
  },

  async update(
    id,
    {
      title,
      description,
      videoUrl,
      durationMinutes,
      lessonOrder,
      isPublished,
    }
  ) {
    const [result] = await pool.execute(
      `
      UPDATE lessons
      SET
        title = ?,
        description = ?,
        video_url = ?,
        duration_minutes = ?,
        lesson_order = ?,
        is_published = ?
      WHERE id = ?
      `,
      [
        title,
        description || null,
        videoUrl || null,
        durationMinutes || 0,
        lessonOrder || 1,
        isPublished,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM lessons WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = Lesson;