import api from "./api";

export const startQuizAttempt = async (quizId) => {
  if (!quizId) {
    throw new Error("Quiz ID is required.");
  }

  return api.post(`/quizzes/${quizId}/attempts`);
};

export const getQuizAttempt = async (attemptId) => {
  if (!attemptId) {
    throw new Error("Attempt ID is required.");
  }

  return api.get(`/quiz-attempts/${attemptId}`);
};

export const saveQuizAnswer = async (
  attemptId,
  questionId,
  selectedOptionId
) => {
  if (!attemptId || !questionId || !selectedOptionId) {
    throw new Error(
      "Attempt ID, question ID and selected option ID are required."
    );
  }

  return api.put(
    `/quiz-attempts/${attemptId}/answers`,
    {
      questionId,
      selectedOptionId,
    }
  );
};

export const submitQuizAttempt = async (attemptId) => {
  if (!attemptId) {
    throw new Error("Attempt ID is required.");
  }

  return api.post(
    `/quiz-attempts/${attemptId}/submit`
  );
};

export const getMyQuizAttempts = async (quizId) => {
  if (!quizId) {
    throw new Error("Quiz ID is required.");
  }

  return api.get(
    `/quizzes/${quizId}/attempts/me`
  );
};

export const getQuizAttempts = async (quizId) => {
  if (!quizId) {
    throw new Error("Quiz ID is required.");
  }

  return api.get(`/quizzes/${quizId}/attempts`);
};

export default {
  startQuizAttempt,
  getQuizAttempt,
  saveQuizAnswer,
  submitQuizAttempt,
  getMyQuizAttempts,
  getQuizAttempts,
};