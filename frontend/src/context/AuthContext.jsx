import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000/api";

function loadSavedUser() {
  const savedUser =
    localStorage.getItem("osta_user");

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem("osta_user");
    return null;
  }
}

function loadSavedToken() {
  const savedToken =
    localStorage.getItem("osta_token");

  return savedToken || null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSavedUser);
  const [token, setToken] = useState(loadSavedToken);

  const isAuthenticated =
    Boolean(user && token);

  // =====================================================
  // SAVE USER
  // =====================================================

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "osta_user",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem("osta_user");
    }
  }, [user]);

  // =====================================================
  // SAVE TOKEN
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
  // CLEAR AUTH
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
  // LISTEN FOR EXPIRED TOKEN
  // =====================================================

  useEffect(() => {
    function handleAuthExpired() {
      clearAuth();
    }

    window.addEventListener(
      "osta-auth-expired",
      handleAuthExpired
    );

    return () => {
      window.removeEventListener(
        "osta-auth-expired",
        handleAuthExpired
      );
    };
  }, []);

  // =====================================================
  // LOGIN
  // =====================================================

  async function login(email, password) {
    const response = await fetch(
      `${API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      }
    );

    const data =
      await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Login failed"
      );
    }

    if (!data.token || !data.user) {
      throw new Error(
        "Login response is missing user or token."
      );
    }

    setUser(data.user);
    setToken(data.token);

    // Write immediately instead of waiting
    // for React effects.

    localStorage.setItem(
      "osta_user",
      JSON.stringify(data.user)
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

  async function register(formData) {
    const response = await fetch(
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

    const data =
      await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Registration failed"
      );
    }

    if (!data.token || !data.user) {
      throw new Error(
        "Registration response is missing user or token."
      );
    }

    setUser(data.user);
    setToken(data.token);

    localStorage.setItem(
      "osta_user",
      JSON.stringify(data.user)
    );

    localStorage.setItem(
      "osta_token",
      data.token
    );

    return data.user;
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  function logout() {
    clearAuth();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
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

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}