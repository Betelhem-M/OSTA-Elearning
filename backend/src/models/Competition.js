const pool = require("../config/database");

const Competition = {
  // ============================================================
  // PUBLIC COMPETITIONS
  // ============================================================

  /**
   * Returns all competitions visible to the public
   * (drafts are excluded), ordered by nearest deadline first.
   */
  async findAllPublic() {
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
      WHERE c.status IN ('published', 'upcoming', 'active', 'completed')
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

  // ============================================================
  // ADMIN — ALL COMPETITIONS
  // ============================================================

  /**
   * Returns every competition regardless of status (drafts included),
   * ordered by most recently created first. Admin use only.
   */
  async findAllAdmin() {
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
      ORDER BY c.created_at DESC
    `);

    return rows;
  },

  // ============================================================
  // FIND BY ID
  // ============================================================

  /**
   * Returns a single competition by ID, including its
   * participant count. Returns null if not found.
   */
  async findById(id) {
    const [rows] = await pool.execute(
      `
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
        (
          SELECT COUNT(*)
          FROM competition_participants cp
          WHERE cp.competition_id = c.id
        ) AS participant_count
      FROM competitions c
      WHERE c.id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },

  // ============================================================
  // CREATE
  // ============================================================

  /**
   * Creates a new competition and returns its inserted ID.
   */
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
        (title, description, category, deadline, prize, status, created_by)
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

  // ============================================================
  // UPDATE
  // ============================================================

  /**
   * Updates a competition's editable fields.
   * Returns true if a row was affected.
   */
  async update(id, { title, description, category, deadline, prize, status }) {
    const [result] = await pool.execute(
      `
      UPDATE competitions
      SET
        title = ?,
        description = ?,
        category = ?,
        deadline = ?,
        prize = ?,
        status = ?
      WHERE id = ?
      `,
      [
        title,
        description || null,
        category || null,
        deadline,
        prize || null,
        status,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  // ============================================================
  // UPDATE STATUS
  // ============================================================

  /**
   * Updates only a competition's status (lifecycle transition).
   * Returns true if a row was affected.
   */
  async updateStatus(id, status) {
    const [result] = await pool.execute(
      `
      UPDATE competitions
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

    return result.affectedRows > 0;
  },

  // ============================================================
  // DELETE
  // ============================================================

  /**
   * Deletes a competition by ID.
   * Returns true if a row was affected.
   */
  async delete(id) {
    const [result] = await pool.execute(
      `
      DELETE FROM competitions
      WHERE id = ?
      `,
      [id]
    );

    return result.affectedRows > 0;
  },

  // ============================================================
  // JOIN
  // ============================================================

  /**
   * Registers a user as a participant in a competition,
   * optionally under a team name. Returns the new participant ID.
   */
  async join(competitionId, userId, teamName) {
    const [result] = await pool.execute(
      `
      INSERT INTO competition_participants
        (competition_id, user_id, team_name)
      VALUES (?, ?, ?)
      `,
      [competitionId, userId, teamName || null]
    );

    return result.insertId;
  },

  /**
   * Returns the participant row for a given user in a competition,
   * or null if that user hasn't joined yet. Used to block duplicate joins.
   */
  async findParticipantByUser(competitionId, userId) {
    const [rows] = await pool.execute(
      `
      SELECT id, competition_id, user_id, team_name, score, rank_position, joined_at
      FROM competition_participants
      WHERE competition_id = ? AND user_id = ?
      LIMIT 1
      `,
      [competitionId, userId]
    );

    return rows[0] || null;
  },

  // ============================================================
  // SCORING
  // ============================================================

  /**
   * Sets a participant's score. Scoped to the given competition
   * so a stray participantId can't update the wrong competition.
   * Returns true if a row was affected.
   */
  async updateParticipantScore(
    participantId,
    competitionId,
    score
  ) {
    const [result] = await pool.execute(
      `
      UPDATE competition_participants
      SET score = ?
      WHERE id = ? AND competition_id = ?
      `,
      [score, participantId, competitionId]
    );

    return result.affectedRows > 0;
  },

  /**
   * Recomputes rank_position for every participant in a competition,
   * ordered by score (highest first, NULLs last), joined_at as a
   * tiebreaker. Call this after any score change.
   */
  async recalculateRankings(competitionId) {
    const [rows] = await pool.execute(
      `
      SELECT id
      FROM competition_participants
      WHERE competition_id = ?
      ORDER BY score DESC, joined_at ASC
      `,
      [competitionId]
    );

    for (let index = 0; index < rows.length; index += 1) {
      await pool.execute(
        `
        UPDATE competition_participants
        SET rank_position = ?
        WHERE id = ?
        `,
        [index + 1, rows[index].id]
      );
    }
  },

  // ============================================================
  // PARTICIPANTS
  // ============================================================

  /**
   * Returns all participants of a competition, most recently
   * joined first, with basic user info and their score/rank.
   */
  async getParticipants(competitionId) {
    const [rows] = await pool.execute(
      `
      SELECT
        cp.id,
        cp.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        u.email,
        cp.team_name AS team,
        cp.score,
        cp.rank_position AS \`rank\`,
        cp.joined_at
      FROM competition_participants cp
      INNER JOIN users u
        ON cp.user_id = u.id
      WHERE cp.competition_id = ?
      ORDER BY cp.joined_at DESC
      `,
      [competitionId]
    );

    return rows;
  },

  // ============================================================
  // LEADERBOARD
  // ============================================================

  /**
   * Returns participants ranked by score (highest first),
   * with join time as a tiebreaker.
   */
  async getLeaderboard(competitionId) {
    const [rows] = await pool.execute(
      `
      SELECT
        cp.id,
        cp.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        cp.team_name AS team,
        cp.score,
        cp.rank_position AS \`rank\`
      FROM competition_participants cp
      INNER JOIN users u
        ON cp.user_id = u.id
      WHERE cp.competition_id = ?
      ORDER BY cp.score DESC, cp.joined_at ASC
      `,
      [competitionId]
    );

    return rows;
  },

  // ============================================================
  // SCORING
  // ============================================================

  /**
   * Sets a participant's score. Returns true if a row was affected.
   * Call recalculateRanks() afterwards to keep rank_position in sync.
   */
  async updateScore(participantId, score) {
    const [result] = await pool.execute(
      `
      UPDATE competition_participants
      SET score = ?
      WHERE id = ?
      `,
      [score, participantId]
    );

    return result.affectedRows > 0;
  },

  /**
   * Recomputes rank_position for every participant in a competition,
   * ordered by score (highest first), joined_at as a tiebreaker.
   * Participants with a NULL score are ranked last.
   */
  async recalculateRanks(competitionId) {
    await pool.execute(
      `
      UPDATE competition_participants cp
      INNER JOIN (
        SELECT
          id,
          ROW_NUMBER() OVER (
            ORDER BY score IS NULL, score DESC, joined_at ASC
          ) AS position
        FROM competition_participants
        WHERE competition_id = ?
      ) ranked ON cp.id = ranked.id
      SET cp.rank_position = ranked.position
      WHERE cp.competition_id = ?
      `,
      [competitionId, competitionId]
    );
  },

  // ============================================================
  // SUBMISSIONS
  // ============================================================

  /**
   * Returns all submissions for a competition, most recently
   * submitted first, joined with the submitting participant/user.
   */
  async getSubmissions(competitionId) {
    const [rows] = await pool.execute(
      `
      SELECT
        cs.id,
        cs.competition_id,
        cs.participant_id,
        cp.user_id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        cp.team_name AS team,
        cs.title,
        cs.description,
        cs.file_url,
        cs.status,
        cs.submitted_at,
        cs.reviewed_by,
        cs.reviewed_at
      FROM competition_submissions cs
      INNER JOIN competition_participants cp
        ON cs.participant_id = cp.id
      INNER JOIN users u
        ON cp.user_id = u.id
      WHERE cs.competition_id = ?
      ORDER BY cs.submitted_at DESC
      `,
      [competitionId]
    );

    return rows;
  },

  // ============================================================
  // ANALYTICS
  // ============================================================

  /**
   * Returns aggregate participant/score stats for a competition.
   * Falls back to zeroed values if there are no participants.
   */
  async getAnalytics(competitionId) {
    const [rows] = await pool.execute(
      `
      SELECT
        COUNT(*) AS total_participants,
        COUNT(CASE WHEN cp.score IS NOT NULL THEN 1 END)
          AS participants_with_scores,
        COALESCE(AVG(cp.score), 0) AS average_score,
        COALESCE(MAX(cp.score), 0) AS highest_score,
        COALESCE(MIN(cp.score), 0) AS lowest_score
      FROM competition_participants cp
      WHERE cp.competition_id = ?
      `,
      [competitionId]
    );

    return (
      rows[0] || {
        total_participants: 0,
        participants_with_scores: 0,
        average_score: 0,
        highest_score: 0,
        lowest_score: 0,
      }
    );
  },
};

module.exports = Competition;