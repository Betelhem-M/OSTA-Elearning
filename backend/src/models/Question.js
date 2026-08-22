const pool = require("../config/database");

const Question = {
  async findById(id) {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        quiz_id,
        question_number,
        prompt,
        code,
        difficulty,
        points,
        created_at
      FROM questions
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows[0]) {
      return null;
    }

    const [options] = await pool.execute(
      `
      SELECT
        id,
        question_id,
        option_key,
        option_text,
        is_correct
      FROM question_options
      WHERE question_id = ?
      ORDER BY id ASC
      `,
      [id]
    );

    return {
      ...rows[0],
      options,
    };
  },

  async findByQuiz(quizId) {
    const [questions] = await pool.execute(
      `
      SELECT
        id,
        quiz_id,
        question_number,
        prompt,
        code,
        difficulty,
        points,
        created_at
      FROM questions
      WHERE quiz_id = ?
      ORDER BY question_number ASC
      `,
      [quizId]
    );

    for (const question of questions) {
      const [options] = await pool.execute(
        `
        SELECT
          id,
          question_id,
          option_key,
          option_text,
          is_correct
        FROM question_options
        WHERE question_id = ?
        ORDER BY id ASC
        `,
        [question.id]
      );

      question.options = options;
    }

    return questions;
  },

  async create({
    quizId,
    questionNumber,
    prompt,
    code,
    difficulty = "Medium",
    points = 1,
    options = [],
  }) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [questionResult] = await connection.execute(
        `
        INSERT INTO questions
        (
          quiz_id,
          question_number,
          prompt,
          code,
          difficulty,
          points
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          quizId,
          questionNumber,
          prompt,
          code || null,
          difficulty,
          points,
        ]
      );

      const questionId = questionResult.insertId;

      for (const option of options) {
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

      await connection.execute(
        `
        UPDATE quizzes
        SET total_questions = (
          SELECT COUNT(*)
          FROM questions
          WHERE quiz_id = ?
        )
        WHERE id = ?
        `,
        [quizId, quizId]
      );

      await connection.commit();

      return questionId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async update(id, {
    questionNumber,
    prompt,
    code,
    difficulty,
    points,
  }) {
    const [result] = await pool.execute(
      `
      UPDATE questions
      SET
        question_number = ?,
        prompt = ?,
        code = ?,
        difficulty = ?,
        points = ?
      WHERE id = ?
      `,
      [
        questionNumber,
        prompt,
        code || null,
        difficulty,
        points,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  async addOption({
    questionId,
    optionKey,
    optionText,
    isCorrect = false,
  }) {
    const [result] = await pool.execute(
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
        optionKey,
        optionText,
        isCorrect ? 1 : 0,
      ]
    );

    return result.insertId;
  },

  async updateOption(
    optionId,
    {
      optionKey,
      optionText,
      isCorrect,
    }
  ) {
    const [result] = await pool.execute(
      `
      UPDATE question_options
      SET
        option_key = ?,
        option_text = ?,
        is_correct = ?
      WHERE id = ?
      `,
      [
        optionKey,
        optionText,
        isCorrect ? 1 : 0,
        optionId,
      ]
    );

    return result.affectedRows > 0;
  },

  async deleteOption(optionId) {
    const [result] = await pool.execute(
      "DELETE FROM question_options WHERE id = ?",
      [optionId]
    );

    return result.affectedRows > 0;
  },

  async delete(id) {
    const [questionRows] = await pool.execute(
      "SELECT quiz_id FROM questions WHERE id = ? LIMIT 1",
      [id]
    );

    if (!questionRows[0]) {
      return false;
    }

    const quizId = questionRows[0].quiz_id;

    const [result] = await pool.execute(
      "DELETE FROM questions WHERE id = ?",
      [id]
    );

    if (result.affectedRows > 0) {
      await pool.execute(
        `
        UPDATE quizzes
        SET total_questions = (
          SELECT COUNT(*)
          FROM questions
          WHERE quiz_id = ?
        )
        WHERE id = ?
        `,
        [quizId, quizId]
      );
    }

    return result.affectedRows > 0;
  },
};

module.exports = Question;