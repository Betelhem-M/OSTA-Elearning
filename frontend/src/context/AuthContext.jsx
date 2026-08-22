import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = logged out

  const login = (email) => {
    // No real backend yet — simulate a successful sign-in. Role is inferred
    // from the email prefix purely so instructor/admin routes are reachable
    // for testing; a real backend would return the actual role.
    let role = "student";
    if (email.startsWith("instructor@")) role = "instructor";
    if (email.startsWith("admin@")) role = "admin";

    const nextUser = { email, name: email.split("@")[0], role };
    setUser(nextUser);
    return nextUser;
  };

  const register = (formData) => {
    // Dynamically processes accountType while formatting text keys matching app roles
    const role = formData.accountType?.toLowerCase() || "student";
    const nextUser = { email: formData.email, name: formData.firstName, role };
    setUser(nextUser);
    return nextUser;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
