const pool = require("../config/database");

const CourseSection = {
  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        cs.id,
        cs.course_id,
        cs.title,
        cs.section_order,
        cs.created_at,
        c.title AS course_title
      FROM course_sections cs
      JOIN courses c ON cs.course_id = c.id
      WHERE cs.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  async findByCourse(courseId) {
    const [sections] = await pool.execute(
      `
      SELECT
        id,
        course_id,
        title,
        section_order,
        created_at
      FROM course_sections
      WHERE course_id = ?
      ORDER BY section_order ASC
      `,
      [courseId]
    );

    for (const section of sections) {
      const [lessons] = await pool.execute(
        `
        SELECT
          id,
          section_id,
          title,
          duration_minutes,
          lesson_order,
          is_published
        FROM lessons
        WHERE section_id = ?
        ORDER BY lesson_order ASC
        `,
        [section.id]
      );

      section.lessons = lessons;
    }

    return sections;
  },

  async create({ courseId, title, sectionOrder }) {
    const [result] = await pool.execute(
      `
      INSERT INTO course_sections
      (course_id, title, section_order)
      VALUES (?, ?, ?)
      `,
      [
        courseId,
        title,
        sectionOrder || 1,
      ]
    );

    return result.insertId;
  },

  async update(id, { title, sectionOrder }) {
    const [result] = await pool.execute(
      `
      UPDATE course_sections
      SET title = ?, section_order = ?
      WHERE id = ?
      `,
      [
        title,
        sectionOrder || 1,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute(
      `
      DELETE FROM course_sections
      WHERE id = ?
      `,
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = CourseSection;