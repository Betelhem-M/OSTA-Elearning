import api from "./api";
// ============================================================
// GET ALL QUIZZES
// ============================================================

export const getQuizzes = async () => {
  const response = await api.get("/quizzes");

  return response.data;
};

// ============================================================
// GET QUIZ
// ============================================================

export const getQuizById = async (quizId) => {
  const response = await api.get(
    `/quizzes/${quizId}`
  );

  return response.data;
};

// ============================================================
// GET COURSE QUIZZES
// ============================================================

export const getQuizzesByCourse = async (
  courseId
) => {
  const response = await api.get(
    `/quizzes/course/${courseId}`
  );

  return response.data;
};

// ============================================================
// CREATE QUIZ
// ============================================================

export const createQuiz = async (quizData) => {
  const response = await api.post(
    "/quizzes",
    quizData
  );

  return response.data;
};

// ============================================================
// UPDATE QUIZ
// ============================================================

export const updateQuiz = async (
  quizId,
  quizData
) => {
  const response = await api.patch(
    `/quizzes/${quizId}`,
    quizData
  );

  return response.data;
};

// ============================================================
// PUBLISH QUIZ
// ============================================================

export const publishQuiz = async (
  quizId
) => {
  const response = await api.patch(
    `/quizzes/${quizId}/publish`
  );

  return response.data;
};

// ============================================================
// UPDATE STATUS
// ============================================================

export const updateQuizStatus = async (
  quizId,
  status
) => {
  const response = await api.patch(
    `/quizzes/${quizId}/status`,
    { status }
  );

  return response.data;
};

// ============================================================
// DELETE QUIZ
// ============================================================

export const deleteQuiz = async (
  quizId
) => {
  const response = await api.delete(
    `/quizzes/${quizId}`
  );

  return response.data;
};

export default {
  getQuizzes,
  getQuizById,
  getQuizzesByCourse,
  createQuiz,
  updateQuiz,
  publishQuiz,
  updateQuizStatus,
  deleteQuiz,
};