import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL = "https://osta-backend-vuzy.onrender.com/api";

// =====================================================
// LOAD SAVED USER
// =====================================================

function loadSavedUser() {
  const savedUser = localStorage.getItem("osta_user");
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch (error) {
    console.error("Failed to read saved OSTA user:", error);
    localStorage.removeItem("osta_user");
    return null;
  }
}

// =====================================================
// LOAD SAVED TOKEN
// =====================================================

function loadSavedToken() {
  return localStorage.getItem("osta_token") || null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSavedUser);
  const [token, setToken] = useState(loadSavedToken);

  const isAuthenticated = Boolean(user && token);

  useEffect(() => {
    if (user) {
      localStorage.setItem("osta_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("osta_user");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("osta_token", token);
    } else {
      localStorage.removeItem("osta_token");
    }
  }, [token]);

  function clearAuth() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("osta_user");
    localStorage.removeItem("osta_token");
  }

  // =====================================================
  // LOGIN
  // =====================================================

  async function login(email, password) {
    let response;

    try {
      response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });
    } catch (error) {
      console.error("Login connection error:", error);
      throw new Error(
        "Unable to connect to the OSTA server. Make sure the backend is running."
      );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (!data.token || !data.user) {
      throw new Error("Login response is missing user or token.");
    }

    setUser(data.user);
    setToken(data.token);

    localStorage.setItem("osta_user", JSON.stringify(data.user));
    localStorage.setItem("osta_token", data.token);

    return data.user;
  }

  // =====================================================
  // REGISTER
  // =====================================================

  async function register(formData) {
    let response;

    try {
      response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.error("Registration connection error:", error);
      throw new Error(
        "Unable to connect to the OSTA server. Make sure the backend is running."
      );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    if (!data.user) {
      throw new Error("Registration response is missing user.");
    }

    return data.user;
  }

  function updateUser(updatedUser) {
    if (!updatedUser) return;
    setUser(updatedUser);
    localStorage.setItem("osta_user", JSON.stringify(updatedUser));
  }

  function logout() {
    clearAuth();
  }

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
