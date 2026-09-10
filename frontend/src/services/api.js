import axios from "axios";

// Production frontend API. VITE_API_URL can override this when intentionally configured.
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL || "https://osta-elearning-backend-production.up.railway.app/api").replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

function getToken() {
  return localStorage.getItem("osta_token") || localStorage.getItem("token");
}

api.interceptors.request.use(
  (config) => {
    const token = getToken();
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
    if (error?.response?.status === 401) console.warn("Authentication required for API request.");
    return Promise.reject(error);
  }
);

export async function apiRequest(endpoint, options = {}) {
  const { token: providedToken = null, method = "GET", body, includeAuth = true } = options;
  const token = providedToken || (includeAuth ? getToken() : null);
  const headers = {};

  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token && includeAuth) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    credentials: "include",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.response = { status: response.status, data };
    throw error;
  }
  return data;
}

export default api;
