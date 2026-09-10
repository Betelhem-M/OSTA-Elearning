import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://osta-elearning-backend-production.up.railway.app/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("osta_token") || localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) console.error("Authentication failed:", error.response.data);
    if (error.response?.status === 403) console.error("Permission denied:", error.response.data);
    return Promise.reject(error);
  }
);

export default api;
