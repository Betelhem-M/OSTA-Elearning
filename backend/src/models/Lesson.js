const pool = require("../config/database");

const Lesson = {
  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        lessons.id,
        lessons.course_id,
        lessons.section_id,
        lessons.title,
        lessons.description,
        lessons.video_url,
        lessons.duration_minutes,
        lessons.lesson_order,
        lessons.is_published,
        lessons.created_at,
        lessons.updated_at,
        course_sections.course_id AS section_course_id,
        course_sections.title AS section_title
      FROM lessons
      LEFT JOIN course_sections ON course_sections.id = lessons.section_id
      WHERE lessons.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows[0]) return null;

    return {
      ...rows[0],
      course_id: rows[0].course_id ?? rows[0].section_course_id,
    };
  },

  async findBySection(sectionId) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        course_id,
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

  async create({
    courseId,
    sectionId,
    title,
    description,
    videoUrl,
    durationMinutes,
    lessonOrder,
    isPublished,
  }) {
    let resolvedCourseId = courseId;

    if (!resolvedCourseId && sectionId) {
      const [sectionRows] = await pool.execute(
        `SELECT course_id FROM course_sections WHERE id = ? LIMIT 1`,
        [sectionId]
      );

      resolvedCourseId = sectionRows[0]?.course_id;
    }

    if (!resolvedCourseId) {
      const error = new Error("A valid course could not be determined for this lesson");
      error.code = "LESSON_COURSE_REQUIRED";
      throw error;
    }

    const [result] = await pool.execute(
      `
      INSERT INTO lessons
        (course_id, section_id, title, description, video_url, duration_minutes, lesson_order, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        resolvedCourseId,
        sectionId ?? null,
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

  async update(
    id,
    {
      courseId,
      sectionId,
      title,
      description,
      videoUrl,
      durationMinutes,
      lessonOrder,
      isPublished,
    }
  ) {
    const existing = await Lesson.findById(id);

    if (!existing) return false;

    let resolvedCourseId = courseId ?? existing.course_id;
    let resolvedSectionId = sectionId ?? existing.section_id;

    if (resolvedSectionId) {
      const [sectionRows] = await pool.execute(
        `SELECT course_id FROM course_sections WHERE id = ? LIMIT 1`,
        [resolvedSectionId]
      );

      const section = sectionRows[0];

      if (!section) {
        const error = new Error("The selected section does not exist");
        error.code = "LESSON_SECTION_NOT_FOUND";
        throw error;
      }

      if (
        resolvedCourseId !== undefined &&
        Number(section.course_id) !== Number(resolvedCourseId)
      ) {
        const error = new Error("The selected section does not belong to this course");
        error.code = "LESSON_SECTION_COURSE_MISMATCH";
        throw error;
      }

      resolvedCourseId = section.course_id;
    }

    const [result] = await pool.execute(
      `
      UPDATE lessons
      SET
        course_id = ?,
        section_id = ?,
        title = ?,
        description = ?,
        video_url = ?,
        duration_minutes = ?,
        lesson_order = ?,
        is_published = ?
      WHERE id = ?
      `,
      [
        resolvedCourseId,
        resolvedSectionId,
        title !== undefined ? title : existing.title,
        description !== undefined ? description : existing.description,
        videoUrl !== undefined ? videoUrl : existing.video_url,
        durationMinutes !== undefined ? durationMinutes : existing.duration_minutes,
        lessonOrder !== undefined ? lessonOrder : existing.lesson_order,
        isPublished !== undefined ? isPublished : existing.is_published,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

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
