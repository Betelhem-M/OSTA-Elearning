const pool = require("../config/database");

const Quiz = {
  // =====================================================
  // GET ALL QUIZZES
  // =====================================================
  async findAll() {
    const [rows] = await pool.execute(`
      SELECT
        q.id,
        q.course_id,
        q.lesson_id,
        q.title,
        q.description,
        q.total_questions,
        q.time_limit_minutes,
        q.pass_percent,
        q.shuffle_questions,
        q.status,
        q.created_at,
        q.updated_at,

        c.title AS course_title

      FROM quizzes q

      JOIN courses c
        ON q.course_id = c.id

      ORDER BY q.created_at DESC
    `);

    return rows;
  },

  // =====================================================
  // GET QUIZ BY ID
  // =====================================================
  async findById(id) {
    const [quizRows] = await pool.execute(
      `
      SELECT
        q.id,
        q.course_id,
        q.lesson_id,
        q.title,
        q.description,
        q.total_questions,
        q.time_limit_minutes,
        q.pass_percent,
        q.shuffle_questions,
        q.status,
        q.created_at,
        q.updated_at,

        c.title AS course_title

      FROM quizzes q

      JOIN courses c
        ON q.course_id = c.id

      WHERE q.id = ?

      LIMIT 1
      `,
      [id]
    );

    if (quizRows.length === 0) {
      return null;
    }

    const quiz = quizRows[0];

    // ===================================================
    // GET QUESTIONS
    // ===================================================

    const [questions] = await pool.execute(
      `
      SELECT
        id,
        quiz_id,
        question_number,
        prompt,
        question_type,
        code,
        difficulty,
        points,
        explanation,
        created_at

      FROM questions

      WHERE quiz_id = ?

      ORDER BY question_number ASC
      `,
      [id]
    );

    // ===================================================
    // GET OPTIONS FOR ALL QUESTIONS
    // ===================================================

    if (questions.length > 0) {
      const questionIds = questions.map(
        (question) => question.id
      );

      const placeholders = questionIds
        .map(() => "?")
        .join(",");

      const [options] = await pool.execute(
        `
        SELECT
          id,
          question_id,
          option_key,
          option_text,
          is_correct

        FROM question_options

        WHERE question_id IN (${placeholders})

        ORDER BY id ASC
        `,
        questionIds
      );

      // Attach options to their questions
      questions.forEach((question) => {
        question.options = options.filter(
          (option) =>
            option.question_id === question.id
        );
      });
    } else {
      questions.forEach((question) => {
        question.options = [];
      })
    }

    quiz.questions = questions;

    return quiz;
  },

  // =====================================================
  // CREATE QUIZ
  // =====================================================
  async create({
    courseId,
    lessonId,
    title,
    description,
    timeLimitMinutes,
    passPercent,
    shuffleQuestions = false,
    status = "draft",
    questions = [],
  }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // =================================================
      // CREATE QUIZ
      // =================================================


      console.log("========== QUIZ INSERT DEBUG ==========");
console.log({
  courseId,
  lessonId,
  title,
  timeLimitMinutes,
  passPercent,
  shuffleQuestions,
  status,
});
console.log("========================================");
      const [quizResult] = await connection.execute(
        `
        INSERT INTO quizzes
        (
          course_id,
          lesson_id,
          title,
          description,
          total_questions,
          time_limit_minutes,
          pass_percent,
          shuffle_questions,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          courseId,
          lessonId,
          title,
          description || null,
          questions.length,
          timeLimitMinutes || null,
          passPercent ?? 0,
          shuffleQuestions ? 1 : 0,
          status,
        ]
      );

      const quizId = quizResult.insertId;

      // =================================================
      // CREATE QUESTIONS + OPTIONS
      // =================================================

      for (let index = 0; index < questions.length; index++) {
        const question = questions[index];

        const [questionResult] =
          await connection.execute(
            `
            INSERT INTO questions
            (
              quiz_id,
              question_number,
              prompt,
              question_type,
              code,
              difficulty,
              points,
              explanation
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              quizId,
              index + 1,
              question.prompt,
              question.questionType ||
                "multiple_choice",
              question.code || null,
              question.difficulty || null,
              question.points || 0,
              question.explanation || null,
            ]
          );

        const questionId =
          questionResult.insertId;

        // ===============================================
        // CREATE OPTIONS
        // ===============================================

        if (
          Array.isArray(question.options) &&
          question.options.length > 0
        ) {
          for (const option of question.options) {
            await connection.execute(
              `
              INSERT INTO question_options
              (
                question_id,
                option_key,
                option_text,
                is_correct
              )
              VALUES (?, ?, ?, ?)
              `,
              [
                questionId,
                option.optionKey,
                option.optionText,
                option.isCorrect ? 1 : 0,
              ]
            );
          }
        }
      }

      await connection.commit();

      return quizId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // =====================================================
  // UPDATE QUIZ
  // =====================================================
  async update(
    id,
    {
      lessonId,
      title,
      description,
      timeLimitMinutes,
      passPercent,
      shuffleQuestions,
      status,
    }
  ) {
    const [result] = await pool.execute(
      `
      UPDATE quizzes
      SET
        lesson_id = ?,
        title = ?,
        description = ?,
        time_limit_minutes = ?,
        pass_percent = ?,
        shuffle_questions = ?,
        status = ?
      WHERE id = ?
      `,
      [
        lessonId,
        title,
        description || null,
        timeLimitMinutes || null,
        passPercent ?? 0,
        shuffleQuestions ? 1 : 0,
        status || "draft",
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  // =====================================================
  // UPDATE QUIZ STATUS
  // =====================================================
  async updateStatus(id, status) {
    const [result] = await pool.execute(
      `
      UPDATE quizzes
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    );

    return result.affectedRows > 0;
  },

  // =====================================================
  // DELETE QUIZ
  // =====================================================
  async delete(id) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Get question IDs first
      const [questions] =
        await connection.execute(
          `
          SELECT id
          FROM questions
          WHERE quiz_id = ?
          `,
          [id]
        );

      // Delete options
      for (const question of questions) {
        await connection.execute(
          `
          DELETE FROM question_options
          WHERE question_id = ?
          `,
          [question.id]
        );
      }

      // Delete questions
      await connection.execute(
        `
        DELETE FROM questions
        WHERE quiz_id = ?
        `,
        [id]
      );

      // Delete quiz
      const [result] =
        await connection.execute(
          `
          DELETE FROM quizzes
          WHERE id = ?
          `,
          [id]
        );

      await connection.commit();

      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // =====================================================
  // GET QUIZZES BY COURSE
  // =====================================================
  async findByCourseId(courseId) {
    const [rows] = await pool.execute(
      `
      SELECT
        q.id,
        q.course_id,
        q.lesson_id,
        q.title,
        q.description,
        q.total_questions,
        q.time_limit_minutes,
        q.pass_percent,
        q.shuffle_questions,
        q.status,
        q.created_at,
        q.updated_at

      FROM quizzes q

      WHERE q.course_id = ?

      ORDER BY q.created_at DESC
      `,
      [courseId]
    );

    return rows;
  },

  // =====================================================
  // CHECK QUIZ OWNERSHIP
  // =====================================================
  async belongsToInstructor(
    quizId,
    instructorId
  ) {
    const [rows] = await pool.execute(
      `
      SELECT
        q.id

      FROM quizzes q

      JOIN courses c
        ON q.course_id = c.id

      WHERE q.id = ?
        AND c.instructor_id = ?

      LIMIT 1
      `,
      [quizId, instructorId]
    );

    return rows.length > 0;
  },



  // ============================================================
// CHECK IF QUIZ HAS ATTEMPTS
// ============================================================

async hasAttempts(quizId) {
  const [rows] = await pool.execute(
    `
    SELECT COUNT(*) AS total
    FROM quiz_attempts
    WHERE quiz_id = ?
    `,
    [quizId]
  );

  return Number(rows[0].total) > 0;
},

// ============================================================
// VALIDATE QUIZ FOR PUBLISHING
// ============================================================

async validateForPublishing(quizId) {
  const quiz = await this.findById(quizId);

  if (!quiz) {
    return {
      valid: false,
      errors: ["Quiz not found"],
    };
  }

  const errors = [];

  // ----------------------------------------------------------
  // TITLE
  // ----------------------------------------------------------

  if (!quiz.title || !quiz.title.trim()) {
    errors.push("Quiz title is required");
  }

  // ----------------------------------------------------------
  // QUESTIONS
  // ----------------------------------------------------------

  if (
    !Array.isArray(quiz.questions) ||
    quiz.questions.length === 0
  ) {
    errors.push(
      "Quiz must contain at least one question"
    );
  }

  // ----------------------------------------------------------
  // QUESTIONS + OPTIONS
  // ----------------------------------------------------------

  for (const question of quiz.questions || []) {
    if (!question.prompt?.trim()) {
      errors.push(
        `Question ${question.question_number} requires a prompt`
      );
    }

    if (
      !question.points ||
      Number(question.points) <= 0
    ) {
      errors.push(
        `Question ${question.question_number} must have positive points`
      );
    }

    if (
      question.question_type === "multiple_choice"
    ) {
      const options = question.options || [];

      if (options.length < 2) {
        errors.push(
          `Question ${question.question_number} requires at least 2 options`
        );
      }

      const validOptions = options.filter(
        (option) =>
          option.option_text?.trim()
      );

      if (validOptions.length < 2) {
        errors.push(
          `Question ${question.question_number} has invalid options`
        );
      }

      const correctOptions = options.filter(
        (option) =>
          Number(option.is_correct) === 1
      );

      if (correctOptions.length !== 1) {
        errors.push(
          `Question ${question.question_number} must have exactly one correct answer`
        );
      }
    }
  }

  // ----------------------------------------------------------
  // PASSING SCORE
  // ----------------------------------------------------------

  const passPercent = Number(
    quiz.pass_percent
  );

  if (
    Number.isNaN(passPercent) ||
    passPercent < 0 ||
    passPercent > 100
  ) {
    errors.push(
      "Passing score must be between 0 and 100"
    );
  }

  // ----------------------------------------------------------
  // TIME LIMIT
  // ----------------------------------------------------------

  if (
    quiz.time_limit_minutes !== null &&
    Number(quiz.time_limit_minutes) <= 0
  ) {
    errors.push(
      "Time limit must be greater than 0"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
},

  // =====================================================
  // CHECK COURSE OWNERSHIP
  // =====================================================
  async courseBelongsToInstructor(
    courseId,
    instructorId
  ) {
    const [rows] = await pool.execute(
      `
      SELECT id
      FROM courses
      WHERE id = ?
        AND instructor_id = ?
      LIMIT 1
      `,
      [courseId, instructorId]
    );

    return rows.length > 0;
  },
};




module.exports = Quiz;