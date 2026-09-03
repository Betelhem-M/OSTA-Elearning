import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000/api";

// =====================================================
// LOAD SAVED USER
// =====================================================

function loadSavedUser() {
  const savedUser =
    localStorage.getItem("osta_user");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch (error) {
    console.error(
      "Failed to read saved OSTA user:",
      error
    );

    localStorage.removeItem(
      "osta_user"
    );

    return null;
  }
}

// =====================================================
// LOAD SAVED TOKEN
// =====================================================

function loadSavedToken() {
  return (
    localStorage.getItem(
      "osta_token"
    ) || null
  );
}

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(loadSavedUser);

  const [token, setToken] =
    useState(loadSavedToken);

  const isAuthenticated =
    Boolean(user && token);

  // =====================================================
  // PERSIST USER
  // =====================================================

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "osta_user",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem(
        "osta_user"
      );
    }
  }, [user]);

  // =====================================================
  // PERSIST TOKEN
  // =====================================================

  useEffect(() => {
    if (token) {
      localStorage.setItem(
        "osta_token",
        token
      );
    } else {
      localStorage.removeItem(
        "osta_token"
      );
    }
  }, [token]);

  // =====================================================
  // CLEAR AUTHENTICATION
  // ONLY USED WHEN USER LOGS OUT
  // =====================================================

  function clearAuth() {
    setUser(null);
    setToken(null);

    localStorage.removeItem(
      "osta_user"
    );

    localStorage.removeItem(
      "osta_token"
    );
  }

  // =====================================================
  // LOGIN
  // =====================================================

  async function login(
    email,
    password
  ) {
    let response;

    try {
      response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              email.trim(),
            password,
          }),
        }
      );
    } catch (error) {
      console.error(
        "Login connection error:",
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

    // =================================================
    // LOGIN ERROR
    // =================================================

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Login failed"
      );
    }

    // =================================================
    // VALIDATE RESPONSE
    // =================================================

    if (
      !data.token ||
      !data.user
    ) {
      throw new Error(
        "Login response is missing user or token."
      );
    }

    // =================================================
    // UPDATE STATE
    // =================================================

    setUser(data.user);
    setToken(data.token);

    // =================================================
    // PERSIST IMMEDIATELY
    // =================================================

    localStorage.setItem(
      "osta_user",
      JSON.stringify(
        data.user
      )
    );

    localStorage.setItem(
      "osta_token",
      data.token
    );

    return data.user;
  }

  // =====================================================
  // REGISTER
  // =====================================================

  async function register(
    formData
  ) {
    let response;

    try {
      response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            formData
          ),
        }
      );
    } catch (error) {
      console.error(
        "Registration connection error:",
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

    // =================================================
    // REGISTRATION ERROR
    // =================================================

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Registration failed"
      );
    }

    // =================================================
    // VALIDATE RESPONSE
    // =================================================

    if (!data.user) { throw new Error("Registration response is missing user."); }
    return data.user;
  }

  // =====================================================
  // UPDATE CURRENT USER
  // =====================================================

  function updateUser(
    updatedUser
  ) {
    if (!updatedUser) {
      return;
    }

    setUser(updatedUser);

    localStorage.setItem(
      "osta_user",
      JSON.stringify(
        updatedUser
      )
    );
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  function logout() {
    clearAuth();
  }

  // =====================================================
  // CONTEXT
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateUser,

        token,
        setToken,

        login,
        register,
        logout,

        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// USE AUTH
// =====================================================

export function useAuth() {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}