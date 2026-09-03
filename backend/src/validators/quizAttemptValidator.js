const {
  body,
  param,
  validationResult,
} = require("express-validator");

// ============================================================
// HANDLE VALIDATION
// ============================================================

const handleValidation = (
  req,
  res,
  next
) => {
  const errors =
    validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message:
        "Validation failed",
      errors:
        errors.array().map(
          (error) => ({
            field:
              error.path,
            message:
              error.msg,
          })
        ),
    });
  }

  next();
};

// ============================================================
// QUIZ ID
// ============================================================

const quizIdValidator = [
  param("quizId")
    .isInt({ min: 1 })
    .withMessage(
      "Quiz ID must be a positive integer"
    ),

  handleValidation,
];

// ============================================================
// ATTEMPT ID
// ============================================================

const attemptIdValidator = [
  param("attemptId")
    .isInt({ min: 1 })
    .withMessage(
      "Attempt ID must be a positive integer"
    ),

  handleValidation,
];

// ============================================================
// SAVE ANSWER
// ============================================================

const saveAnswerValidator = [
  param("attemptId")
    .isInt({ min: 1 })
    .withMessage(
      "Attempt ID must be a positive integer"
    ),

  body("questionId")
    .isInt({ min: 1 })
    .withMessage(
      "Question ID must be a positive integer"
    ),

  body("selectedOptionId")
    .isInt({ min: 1 })
    .withMessage(
      "Selected option ID must be a positive integer"
    ),

  handleValidation,
];

module.exports = {
  quizIdValidator,
  attemptIdValidator,
  saveAnswerValidator,
};