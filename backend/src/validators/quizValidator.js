const { body, param, validationResult } = require("express-validator");

// ============================================================
// VALIDATION RESULT HANDLER
// ============================================================

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

// ============================================================
// QUIZ ID
// ============================================================

const quizIdValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Quiz ID must be a positive integer"),

  handleValidation,
];

// ============================================================
// CREATE QUIZ
// ============================================================

const createQuizValidator = [
  body("courseId")
    .isInt({ min: 1 })
    .withMessage("Course ID must be a positive integer"),

  body("lessonId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Lesson ID must be a positive integer"),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Quiz title is required")
    .isLength({ max: 255 })
    .withMessage("Quiz title cannot exceed 255 characters"),

  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("Description must be text"),

  body("timeLimitMinutes")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Time limit must be a positive integer"),

  body("passPercent")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Passing score must be between 0 and 100"),

  body("shuffleQuestions")
    .optional()
    .isBoolean()
    .withMessage("shuffleQuestions must be true or false"),

  body("questions")
    .isArray({ min: 1 })
    .withMessage("At least one question is required"),

  body("questions.*.prompt")
    .trim()
    .notEmpty()
    .withMessage("Question prompt is required"),

  body("questions.*.questionType")
    .optional()
    .isIn(["multiple_choice"])
    .withMessage("Unsupported question type"),

  body("questions.*.points")
    .isFloat({ gt: 0 })
    .withMessage("Question points must be greater than 0"),

  body("questions.*.difficulty")
    .optional()
    .isIn(["Easy", "Medium", "Hard"])
    .withMessage("Difficulty must be Easy, Medium, or Hard"),

  body("questions.*.options")
    .isArray({ min: 2 })
    .withMessage("Multiple-choice questions require at least 2 options"),

  body("questions.*.options.*.optionKey")
    .trim()
    .notEmpty()
    .withMessage("Option key is required"),

  body("questions.*.options.*.optionText")
    .trim()
    .notEmpty()
    .withMessage("Option text is required"),

  body("questions.*.options.*.isCorrect")
    .isBoolean()
    .withMessage("isCorrect must be true or false"),

  handleValidation,
];

// ============================================================
// UPDATE QUIZ
// ============================================================

const updateQuizValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Quiz ID must be a positive integer"),

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Quiz title cannot be empty")
    .isLength({ max: 255 })
    .withMessage("Quiz title cannot exceed 255 characters"),

  body("description")
    .optional({ nullable: true })
    .isString()
    .withMessage("Description must be text"),

  body("lessonId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Lesson ID must be a positive integer"),

  body("timeLimitMinutes")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Time limit must be a positive integer"),

  body("passPercent")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Passing score must be between 0 and 100"),

  body("shuffleQuestions")
    .optional()
    .isBoolean()
    .withMessage("shuffleQuestions must be true or false"),

  handleValidation,
];

// ============================================================
// STATUS
// ============================================================

const updateStatusValidator = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Quiz ID must be a positive integer"),

  body("status")
    .isIn(["draft", "published", "archived"])
    .withMessage(
      "Status must be draft, published, or archived"
    ),

  handleValidation,
];

module.exports = {
  handleValidation,
  quizIdValidator,
  createQuizValidator,
  updateQuizValidator,
  updateStatusValidator,
};