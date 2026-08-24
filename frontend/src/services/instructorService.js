import { apiRequest } from "./api";

export async function getInstructorDashboard(token) {
  return apiRequest("/instructor/dashboard", {
    token,
  });
}