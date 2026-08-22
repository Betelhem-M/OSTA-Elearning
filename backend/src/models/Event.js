const pool = require("../config/database");

const Event = {
  async findAll() {
    const [rows] = await pool.execute(`
      SELECT
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.event_time,
        e.location,
        e.category,
        e.created_by,
        e.created_at,
        CONCAT(u.first_name, ' ', u.last_name) AS creator_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.event_date ASC, e.event_time ASC
    `);

    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        e.id,
        e.title,
        e.description,
        e.event_date,
        e.event_time,
        e.location,
        e.category,
        e.created_by,
        e.created_at,
        CONCAT(u.first_name, ' ', u.last_name) AS creator_name
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  async create({
    title,
    description,
    eventDate,
    eventTime,
    location,
    category,
    createdBy,
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO events
      (
        title,
        description,
        event_date,
        event_time,
        location,
        category,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description || null,
        eventDate,
        eventTime || null,
        location || null,
        category || null,
        createdBy || null,
      ]
    );

    return result.insertId;
  },

  async update(
    id,
    {
      title,
      description,
      eventDate,
      eventTime,
      location,
      category,
    }
  ) {
    const [result] = await pool.execute(
      `
      UPDATE events
      SET
        title = ?,
        description = ?,
        event_date = ?,
        event_time = ?,
        location = ?,
        category = ?
      WHERE id = ?
      `,
      [
        title,
        description || null,
        eventDate,
        eventTime || null,
        location || null,
        category || null,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.execute(
      "DELETE FROM events WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  },
};

module.exports = Event;