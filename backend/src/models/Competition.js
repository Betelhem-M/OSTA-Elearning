const pool = require("../config/database");

const Competition = {
  async findAll() {
    const [rows] = await pool.execute(`
      SELECT
        c.id,
        c.title,
        c.description,
        c.category,
        c.deadline,
        c.prize,
        c.status,
        c.created_by,
        c.created_at,
        COUNT(cp.id) AS participant_count
      FROM competitions c
      LEFT JOIN competition_participants cp
        ON c.id = cp.competition_id
      GROUP BY
        c.id,
        c.title,
        c.description,
        c.category,
        c.deadline,
        c.prize,
        c.status,
        c.created_by,
        c.created_at
      ORDER BY c.deadline ASC
    `);

    return rows;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        title,
        description,
        category,
        deadline,
        prize,
        status,
        created_by,
        created_at
      FROM competitions
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  async create({
    title,
    description,
    category,
    deadline,
    prize,
    createdBy,
    status = "draft",
  }) {
    const [result] = await pool.execute(
      `
      INSERT INTO competitions
      (
        title,
        description,
        category,
        deadline,
        prize,
        status,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        description || null,
        category || null,
        deadline,
        prize || null,
        status,
        createdBy || null,
      ]
    );

    return result.insertId;
  },

  async join(competitionId, userId, teamName) {
    const [result] = await pool.execute(
      `
      INSERT INTO competition_participants
      (
        competition_id,
        user_id,
        team_name
      )
      VALUES (?, ?, ?)
      `,
      [competitionId, userId, teamName || null]
    );

    return result.insertId;
  },

  async getLeaderboard(competitionId) {
    const [rows] = await pool.execute(
      `
      SELECT
        cp.id,
        cp.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        cp.team_name AS team,
        cp.score,
        cp.rank_position AS rank
      FROM competition_participants cp
      JOIN users u
        ON cp.user_id = u.id
      WHERE cp.competition_id = ?
      ORDER BY cp.score DESC, cp.joined_at ASC
      `,
      [competitionId]
    );

    return rows;
  },
};

module.exports = Competition;