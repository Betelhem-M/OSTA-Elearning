const pool =
  require("../config/database");

const Notification = {
  async findByUser(userId) {
    const [rows] =
      await pool.execute(
        `
        SELECT
          id,
          user_id,
          title,
          message,
          category,
          is_read,
          created_at
        FROM notifications
        WHERE user_id = ?
        ORDER BY
          created_at DESC,
          id DESC
        `,
        [userId]
      );

    return rows;
  },

  async create({
    userId,
    title,
    message,
    category = "General",
  }) {
    const [result] =
      await pool.execute(
        `
        INSERT INTO notifications
        (
          user_id,
          title,
          message,
          category
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          userId,
          title,
          message,
          category,
        ]
      );

    return result.insertId;
  },

  async markRead(
    id,
    userId
  ) {
    const [result] =
      await pool.execute(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = ?
          AND user_id = ?
        `,
        [id, userId]
      );

    return (
      result.affectedRows > 0
    );
  },

  async markAllRead(userId) {
    const [result] =
      await pool.execute(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = ?
          AND is_read = FALSE
        `,
        [userId]
      );

    return result.affectedRows;
  },

  async delete(
    id,
    userId
  ) {
    const [result] =
      await pool.execute(
        `
        DELETE FROM notifications
        WHERE id = ?
          AND user_id = ?
        `,
        [id, userId]
      );

    return (
      result.affectedRows > 0
    );
  },
};

module.exports = Notification;