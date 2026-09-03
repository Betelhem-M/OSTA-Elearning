const QuizAttempt = require("../models/QuizAttempt");
const Quiz = require("../models/Quiz");
const Notification = require("../models/Notification");

// ============================================================
// START QUIZ ATTEMPT
// POST /api/quizzes/:quizId/attempts
// ============================================================

const startAttempt = async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);
    const userId = Number(req.user.id);

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    // --------------------------------------------------------
    // CHECK QUIZ
    // --------------------------------------------------------

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // --------------------------------------------------------
    // QUIZ MUST BE PUBLISHED
    // --------------------------------------------------------

    if (quiz.status !== "published") {
      return res.status(403).json({
        success: false,
        message: "This quiz is not available",
      });
    }

    // --------------------------------------------------------
    // START / RESUME
    // --------------------------------------------------------

    const result = await QuizAttempt.startAttempt(
      quizId,
      userId
    );

    return res.status(201).json({
      success: true,
      message: result.resumed
        ? "Quiz attempt resumed"
        : "Quiz attempt started",
      data: result,
    });
  } catch (error) {
    console.error(
      "Start quiz attempt error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to start quiz",
    });
  }
};

// ============================================================
// GET ATTEMPT
// GET /api/quiz-attempts/:attemptId
// ============================================================

const getAttempt = async (req, res) => {
  try {
    const attemptId =
      Number(req.params.attemptId);

    const userId =
      Number(req.user.id);

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID",
      });
    }

    const attempt =
      await QuizAttempt.findByIdForUser(
        attemptId,
        userId
      );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    const answers =
      await QuizAttempt.getAnswers(
        attemptId
      );

    return res.status(200).json({
      success: true,
      data: {
        attempt,
        answers,
      },
    });
  } catch (error) {
    console.error(
      "Get attempt error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get quiz attempt",
    });
  }
};

// ============================================================
// SAVE ANSWER
// PUT /api/quiz-attempts/:attemptId/answers
// ============================================================

const saveAnswer = async (req, res) => {
  try {
    const attemptId =
      Number(req.params.attemptId);

    const userId =
      Number(req.user.id);

    const {
      questionId,
      selectedOptionId,
    } = req.body;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID",
      });
    }

    if (!questionId) {
      return res.status(422).json({
        success: false,
        message: "Question ID is required",
      });
    }

    if (!selectedOptionId) {
      return res.status(422).json({
        success: false,
        message:
          "Selected option is required",
      });
    }

    // --------------------------------------------------------
    // OWNERSHIP
    // --------------------------------------------------------

    const attempt =
      await QuizAttempt.findByIdForUser(
        attemptId,
        userId
      );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    // --------------------------------------------------------
    // STATUS
    // --------------------------------------------------------

    if (
      attempt.status !==
      "in_progress"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This attempt is no longer active",
      });
    }

    // --------------------------------------------------------
    // TIME LIMIT
    // --------------------------------------------------------

    const expired =
      await QuizAttempt.isExpired(
        attemptId
      );

    if (expired) {
      await QuizAttempt.submitAttempt(
        attemptId
      );

      return res.status(409).json({
        success: false,
        message:
          "Quiz time has expired. The quiz was submitted automatically.",
      });
    }

    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------

    const answer =
      await QuizAttempt.saveAnswer(
        attemptId,
        Number(questionId),
        Number(selectedOptionId)
      );

    return res.status(200).json({
      success: true,
      message: "Answer saved",
      data: answer,
    });
  } catch (error) {
    console.error(
      "Save answer error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// SUBMIT QUIZ
// POST /api/quiz-attempts/:attemptId/submit
// ============================================================

const submitAttempt = async (
  req,
  res
) => {
  try {
    const attemptId =
      Number(req.params.attemptId);

    const userId =
      Number(req.user.id);

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID",
      });
    }

    // --------------------------------------------------------
    // OWNERSHIP
    // --------------------------------------------------------

    const attempt =
      await QuizAttempt.findByIdForUser(
        attemptId,
        userId
      );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found",
      });
    }

    // --------------------------------------------------------
    // ALREADY SUBMITTED
    // --------------------------------------------------------

    if (
      attempt.status ===
      "submitted"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This quiz has already been submitted",
      });
    }

    // --------------------------------------------------------
    // SUBMIT
    // --------------------------------------------------------

    const result =
      await QuizAttempt.submitAttempt(
        attemptId
      );

    await Notification.create({
      userId: req.user.id,
      title: "Quiz result available",
      message: `Your quiz has been submitted. Score: ${result?.percentage ?? 0}%.`,
      category: "Quizzes",
      entityType: "quiz_attempt",
      entityId: attemptId,
      targetPath: `/quiz/${attempt.quiz_id}`,
    });

    return res.status(200).json({
      success: true,
      message:
        "Quiz submitted successfully",
      data: result,
    });
  } catch (error) {
    console.error(
      "Submit quiz error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// GET STUDENT QUIZ ATTEMPTS
// GET /api/quizzes/:quizId/attempts/me
// ============================================================

const getMyAttempts = async (
  req,
  res
) => {
  try {
    const quizId =
      Number(req.params.quizId);

    const userId =
      Number(req.user.id);

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const attempts =
      await QuizAttempt.getUserAttempts(
        userId,
        quizId
      );

    return res.status(200).json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    console.error(
      "Get student attempts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get attempts",
    });
  }
};

// ============================================================
// INSTRUCTOR GET QUIZ ATTEMPTS
// GET /api/quizzes/:quizId/attempts
// ============================================================

const getQuizAttempts = async (
  req,
  res
) => {
  try {
    const quizId =
      Number(req.params.quizId);

    const userId =
      Number(req.user.id);

    const role =
      req.user.role;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    // --------------------------------------------------------
    // ADMIN
    // --------------------------------------------------------

    if (role !== "admin") {
      const ownsQuiz =
        await Quiz.belongsToInstructor(
          quizId,
          userId
        );

      if (!ownsQuiz) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view these attempts",
        });
      }
    }

    const attempts =
      await QuizAttempt.getQuizAttempts(
        quizId
      );

    return res.status(200).json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    console.error(
      "Get quiz attempts error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get quiz attempts",
    });
  }
};

module.exports = {
  startAttempt,
  getAttempt,
  saveAnswer,
  submitAttempt,
  getMyAttempts,
  getQuizAttempts,
};