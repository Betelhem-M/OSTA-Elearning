import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// ATTACH JWT TOKEN
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("osta_token") ||
      localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;

      console.log(
        "🔐 Authorization header attached:",
        `${token.substring(0, 20)}...`
      );
    } else {
      console.warn("⚠️ No authentication token found.");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =====================================================
// RESPONSE ERROR HANDLING
// =====================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    if (status === 401) {
      console.error("❌ Authentication required:", data);
    }

    if (status === 403) {
      console.error("❌ Permission denied:", data);
    }

    return Promise.reject(error);
  }
);

export async function apiRequest(endpoint, options = {}) {
  const {
    token: providedToken = null,
    method = "GET",
    body,
    includeAuth = true,
  } = options;

  const token =
    providedToken ||
    (includeAuth
      ? localStorage.getItem("osta_token") ||
        localStorage.getItem("token")
      : null);

  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token && includeAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      method,
      headers,
      ...(body !== undefined
        ? {
            body: JSON.stringify(body),
          }
        : {}),
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.message ||
        `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.response = {
      status: response.status,
      data,
    };

    throw error;
  }

  return data;
}

export default api;