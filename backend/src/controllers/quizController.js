const Quiz = require("../models/Quiz");

// =====================================================
// CREATE QUIZ
// POST /api/quizzes
// =====================================================

const createQuiz = async (req, res) => {
  try {
    const {
      courseId,
      lessonId,
      title,
      description,
      timeLimitMinutes,
      passPercent,
      shuffleQuestions,
      status,
      questions,
    } = req.body;

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Quiz title is required",
      });
    }

    if (
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one question is required",
      });
    }

    // ===================================================
    // CHECK INSTRUCTOR COURSE OWNERSHIP
    // ===================================================

    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication information is missing",
      });
    }

    // Admin can create quizzes for any course.
    // Instructor must own the course.




console.log("========== QUIZ AUTH ==========");
console.log("req.user:", req.user);
console.log("userId:", userId);
console.log("userRole:", userRole);
console.log("courseId:", courseId);
console.log("================================")



    if (userRole !== "admin") {
      const ownsCourse =
        await Quiz.courseBelongsToInstructor(
          courseId,
          userId
        );

      if (!ownsCourse) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to create a quiz for this course",
        });
      }
    }

    // ===================================================
    // VALIDATE QUESTIONS
    // ===================================================

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      if (
        !question.prompt ||
        !question.prompt.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} prompt is required`,
        });
      }

      if (
        question.points === undefined ||
        question.points === null ||
        Number(question.points) < 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} must have valid points`,
        });
      }

      // Multiple-choice questions need options.
      if (
        question.questionType ===
          "multiple_choice" ||
        !question.questionType
      ) {
        if (
          !Array.isArray(question.options) ||
          question.options.length < 2
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Question ${i + 1} must have at least 2 options`,
          });
        }

        const correctOptions =
          question.options.filter(
            (option) => option.isCorrect === true
          );

        if (correctOptions.length !== 1) {
          return res.status(400).json({
            success: false,
            message:
              `Question ${i + 1} must have exactly one correct option`,
          });
        }

        for (
          let j = 0;
          j < question.options.length;
          j++
        ) {
          const option = question.options[j];

          if (
            !option.optionKey ||
            !option.optionText ||
            !option.optionText.trim()
          ) {
            return res.status(400).json({
              success: false,
              message:
                `Question ${i + 1}, option ${j + 1} is invalid`,
            });
          }
        }
      }
    }

    // ===================================================
    // NORMALIZE DATA
    // ===================================================

    const normalizedQuestions =
      questions.map((question) => ({
        prompt: question.prompt.trim(),

        questionType:
          question.questionType ||
          "multiple_choice",

        code: question.code || null,

        difficulty:
          question.difficulty || null,

        points: Number(question.points) || 0,

        explanation:
          question.explanation || null,

        options: Array.isArray(question.options)
          ? question.options.map((option) => ({
              optionKey: option.optionKey,
              optionText:
                option.optionText.trim(),
              isCorrect:
                option.isCorrect === true,
            }))
          : [],
      }));

    // ===================================================
    // CREATE QUIZ
    // ===================================================

    const quizId = await Quiz.create({
      courseId: Number(courseId),

      lessonId:
        lessonId !== undefined &&
        lessonId !== null &&
        lessonId !== ""
          ? Number(lessonId)
          : null,

      title: title.trim(),

      description:
        description?.trim() || null,

      timeLimitMinutes:
        timeLimitMinutes !== undefined &&
        timeLimitMinutes !== null &&
        timeLimitMinutes !== ""
          ? Number(timeLimitMinutes)
          : null,

      passPercent:
        passPercent !== undefined &&
        passPercent !== null &&
        passPercent !== ""
          ? Number(passPercent)
          : 0,

      shuffleQuestions:
        Boolean(shuffleQuestions),

      status: status || "draft",

      questions: normalizedQuestions,
    });

    // ===================================================
    // RESPONSE
    // ===================================================

    const createdQuiz =
      await Quiz.findById(quizId);

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: createdQuiz,
    });
  } catch (error) {
    console.error(
      "Create quiz error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create quiz",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// =====================================================
// GET ALL QUIZZES
// GET /api/quizzes
// =====================================================

const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.findAll();

    return res.status(200).json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    console.error(
      "Get all quizzes error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve quizzes",
    });
  }
};

// =====================================================
// GET QUIZ BY ID
// GET /api/quizzes/:id
// =====================================================

const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || Number.isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const quiz =
      await Quiz.findById(Number(id));

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error(
      "Get quiz by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve quiz",
    });
  }
};

// =====================================================
// GET QUIZZES BY COURSE
// GET /api/quizzes/course/:courseId
// =====================================================

const getQuizzesByCourse = async (
  req,
  res
) => {
  try {
    const { courseId } = req.params;

    if (
      !courseId ||
      Number.isNaN(Number(courseId))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const quizzes =
      await Quiz.findByCourseId(
        Number(courseId)
      );

    return res.status(200).json({
      success: true,
      data: quizzes,
    });
  } catch (error) {
    console.error(
      "Get quizzes by course error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve course quizzes",
    });
  }
};

// =====================================================
// UPDATE QUIZ
// PATCH /api/quizzes/:id
// =====================================================

const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      lessonId,
      title,
      description,
      timeLimitMinutes,
      passPercent,
      shuffleQuestions,
      status,
    } = req.body;

    if (
      !id ||
      Number.isNaN(Number(id))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const quizId = Number(id);

    const existingQuiz =
      await Quiz.findById(quizId);

    if (!existingQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (userRole !== "admin") {
      const ownsQuiz =
        await Quiz.belongsToInstructor(
          quizId,
          userId
        );

      if (!ownsQuiz) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to update this quiz",
        });
      }
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Quiz title is required",
      });
    }

    const updated =
      await Quiz.update(quizId, {
        lessonId:
          lessonId !== undefined
            ? Number(lessonId)
            : existingQuiz.lesson_id,

        title: title.trim(),

        description:
          description?.trim() || null,

        timeLimitMinutes:
          timeLimitMinutes !== undefined
            ? Number(timeLimitMinutes)
            : existingQuiz.time_limit_minutes,

        passPercent:
          passPercent !== undefined
            ? Number(passPercent)
            : existingQuiz.pass_percent,

        shuffleQuestions:
          shuffleQuestions !== undefined
            ? Boolean(shuffleQuestions)
            : Boolean(
                existingQuiz.shuffle_questions
              ),

        status:
          status || existingQuiz.status,
      });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "Quiz was not updated",
      });
    }

    const quiz =
      await Quiz.findById(quizId);

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      data: quiz,
    });
  } catch (error) {
    console.error(
      "Update quiz error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update quiz",
    });
  }
};

// =====================================================
// UPDATE QUIZ STATUS
// PATCH /api/quizzes/:id/status
// =====================================================

const updateQuizStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !id ||
      Number.isNaN(Number(id))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const allowedStatuses = [
      "draft",
      "published",
      "archived",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid quiz status",
      });
    }

    const quizId = Number(id);

    const existingQuiz =
      await Quiz.findById(quizId);

    if (!existingQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (userRole !== "admin") {
      const ownsQuiz =
        await Quiz.belongsToInstructor(
          quizId,
          userId
        );

      if (!ownsQuiz) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to change this quiz status",
        });
      }
    }

    await Quiz.updateStatus(
      quizId,
      status
    );

    const quiz =
      await Quiz.findById(quizId);

    return res.status(200).json({
      success: true,
      message:
        "Quiz status updated successfully",
      data: quiz,
    });
  } catch (error) {
    console.error(
      "Update quiz status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update quiz status",
    });
  }
};

// ============================================================
// PUBLISH QUIZ
// PATCH /api/quizzes/:id/publish
// ============================================================

const publishQuiz = async (req, res) => {
  try {
    const quizId = Number(req.params.id);

    if (
      !quizId ||
      Number.isNaN(quizId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const userId = req.user?.id;
    const userRole = req.user?.role;

    // --------------------------------------------------------
    // AUTHORIZATION
    // --------------------------------------------------------

    if (userRole !== "admin") {
      const ownsQuiz =
        await Quiz.belongsToInstructor(
          quizId,
          userId
        );

      if (!ownsQuiz) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to publish this quiz",
        });
      }
    }

    // --------------------------------------------------------
    // ALREADY PUBLISHED
    // --------------------------------------------------------

    if (quiz.status === "published") {
      return res.status(409).json({
        success: false,
        message: "Quiz is already published",
      });
    }

    // --------------------------------------------------------
    // VALIDATE
    // --------------------------------------------------------

    const validation =
      await Quiz.validateForPublishing(
        quizId
      );

    if (!validation.valid) {
      return res.status(422).json({
        success: false,
        message: "Quiz cannot be published",
        errors: validation.errors,
      });
    }

    // --------------------------------------------------------
    // PUBLISH
    // --------------------------------------------------------

    await Quiz.updateStatus(
      quizId,
      "published"
    );

    const publishedQuiz =
      await Quiz.findById(quizId);

    return res.status(200).json({
      success: true,
      message:
        "Quiz published successfully",
      data: publishedQuiz,
    });
  } catch (error) {
    console.error(
      "Publish quiz error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to publish quiz",
    });
  }
};



// =====================================================
// DELETE QUIZ
// DELETE /api/quizzes/:id
// =====================================================

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !id ||
      Number.isNaN(Number(id))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const quizId = Number(id);

    const existingQuiz =
      await Quiz.findById(quizId);

    if (!existingQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (userRole !== "admin") {
      const ownsQuiz =
        await Quiz.belongsToInstructor(
          quizId,
          userId
        );

      if (!ownsQuiz) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to delete this quiz",
        });
      }
    }

    const deleted =
      await Quiz.delete(quizId);

    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: "Quiz was not deleted",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Quiz deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete quiz error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete quiz",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getQuizzesByCourse,
  updateQuiz,
  updateQuizStatus,
  deleteQuiz,
  publishQuiz,
};