const pool = require('../config/database');

const Assignment = {
  async create(title, description, course_id, instructor_id, due_date, is_paid, price) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO assignments (title, description, course_id, instructor_id, due_date, is_paid, price, status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
        [title, description, course_id, instructor_id, due_date, is_paid, price]
      );
      return { success: true, id: result.insertId, message: 'Assignment created successfully' };
    } finally {
      connection.release();
    }
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) as instructor_name FROM assignments a 
       LEFT JOIN users u ON a.instructor_id = u.id WHERE a.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  async findByCourse(course_id) {
    const [rows] = await pool.execute(
      `SELECT a.*, CONCAT(u.first_name, ' ', u.last_name) as instructor_name FROM assignments a 
       LEFT JOIN users u ON a.instructor_id = u.id WHERE a.course_id = ? AND a.status = 'active' ORDER BY a.due_date ASC`,
      [course_id]
    );
    return rows;
  },

  async findByInstructor(instructor_id) {
    const [rows] = await pool.execute(
      `SELECT * FROM assignments WHERE instructor_id = ? ORDER BY due_date DESC`,
      [instructor_id]
    );
    return rows;
  },

  async update(id, updates) {
    const allowedFields = ['title', 'description', 'due_date', 'is_paid', 'price', 'status'];
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return { success: false, message: 'No valid fields to update' };

    values.push(id);
    const [result] = await pool.execute(
      `UPDATE assignments SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0 ? { success: true } : { success: false, message: 'Assignment not found' };
  },

  async delete(id) {
    const [result] = await pool.execute(`DELETE FROM assignments WHERE id = ?`, [id]);
    return result.affectedRows > 0 ? { success: true } : { success: false, message: 'Assignment not found' };
  }
};

module.exports = Assignment;
