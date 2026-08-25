const API_BASE_URL =
  "http://localhost:5000/api";

export async function apiRequest(
  endpoint,
  options = {}
) {
  const {
    token:
      providedToken = null,
    method = "GET",
    body,
  } = options;

  // If caller doesn't supply a token,
  // automatically use the currently stored token.

  const token =
    providedToken ||
    localStorage.getItem(
      "osta_token"
    );

  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] =
      "application/json";
  }

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method,
        headers,
        ...(body !== undefined
          ? {
              body: JSON.stringify(
                body
              ),
            }
          : {}),
      }
    );
  } catch (error) {
    console.error(
      "API connection error:",
      error
    );

    throw new Error(
      "Unable to connect to the OSTA server. Make sure the backend is running."
    );
  }

  const data =
    await response
      .json()
      .catch(() => ({}));

  // =====================================================
  // AUTH EXPIRED / INVALID
  // =====================================================

  if (response.status === 401) {
    localStorage.removeItem(
      "osta_token"
    );

    localStorage.removeItem(
      "osta_user"
    );

    window.dispatchEvent(
      new Event("osta-auth-expired")
    );

    throw new Error(
      data.message ||
        "Your session has expired. Please log in again."
    );
  }

  // =====================================================
  // OTHER ERRORS
  // =====================================================

  if (!response.ok) {
    throw new Error(
      data.message ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}