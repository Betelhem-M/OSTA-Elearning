const pool = require("../config/database");

const QuizAttempt = {
  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        qa.id,
        qa.quiz_id,
        qa.user_id,
        qa.started_at,
        qa.submitted_at,
        qa.score,
        qa.percentage,
        qa.passed,
        qa.status,
        q.title AS quiz_title,
        q.total_questions,
        q.pass_percent
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows[0]) {
      return null;
    }

    const [answers] = await pool.execute(
      `
      SELECT
        a.id,
        a.attempt_id,
        a.question_id,
        a.selected_option_id,
        a.is_correct,
        a.points_earned,
        qo.option_key AS selected_option_key
      FROM quiz_answers a
      LEFT JOIN question_options qo
        ON a.selected_option_id = qo.id
      WHERE a.attempt_id = ?
      ORDER BY a.id ASC
      `,
      [id]
    );

    return {
      ...rows[0],
      answers,
    };
  },

  async findByUser(userId) {
    const [rows] = await pool.execute(
      `
      SELECT
        qa.id,
        qa.quiz_id,
        qa.user_id,
        qa.started_at,
        qa.submitted_at,
        qa.score,
        qa.percentage,
        qa.passed,
        qa.status,
        q.title AS quiz_title
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = ?
      ORDER BY qa.started_at DESC
      `,
      [userId]
    );

    return rows;
  },

  async findByUserAndQuiz(userId, quizId) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        quiz_id,
        user_id,
        started_at,
        submitted_at,
        score,
        percentage,
        passed,
        status
      FROM quiz_attempts
      WHERE user_id = ? AND quiz_id = ?
      ORDER BY started_at DESC
      `,
      [userId, quizId]
    );

    return rows;
  },

  async start(userId, quizId) {
    const [result] = await pool.execute(
      `
      INSERT INTO quiz_attempts
      (
        quiz_id,
        user_id,
        status
      )
      VALUES (?, ?, 'in_progress')
      `,
      [quizId, userId]
    );

    return result.insertId;
  },

  async saveAnswer({
    attemptId,
    questionId,
    selectedOptionId,
  }) {
    const [optionRows] = await pool.execute(
      `
      SELECT
        id,
        is_correct
      FROM question_options
      WHERE id = ?
      LIMIT 1
      `,
      [selectedOptionId]
    );

    let isCorrect = false;
    let pointsEarned = 0;

    if (optionRows[0]) {
      isCorrect = Boolean(optionRows[0].is_correct);

      if (isCorrect) {
        const [questionRows] = await pool.execute(
          `
          SELECT points
          FROM questions
          WHERE id = ?
          LIMIT 1
          `,
          [questionId]
        );

        pointsEarned = questionRows[0]?.points || 0;
      }
    }

    await pool.execute(
      `
      INSERT INTO quiz_answers
      (
        attempt_id,
        question_id,
        selected_option_id,
        is_correct,
        points_earned
      )
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        selected_option_id = VALUES(selected_option_id),
        is_correct = VALUES(is_correct),
        points_earned = VALUES(points_earned)
      `,
      [
        attemptId,
        questionId,
        selectedOptionId || null,
        isCorrect ? 1 : 0,
        pointsEarned,
      ]
    );

    return {
      isCorrect,
      pointsEarned,
    };
  },

  async submit(attemptId) {
    const [attemptRows] = await pool.execute(
      `
      SELECT
        qa.quiz_id,
        q.pass_percent
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.id = ?
      LIMIT 1
      `,
      [attemptId]
    );

    if (!attemptRows[0]) {
      return null;
    }

    const { quiz_id: quizId, pass_percent: passPercent } = attemptRows[0];

    const [scoreRows] = await pool.execute(
      `
      SELECT
        COALESCE(SUM(qa.points_earned), 0) AS score,
        COUNT(q.id) AS total_questions,
        COALESCE(SUM(q.points), 0) AS max_score
      FROM quiz_answers qa
      JOIN questions q ON qa.question_id = q.id
      WHERE qa.attempt_id = ?
      `,
      [attemptId]
    );

    const scoreData = scoreRows[0];

    const score = Number(scoreData.score || 0);
    const maxScore = Number(scoreData.max_score || 0);

    const percentage =
      maxScore > 0
        ? Number(((score / maxScore) * 100).toFixed(2))
        : 0;

    const passed = percentage >= Number(passPercent);

    await pool.execute(
      `
      UPDATE quiz_attempts
      SET
        submitted_at = CURRENT_TIMESTAMP,
        score = ?,
        percentage = ?,
        passed = ?,
        status = 'submitted'
      WHERE id = ?
      `,
      [
        score,
        percentage,
        passed ? 1 : 0,
        attemptId,
      ]
    );

    return {
      attemptId,
      quizId,
      score,
      maxScore,
      percentage,
      passed,
    };
  },
};

module.exports = QuizAttempt;