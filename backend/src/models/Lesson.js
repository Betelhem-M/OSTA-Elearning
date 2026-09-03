const pool = require("../config/database");

const Lesson = {
  // ============================================================
  // FIND BY ID
  // ============================================================

  /**
   * Returns a single lesson by ID, or null if not found.
   */
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
        lessons.lesson_order,
        lessons.is_published,
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

  /**
   * Returns all lessons belonging to a section, in lesson_order.
   */
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
      ORDER BY lesson_order ASC, id ASC
      `,
      [sectionId]
    );

    return rows;
  },

  // ============================================================
  // CREATE
  // ============================================================

  /**
   * Creates a new lesson and returns its inserted ID.
   * Optional fields that arrive as undefined are converted to
   * null/defaults, since mysql2 rejects undefined bind params.
   */
  async create({
    sectionId,
    title,
    description,
    videoUrl,
    durationMinutes,
    lessonOrder,
    isPublished,
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO lessons
        (section_id, title, description, video_url, duration_minutes, lesson_order, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        sectionId,
        title,
        description ?? null,
        videoUrl ?? null,
        durationMinutes ?? 0,
        lessonOrder ?? 0,
        isPublished ?? false,
      ]
    );

    return result.insertId;
  },

  // ============================================================
  // UPDATE
  // ============================================================

  /**
   * Updates a lesson's editable fields. Existing values are kept
   * for any field left undefined in the update payload.
   * Returns true if a row was affected.
   */
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
        lesson_order = ?,
        is_published = ?
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
        isPublished !== undefined ? isPublished : existing.is_published,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  // ============================================================
  // DELETE
  // ============================================================

  /**
   * Deletes a lesson by ID.
   * Returns true if a row was affected.
   */
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