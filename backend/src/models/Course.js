const pool = require("../config/database");

const Course = {
  async findAll() {
    const [rows] = await pool.execute(`
      SELECT
        c.id,
        c.title,
        c.description,
        c.long_description,
        c.instructor_id,
        CONCAT(u.first_name, ' ', u.last_name) AS instructor_name,
        c.category_id,
        cat.name AS category_name,
        c.level,
        c.price,
        c.thumbnail_color,
        c.status,
        c.created_at,
        c.updated_at
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      JOIN categories cat ON c.category_id = cat.id
      ORDER BY c.created_at DESC
    `);

    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        c.id,
        c.title,
        c.description,
        c.long_description,
        c.instructor_id,
        CONCAT(u.first_name, ' ', u.last_name) AS instructor_name,
        c.category_id,
        cat.name AS category_name,
        c.level,
        c.price,
        c.thumbnail_color,
        c.status,
        c.created_at,
        c.updated_at
      FROM courses c
      JOIN users u ON c.instructor_id = u.id
      JOIN categories cat ON c.category_id = cat.id
      WHERE c.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  async create({
    title,
    description,
    longDescription,
    instructorId,
    categoryId,
    level,
    price,
    thumbnailColor,
    status = "draft",
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO courses
      (
        title,
        description,
        long_description,
        instructor_id,
        category_id,
        level,
        price,
        thumbnail_color,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description,
        longDescription || null,
        instructorId,
        categoryId,
        level || "Beginner",
        price || 0,
        thumbnailColor || null,
        status,
      ]
    );

    return result.insertId;
  },

  async update(
    id,
    {
      title,
      description,
      longDescription,
      categoryId,
      level,
      price,
      thumbnailColor,
      status,
    }
  ) {
    const [result] = await pool.execute(
      `
      UPDATE courses
      SET
        title = ?,
        description = ?,
        long_description = ?,
        category_id = ?,
        level = ?,
        price = ?,
        thumbnail_color = ?,
        status = ?
      WHERE id = ?
      `,
      [
        title,
        description,
        longDescription || null,
        categoryId,
        level,
        price,
        thumbnailColor || null,
        status,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM courses WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = Course;