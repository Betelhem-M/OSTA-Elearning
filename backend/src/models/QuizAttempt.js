const pool = require("../config/database");
// ============================================================
// QUIZ ATTEMPT MODEL
// ============================================================

const QuizAttempt = {

  // ==========================================================
  // START ATTEMPT
  // ==========================================================
  //
  // Creates a new attempt for a student.
  //
  // Rules:
  // - Quiz must exist
  // - Quiz must be published
  // - Student cannot have another active attempt
  //
  // ==========================================================

  async startAttempt(quizId, userId) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // ------------------------------------------------------
      // GET QUIZ
      // ------------------------------------------------------

      const [quizRows] = await connection.execute(
        `
        SELECT
          id,
          course_id,
          title,
          time_limit_minutes,
          pass_percent,
          status
        FROM quizzes
        WHERE id = ?
        LIMIT 1
        `,
        [quizId]
      );

      if (quizRows.length === 0) {
        throw new Error("Quiz not found");
      }

      const quiz = quizRows[0];

      // ------------------------------------------------------
      // QUIZ MUST BE PUBLISHED
      // ------------------------------------------------------

      if (quiz.status !== "published") {
        throw new Error(
          "This quiz is not available for students"
        );
      }

      // ------------------------------------------------------
      // CHECK ACTIVE ATTEMPT
      // ------------------------------------------------------

      const [activeAttempts] =
        await connection.execute(
          `
          SELECT
            id,
            quiz_id,
            user_id,
            started_at,
            status
          FROM quiz_attempts
          WHERE quiz_id = ?
            AND user_id = ?
            AND status = 'in_progress'
          ORDER BY started_at DESC
          LIMIT 1
          `,
          [quizId, userId]
        );

      // ------------------------------------------------------
      // RETURN EXISTING ACTIVE ATTEMPT
      // ------------------------------------------------------

      if (activeAttempts.length > 0) {
        await connection.commit();

        return {
          attempt: activeAttempts[0],
          quiz,
          resumed: true,
        };
      }

      // ------------------------------------------------------
      // CREATE NEW ATTEMPT
      // ------------------------------------------------------

      const [result] =
        await connection.execute(
          `
          INSERT INTO quiz_attempts (
            quiz_id,
            user_id,
            started_at,
            status
          )
          VALUES (?, ?, NOW(), 'in_progress')
          `,
          [quizId, userId]
        );

      const attemptId = result.insertId;

      // ------------------------------------------------------
      // GET CREATED ATTEMPT
      // ------------------------------------------------------

      const [attemptRows] =
        await connection.execute(
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
          WHERE id = ?
          LIMIT 1
          `,
          [attemptId]
        );

      await connection.commit();

      return {
        attempt: attemptRows[0],
        quiz,
        resumed: false,
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // ==========================================================
  // FIND ATTEMPT BY ID
  // ==========================================================

  async findById(attemptId) {
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
        q.time_limit_minutes,
        q.pass_percent

      FROM quiz_attempts qa

      INNER JOIN quizzes q
        ON q.id = qa.quiz_id

      WHERE qa.id = ?

      LIMIT 1
      `,
      [attemptId]
    );

    return rows.length > 0
      ? rows[0]
      : null;
  },

  // ==========================================================
  // FIND STUDENT ATTEMPT
  // ==========================================================

  async findByIdForUser(attemptId, userId) {
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
        q.time_limit_minutes,
        q.pass_percent

      FROM quiz_attempts qa

      INNER JOIN quizzes q
        ON q.id = qa.quiz_id

      WHERE qa.id = ?
        AND qa.user_id = ?

      LIMIT 1
      `,
      [attemptId, userId]
    );

    return rows.length > 0
      ? rows[0]
      : null;
  },

  // ==========================================================
  // GET ANSWERS
  // ==========================================================

  async getAnswers(attemptId) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        attempt_id,
        question_id,
        selected_option_id,
        is_correct,
        points_earned
      FROM quiz_answers
      WHERE attempt_id = ?
      ORDER BY question_id ASC
      `,
      [attemptId]
    );

    return rows;
  },

  // ==========================================================
  // GET SINGLE ANSWER
  // ==========================================================

  async getAnswer(
    attemptId,
    questionId
  ) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        attempt_id,
        question_id,
        selected_option_id,
        is_correct,
        points_earned
      FROM quiz_answers
      WHERE attempt_id = ?
        AND question_id = ?
      LIMIT 1
      `,
      [attemptId, questionId]
    );

    return rows.length > 0
      ? rows[0]
      : null;
  },

  // ==========================================================
  // SAVE ANSWER
  // ==========================================================
  //
  // The correct answer is determined on the backend.
  //
  // We NEVER trust the frontend to tell us:
  //
  // is_correct = true
  //
  // or:
  //
  // points_earned = 10
  //
  // The server calculates these values.
  //
  // ==========================================================

  async saveAnswer(
    attemptId,
    questionId,
    selectedOptionId
  ) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // ------------------------------------------------------
      // GET ATTEMPT
      // ------------------------------------------------------

      const [attemptRows] =
        await connection.execute(
          `
          SELECT
            id,
            quiz_id,
            user_id,
            started_at,
            status
          FROM quiz_attempts
          WHERE id = ?
          LIMIT 1
          `,
          [attemptId]
        );

      if (attemptRows.length === 0) {
        throw new Error(
          "Quiz attempt not found"
        );
      }

      const attempt = attemptRows[0];

      // ------------------------------------------------------
      // ATTEMPT MUST BE ACTIVE
      // ------------------------------------------------------

      if (
        attempt.status !==
        "in_progress"
      ) {
        throw new Error(
          "This quiz attempt is no longer active"
        );
      }

      // ------------------------------------------------------
      // GET QUESTION
      // ------------------------------------------------------

      const [questionRows] =
        await connection.execute(
          `
          SELECT
            id,
            quiz_id,
            points,
            question_type
          FROM questions
          WHERE id = ?
            AND quiz_id = ?
          LIMIT 1
          `,
          [
            questionId,
            attempt.quiz_id,
          ]
        );

      if (questionRows.length === 0) {
        throw new Error(
          "Question does not belong to this quiz"
        );
      }

      const question =
        questionRows[0];

      // ------------------------------------------------------
      // GET SELECTED OPTION
      // ------------------------------------------------------

      const [optionRows] =
        await connection.execute(
          `
          SELECT
            id,
            question_id,
            is_correct
          FROM question_options
          WHERE id = ?
            AND question_id = ?
          LIMIT 1
          `,
          [
            selectedOptionId,
            questionId,
          ]
        );

      if (optionRows.length === 0) {
        throw new Error(
          "Selected option does not belong to this question"
        );
      }

      const selectedOption =
        optionRows[0];

      // ------------------------------------------------------
      // CALCULATE RESULT
      // ------------------------------------------------------

      const isCorrect =
        Number(
          selectedOption.is_correct
        ) === 1;

      const pointsEarned =
        isCorrect
          ? Number(question.points)
          : 0;

      // ------------------------------------------------------
      // CHECK EXISTING ANSWER
      // ------------------------------------------------------

      const [existingRows] =
        await connection.execute(
          `
          SELECT id
          FROM quiz_answers
          WHERE attempt_id = ?
            AND question_id = ?
          LIMIT 1
          `,
          [
            attemptId,
            questionId,
          ]
        );

      // ------------------------------------------------------
      // UPDATE EXISTING ANSWER
      // ------------------------------------------------------

      if (existingRows.length > 0) {
        await connection.execute(
          `
          UPDATE quiz_answers
          SET
            selected_option_id = ?,
            is_correct = ?,
            points_earned = ?
          WHERE id = ?
          `,
          [
            selectedOptionId,
            isCorrect ? 1 : 0,
            pointsEarned,
            existingRows[0].id,
          ]
        );
      }

      // ------------------------------------------------------
      // INSERT NEW ANSWER
      // ------------------------------------------------------

      else {
        await connection.execute(
          `
          INSERT INTO quiz_answers (
            attempt_id,
            question_id,
            selected_option_id,
            is_correct,
            points_earned
          )
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            attemptId,
            questionId,
            selectedOptionId,
            isCorrect ? 1 : 0,
            pointsEarned,
          ]
        );
      }

      await connection.commit();

      return {
        attemptId,
        questionId,
        selectedOptionId,
        isCorrect,
        pointsEarned,
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // ==========================================================
  // CHECK TIME LIMIT
  // ==========================================================

  async isExpired(attemptId) {
    const [rows] = await pool.execute(
      `
      SELECT
        qa.started_at,
        q.time_limit_minutes
      FROM quiz_attempts qa

      INNER JOIN quizzes q
        ON q.id = qa.quiz_id

      WHERE qa.id = ?

      LIMIT 1
      `,
      [attemptId]
    );

    if (rows.length === 0) {
      return true;
    }

    const attempt =
      rows[0];

    // --------------------------------------------------------
    // NO TIME LIMIT
    // --------------------------------------------------------

    if (
      attempt.time_limit_minutes ===
        null ||
      attempt.time_limit_minutes ===
        undefined
    ) {
      return false;
    }

    const startedAt =
      new Date(
        attempt.started_at
      );

    const now = new Date();

    const elapsedMinutes =
      (now - startedAt) /
      (1000 * 60);

    return (
      elapsedMinutes >=
      Number(
        attempt.time_limit_minutes
      )
    );
  },

  // ==========================================================
  // SUBMIT ATTEMPT
  // ==========================================================

  async submitAttempt(attemptId) {
    const connection =
      await pool.getConnection();

    try {
      await connection.beginTransaction();

      // ------------------------------------------------------
      // GET ATTEMPT + QUIZ
      // ------------------------------------------------------

      const [attemptRows] =
        await connection.execute(
          `
          SELECT
            qa.id,
            qa.quiz_id,
            qa.user_id,
            qa.status,

            q.pass_percent

          FROM quiz_attempts qa

          INNER JOIN quizzes q
            ON q.id = qa.quiz_id

          WHERE qa.id = ?

          LIMIT 1
          `,
          [attemptId]
        );

      if (attemptRows.length === 0) {
        throw new Error(
          "Quiz attempt not found"
        );
      }

      const attempt =
        attemptRows[0];

      // ------------------------------------------------------
      // ALREADY SUBMITTED
      // ------------------------------------------------------

      if (
        attempt.status ===
        "submitted"
      ) {
        throw new Error(
          "Quiz attempt has already been submitted"
        );
      }

      // ------------------------------------------------------
      // GET ANSWERS
      // ------------------------------------------------------

      const [answerRows] =
        await connection.execute(
          `
          SELECT
            points_earned
          FROM quiz_answers
          WHERE attempt_id = ?
          `,
          [attemptId]
        );

      // ------------------------------------------------------
      // CALCULATE SCORE
      // ------------------------------------------------------

      const score =
        answerRows.reduce(
          (
            total,
            answer
          ) =>
            total +
            Number(
              answer.points_earned ||
                0
            ),
          0
        );

      // ------------------------------------------------------
      // GET TOTAL POSSIBLE POINTS
      // ------------------------------------------------------

      const [totalRows] =
        await connection.execute(
          `
          SELECT
            COALESCE(
              SUM(points),
              0
            ) AS total_points
          FROM questions
          WHERE quiz_id = ?
          `,
          [attempt.quiz_id]
        );

      const totalPoints =
        Number(
          totalRows[0]
            .total_points
        );

      // ------------------------------------------------------
      // CALCULATE PERCENTAGE
      // ------------------------------------------------------

      const percentage =
        totalPoints > 0
          ? (score /
              totalPoints) *
            100
          : 0;

      // ------------------------------------------------------
      // PASS / FAIL
      // ------------------------------------------------------

      const passed =
        percentage >=
        Number(
          attempt.pass_percent
        )
          ? 1
          : 0;

      // ------------------------------------------------------
      // UPDATE ATTEMPT
      // ------------------------------------------------------

      await connection.execute(
        `
        UPDATE quiz_attempts
        SET
          submitted_at = NOW(),
          score = ?,
          percentage = ?,
          passed = ?,
          status = 'submitted'
        WHERE id = ?
        `,
        [
          score,
          percentage,
          passed,
          attemptId,
        ]
      );

      // ------------------------------------------------------
      // GET FINAL RESULT
      // ------------------------------------------------------

      const [resultRows] =
        await connection.execute(
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
          WHERE id = ?
          LIMIT 1
          `,
          [attemptId]
        );

      await connection.commit();

      return {
        attempt:
          resultRows[0],
        score,
        totalPoints,
        percentage,
        passed:
          Boolean(passed),
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // ==========================================================
  // GET STUDENT ATTEMPTS
  // ==========================================================

  async getUserAttempts(
    userId,
    quizId
  ) {
    const [rows] =
      await pool.execute(
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
        WHERE user_id = ?
          AND quiz_id = ?
        ORDER BY started_at DESC
        `,
        [
          userId,
          quizId,
        ]
      );

    return rows;
  },

  // ==========================================================
  // GET ALL ATTEMPTS FOR QUIZ
  // ==========================================================
  //
  // Used by instructor/admin.
  //
  // ==========================================================

  async getQuizAttempts(
    quizId
  ) {
    const [rows] =
      await pool.execute(
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

          u.name,
          u.email

        FROM quiz_attempts qa

        INNER JOIN users u
          ON u.id = qa.user_id

        WHERE qa.quiz_id = ?

        ORDER BY
          qa.started_at DESC
        `,
        [quizId]
      );

    return rows;
  },
};

module.exports = QuizAttempt;