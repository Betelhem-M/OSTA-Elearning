const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const QuizAttempt = require("../models/QuizAttempt");

const quizController = {
  async getById(req, res) {
    try {
      const quiz = await Quiz.findById(req.params.id);

      if (!quiz) {
        return res.status(404).json({
          message: "Quiz not found",
        });
      }

      const questions = await Question.findByQuiz(quiz.id);

      return res.json({
        ...quiz,
        questions,
      });
    } catch (error) {
      console.error("Get quiz error:", error);

      return res.status(500).json({
        message: "Failed to fetch quiz",
      });
    }
  },

  async getByCourse(req, res) {
    try {
      const quizzes = await Quiz.findByCourse(req.params.courseId);

      return res.json(quizzes);
    } catch (error) {
      console.error("Get course quizzes error:", error);

      return res.status(500).json({
        message: "Failed to fetch quizzes",
      });
    }
  },

  async create(req, res) {
    try {
      const {
        courseId,
        lessonId,
        title,
        description,
        timeLimitMinutes,
        passPercent,
        status,
      } = req.body;

      if (!courseId || !title) {
        return res.status(400).json({
          message: "Course ID and title are required",
        });
      }

      const quizId = await Quiz.create({
        courseId,
        lessonId,
        title,
        description,
        timeLimitMinutes,
        passPercent,
        status,
      });

      const quiz = await Quiz.findById(quizId);

      return res.status(201).json({
        message: "Quiz created successfully",
        quiz,
      });
    } catch (error) {
      console.error("Create quiz error:", error);

      return res.status(500).json({
        message: "Failed to create quiz",
      });
    }
  },

  async addQuestion(req, res) {
    try {
      const quizId = Number(req.params.quizId);

      const {
        questionNumber,
        prompt,
        code,
        difficulty,
        points,
        options,
      } = req.body;

      if (!questionNumber || !prompt) {
        return res.status(400).json({
          message: "Question number and prompt are required",
        });
      }

      const questionId = await Question.create({
        quizId,
        questionNumber,
        prompt,
        code,
        difficulty,
        points,
        options: options || [],
      });

      const question = await Question.findById(questionId);

      return res.status(201).json({
        message: "Question created successfully",
        question,
      });
    } catch (error) {
      console.error("Create question error:", error);

      return res.status(500).json({
        message: "Failed to create question",
      });
    }
  },

  async startAttempt(req, res) {
    try {
      const userId = req.user.id;
      const quizId = Number(req.params.quizId);

      const quiz = await Quiz.findById(quizId);

      if (!quiz) {
        return res.status(404).json({
          message: "Quiz not found",
        });
      }

      const attemptId = await QuizAttempt.start(userId, quizId);

      const attempt = await QuizAttempt.findById(attemptId);

      return res.status(201).json({
        message: "Quiz attempt started",
        attempt,
      });
    } catch (error) {
      console.error("Start quiz attempt error:", error);

      return res.status(500).json({
        message: "Failed to start quiz attempt",
      });
    }
  },

  async saveAnswer(req, res) {
    try {
      const attemptId = Number(req.params.attemptId);

      const {
        questionId,
        selectedOptionId,
      } = req.body;

      if (!questionId) {
        return res.status(400).json({
          message: "Question ID is required",
        });
      }

      const result = await QuizAttempt.saveAnswer({
        attemptId,
        questionId,
        selectedOptionId,
      });

      return res.json({
        message: "Answer saved",
        result,
      });
    } catch (error) {
      console.error("Save quiz answer error:", error);

      return res.status(500).json({
        message: "Failed to save answer",
      });
    }
  },

  async submitAttempt(req, res) {
    try {
      const attemptId = Number(req.params.attemptId);

      const result = await QuizAttempt.submit(attemptId);

      if (!result) {
        return res.status(404).json({
          message: "Quiz attempt not found",
        });
      }

      return res.json({
        message: "Quiz submitted successfully",
        result,
      });
    } catch (error) {
      console.error("Submit quiz error:", error);

      return res.status(500).json({
        message: "Failed to submit quiz",
      });
    }
  },

  async getAttempt(req, res) {
    try {
      const attempt = await QuizAttempt.findById(req.params.attemptId);

      if (!attempt) {
        return res.status(404).json({
          message: "Quiz attempt not found",
        });
      }

      return res.json(attempt);
    } catch (error) {
      console.error("Get quiz attempt error:", error);

      return res.status(500).json({
        message: "Failed to fetch quiz attempt",
      });
    }
  },

  async getMyAttempts(req, res) {
    try {
      const attempts = await QuizAttempt.findByUser(req.user.id);

      return res.json(attempts);
    } catch (error) {
      console.error("Get my quiz attempts error:", error);

      return res.status(500).json({
        message: "Failed to fetch quiz attempts",
      });
    }
  },
};

module.exports = quizController;