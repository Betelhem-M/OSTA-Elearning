const API_BASE_URL =
  "http://localhost:5000/api";

export async function apiRequest(
  endpoint,
  options = {}
) {
  const {
    token: providedToken = null,
    method = "GET",
    body,
    includeAuth = true,
  } = options;

  const token =
    providedToken ||
    (includeAuth
      ? localStorage.getItem("osta_token")
      : null);

  const headers = {};

  if (body !== undefined) {
    headers["Content-Type"] =
      "application/json";
  }

  if (token && includeAuth) {
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
  // AUTHENTICATION FAILURE
  // =====================================================

  if (response.status === 401) {
    const message =
      data.message ||
      "Authentication required.";

    /*
     * Do NOT automatically delete the stored
     * authentication session here.
     *
     * A 401 can come from a single request that
     * failed while the rest of the session is still
     * valid. The application should decide when to
     * actually log the user out.
     */

    const authError =
      new Error(message);

    authError.status = 401;
    authError.code = "AUTH_REQUIRED";

    throw authError;
  }

  // =====================================================
  // FORBIDDEN
  // =====================================================

  if (response.status === 403) {
    const error =
      new Error(
        data.message ||
          "You do not have permission to perform this action."
      );

    error.status = 403;
    error.code = "FORBIDDEN";

    throw error;
  }

  // =====================================================
  // OTHER ERRORS
  // =====================================================

  if (!response.ok) {
    const error =
      new Error(
        data.message ||
          `Request failed with status ${response.status}`
      );

    error.status =
      response.status;

    throw error;
  }

  return data;
}