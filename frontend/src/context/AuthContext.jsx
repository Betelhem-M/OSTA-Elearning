import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || "https://osta-elearning-backend-production.up.railway.app/api";

function loadSavedUser() {
  const savedUser = localStorage.getItem("osta_user");
  if (!savedUser) return null;
  try { return JSON.parse(savedUser); }
  catch (error) { console.error("Failed to read saved OSTA user:", error); localStorage.removeItem("osta_user"); return null; }
}
function loadSavedToken() { return localStorage.getItem("osta_token") || null; }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSavedUser);
  const [token, setToken] = useState(loadSavedToken);
  const isAuthenticated = Boolean(user && token);

  useEffect(() => {
    if (user) localStorage.setItem("osta_user", JSON.stringify(user));
    else localStorage.removeItem("osta_user");
  }, [user]);
  useEffect(() => {
    if (token) localStorage.setItem("osta_token", token);
    else localStorage.removeItem("osta_token");
  }, [token]);

  function clearAuth() {
    setUser(null); setToken(null);
    localStorage.removeItem("osta_user");
    localStorage.removeItem("osta_token");
    localStorage.removeItem("token");
  }

  async function login(email, password) {
    let response;
    try {
      response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
    } catch (error) {
      console.error("Login connection error:", error);
      throw new Error("Unable to connect to the OSTA server. Please try again.");
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Invalid email or password");
    if (!data.token || !data.user) throw new Error("Login response is missing user or token.");
    setUser(data.user); setToken(data.token);
    localStorage.setItem("osta_user", JSON.stringify(data.user));
    localStorage.setItem("osta_token", data.token);
    localStorage.removeItem("token");
    return data.user;
  }

  async function loginWithToken(oauthToken) {
    if (!oauthToken) throw new Error("OAuth login token is missing.");
    let response;
    try {
      response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${oauthToken}` },
      });
    } catch (error) {
      console.error("OAuth connection error:", error);
      throw new Error("Unable to connect to the OSTA server. Please try again.");
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.user) throw new Error(data.message || "Social sign-in could not be completed.");
    setUser(data.user);
    setToken(oauthToken);
    localStorage.setItem("osta_user", JSON.stringify(data.user));
    localStorage.setItem("osta_token", oauthToken);
    localStorage.removeItem("token");
    return data.user;
  }

  async function register(formData) {
    const multipart = formData instanceof FormData;
    let response;
    try {
      response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: multipart ? {} : { "Content-Type": "application/json" },
        body: multipart ? formData : JSON.stringify(formData),
      });
    } catch (error) {
      console.error("Registration connection error:", error);
      throw new Error("Unable to connect to the OSTA server. Please try again.");
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Registration failed");
    if (data.instructorRequest) return data;
    if (!data.user) throw new Error("Registration response is missing user.");
    if (data.token) { setToken(data.token); localStorage.setItem("osta_token", data.token); }
    setUser(data.user);
    localStorage.setItem("osta_user", JSON.stringify(data.user));
    return data;
  }

  function updateUser(updatedUser) {
    if (!updatedUser) return;
    setUser(updatedUser);
    localStorage.setItem("osta_user", JSON.stringify(updatedUser));
  }
  function logout() { clearAuth(); }

  return <AuthContext.Provider value={{ user, setUser, updateUser, token, setToken, login, loginWithToken, register, logout, isAuthenticated }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
