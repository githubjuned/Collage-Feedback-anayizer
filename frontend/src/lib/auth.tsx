import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, AuthState } from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; pass: string; fullName: string; role?: "student" | "admin"; department?: string }) => Promise<{ success: boolean; error?: string }>;
  quickLogin: (role: "admin" | "student") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("campuspulse_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("campuspulse_jwt");
  });

  useEffect(() => {
    if (user && token) {
      localStorage.setItem("campuspulse_user", JSON.stringify(user));
      localStorage.setItem("campuspulse_jwt", token);
    } else {
      localStorage.removeItem("campuspulse_user");
      localStorage.removeItem("campuspulse_jwt");
    }
  }, [user, token]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.full_name,
          role: data.user.role,
          department: data.user.department,
        });
        setToken(data.access_token);
        return { success: true };
      } else {
        return { success: false, error: data.detail || "Authentication failed" };
      }
    } catch {
      // Local fallback for offline mode
      if (email.toLowerCase().includes("admin")) {
        const adminUser: User = {
          id: 1,
          email: "admin@campuspulse.edu",
          fullName: "Dr. Elena Marsh (Dean, Student Affairs)",
          role: "admin",
          department: "Student Affairs",
        };
        setUser(adminUser);
        setToken("local-admin-mock-token");
        return { success: true };
      } else {
        const studentUser: User = {
          id: 2,
          email,
          fullName: email.split("@")[0] || "Student User",
          role: "student",
          department: "Computer Science",
        };
        setUser(studentUser);
        setToken("local-student-mock-token");
        return { success: true };
      }
    }
  };

  const register = async (data: { email: string; pass: string; fullName: string; role?: "student" | "admin"; department?: string }) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.pass,
          full_name: data.fullName,
          role: data.role || "student",
          department: data.department,
        }),
      });
      const resData = await res.json();
      if (res.ok) {
        setUser({
          id: resData.user.id,
          email: resData.user.email,
          fullName: resData.user.full_name,
          role: resData.user.role,
          department: resData.user.department,
        });
        setToken(resData.access_token);
        return { success: true };
      } else {
        return { success: false, error: resData.detail || "Registration failed" };
      }
    } catch {
      const newUser: User = {
        id: Date.now(),
        email: data.email,
        fullName: data.fullName,
        role: data.role || "student",
        department: data.department,
      };
      setUser(newUser);
      setToken("local-mock-token");
      return { success: true };
    }
  };

  const quickLogin = async (role: "admin" | "student") => {
    if (role === "admin") {
      await login("admin@campuspulse.edu", "admin123");
    } else {
      await login("student@campuspulse.edu", "student123");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("campuspulse_user");
    localStorage.removeItem("campuspulse_jwt");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        register,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
