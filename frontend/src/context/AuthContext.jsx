import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = logged out

  const login = email => {
    // No real backend yet — this simulates a successful sign-in,
    // matching the vanilla login.js behavior of redirecting to the dashboard.
    setUser({ email, name: email.split('@')[0], role: 'student' });
  };

  const register = formData => {
    setUser({
      email: formData.email,
      name: formData.firstName,
      role: formData.accountType?.toLowerCase() || 'student',
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
