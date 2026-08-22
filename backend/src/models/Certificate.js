const pool = require("../config/database");

const Certificate = {
  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        cert.id,
        cert.user_id,
        cert.course_id,
        cert.certificate_number,
        cert.recipient_name,
        cert.completion_date,
        cert.score,
        cert.skills,
        cert.issued_at,
        c.title AS course_name,
        CONCAT(u.first_name, ' ', u.last_name) AS instructor_name
      FROM certificates cert
      JOIN users student
        ON cert.user_id = student.id
      JOIN courses c
        ON cert.course_id = c.id
      JOIN users u
        ON c.instructor_id = u.id
      WHERE cert.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  async findByUser(userId) {
    const [rows] = await pool.execute(
      `
      SELECT
        cert.id,
        cert.user_id,
        cert.course_id,
        cert.certificate_number,
        cert.recipient_name,
        cert.completion_date,
        cert.score,
        cert.skills,
        cert.issued_at,
        c.title AS course_name,
        CONCAT(u.first_name, ' ', u.last_name) AS instructor_name
      FROM certificates cert
      JOIN courses c
        ON cert.course_id = c.id
      JOIN users u
        ON c.instructor_id = u.id
      WHERE cert.user_id = ?
      ORDER BY cert.issued_at DESC
      `,
      [userId]
    );

    return rows;
  },

  async findByUserAndCourse(userId, courseId) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        user_id,
        course_id,
        certificate_number,
        recipient_name,
        completion_date,
        score,
        skills,
        issued_at
      FROM certificates
      WHERE user_id = ? AND course_id = ?
      LIMIT 1
      `,
      [userId, courseId]
    );

    return rows[0] || null;
  },

  async create({
    userId,
    courseId,
    certificateNumber,
    recipientName,
    completionDate,
    score,
    skills,
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO certificates
      (
        user_id,
        course_id,
        certificate_number,
        recipient_name,
        completion_date,
        score,
        skills
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        courseId,
        certificateNumber,
        recipientName,
        completionDate,
        score ?? null,
        skills || null,
      ]
    );

    return result.insertId;
  },
};

module.exports = Certificate;