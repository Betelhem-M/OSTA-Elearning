const pool = require("../config/database");

const Payment = {
  async create({ userId, courseId, amount, method, paymentAccountId, transactionReference }) {
    const [result] = await pool.execute(
      `INSERT INTO payments
        (user_id, course_id, amount, currency, method, payment_account_id, transaction_reference, status)
       VALUES (?, ?, ?, 'ETB', ?, ?, ?, 'pending')`,
      [userId, courseId, amount, method, paymentAccountId, transactionReference]
    );

    return result.insertId;
  },

  async findByUserAndCourse(userId, courseId) {
    const [rows] = await pool.execute(
      `SELECT id, user_id, course_id, amount, currency, method,
              transaction_reference, status, created_at, reviewed_at
       FROM payments
       WHERE user_id = ? AND course_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, courseId]
    );

    return rows[0] || null;
  },

  async findApprovedByUserAndCourse(userId, courseId, amount) {
    const [rows] = await pool.execute(
      `SELECT id, user_id, course_id, amount, currency, method,
              transaction_reference, status, reviewed_at
       FROM payments
       WHERE user_id = ?
         AND course_id = ?
         AND status = 'approved'
         AND amount = ?
       ORDER BY reviewed_at DESC, id DESC
       LIMIT 1`,
      [userId, courseId, amount]
    );

    return rows[0] || null;
  },
};

module.exports = Payment;
