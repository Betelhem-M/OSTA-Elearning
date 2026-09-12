const pool = require("../config/database");

const Lesson = {
  // ============================================================
  // FIND BY ID
  // ============================================================

  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        lessons.id,
        lessons.section_id,
        lessons.title,
        lessons.description,
        lessons.video_url,
        lessons.duration_minutes,
        lessons.position AS lesson_order,
        0 AS is_published,
        lessons.created_at,
        lessons.updated_at,
        course_sections.course_id AS course_id
      FROM lessons
      JOIN course_sections ON course_sections.id = lessons.section_id
      WHERE lessons.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  // ============================================================
  // FIND BY SECTION
  // ============================================================

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
        position AS lesson_order,
        0 AS is_published,
        created_at,
        updated_at
      FROM lessons
      WHERE section_id = ?
      ORDER BY position ASC, id ASC
      `,
      [sectionId]
    );

    return rows;
  },

  // ============================================================
  // CREATE
  // ============================================================

  async create({
    sectionId,
    title,
    description,
    videoUrl,
    durationMinutes,
    lessonOrder,
    isPublished,
  }) {
    // Railway's current lessons table uses course_id and position.
    // course_id is derived from the selected section, while lessonOrder
    // maps to the existing position column. Publishing is not stored in
    // the current deployed schema, so the API exposes it as false.
    const [result] = await pool.execute(
      `
      INSERT INTO lessons
        (course_id, section_id, title, description, video_url,
         duration_minutes, position)
      SELECT
        course_id, ?, ?, ?, ?, ?, ?
      FROM course_sections
      WHERE id = ?
      LIMIT 1
      `,
      [
        sectionId,
        title,
        description ?? null,
        videoUrl ?? null,
        durationMinutes ?? 0,
        lessonOrder ?? 0,
        sectionId,
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error("The selected course section does not exist");
    }

    return result.insertId;
  },

  // ============================================================
  // UPDATE
  // ============================================================

  async update(
    id,
    {
      title,
      description,
      videoUrl,
      durationMinutes,
      lessonOrder,
    }
  ) {
    const existing = await Lesson.findById(id);

    if (!existing) {
      return false;
    }

    const [result] = await pool.execute(
      `
      UPDATE lessons
      SET
        title = ?,
        description = ?,
        video_url = ?,
        duration_minutes = ?,
        position = ?
      WHERE id = ?
      `,
      [
        title ?? existing.title,
        description !== undefined ? description : existing.description,
        videoUrl !== undefined ? videoUrl : existing.video_url,
        durationMinutes !== undefined
          ? durationMinutes
          : existing.duration_minutes,
        lessonOrder !== undefined ? lessonOrder : existing.lesson_order,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  // ============================================================
  // DELETE
  // ============================================================

  async delete(id) {
    const [result] = await pool.execute(
      `
      DELETE FROM lessons
      WHERE id = ?
      `,
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = Lesson;
