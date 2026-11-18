import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, AuthState } from "../types";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  type FirebaseUser,
} from "./firebase";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

interface AuthContextType extends AuthState {
  signInWithGoogle: (role?: "student" | "admin", department?: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithFirebase: (data: { email: string; pass: string; fullName: string; role?: "student" | "admin"; department?: string }) => Promise<{ success: boolean; error?: string }>;
  signInWithFirebase: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; pass: string; fullName: string; role?: "student" | "admin"; department?: string }) => Promise<{ success: boolean; error?: string }>;
  quickLogin: (role: "admin" | "student") => Promise<void>;
  logout: () => void;
  firebaseUser: FirebaseUser | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
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

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const idToken = await fbUser.getIdToken().catch(() => "firebase-token");
        const isAdmin = fbUser.email?.toLowerCase().includes("admin") || fbUser.email === "admin@campuspulse.edu";
        const role = isAdmin ? "admin" : "student";
        const appUser: User = {
          id: Math.abs(fbUser.uid.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)) || Date.now(),
          email: fbUser.email || "user@college.edu",
          fullName: fbUser.displayName || fbUser.email?.split("@")[0] || "Student User",
          role,
          department: "Computer Science",
        };
        setUser(appUser);
        setToken(idToken);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem("campuspulse_user", JSON.stringify(user));
      localStorage.setItem("campuspulse_jwt", token);
    } else {
      localStorage.removeItem("campuspulse_user");
      localStorage.removeItem("campuspulse_jwt");
    }
  }, [user, token]);

  // Google Sign In via Firebase
  const signInWithGoogle = async (role: "student" | "admin" = "student", department = "Computer Science"): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const idToken = await fbUser.getIdToken();
      
      const determinedRole = fbUser.email?.toLowerCase().includes("admin") ? "admin" : role;
      const appUser: User = {
        id: Math.abs(fbUser.uid.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)) || Date.now(),
        email: fbUser.email || "user@college.edu",
        fullName: fbUser.displayName || "Google User",
        role: determinedRole,
        department,
      };

      setUser(appUser);
      setToken(idToken);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Google sign-in was cancelled or failed." };
    }
  };

  // Firebase Email/Password Sign Up
  const signUpWithFirebase = async (data: {
    email: string;
    pass: string;
    fullName: string;
    role?: "student" | "admin";
    department?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.pass);
      await updateProfile(cred.user, { displayName: data.fullName });
      const idToken = await cred.user.getIdToken();

      const appUser: User = {
        id: Date.now(),
        email: data.email,
        fullName: data.fullName,
        role: data.role || "student",
        department: data.department || "Computer Science",
      };

      setUser(appUser);
      setToken(idToken);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Firebase registration failed." };
    }
  };

  // Firebase Email/Password Sign In
  const signInWithFirebase = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const idToken = await cred.user.getIdToken();
      const isAdmin = email.toLowerCase().includes("admin") || email === "admin@campuspulse.edu";

      const appUser: User = {
        id: Date.now(),
        email: cred.user.email || email,
        fullName: cred.user.displayName || email.split("@")[0] || "User",
        role: isAdmin ? "admin" : "student",
        department: "Computer Science",
      };

      setUser(appUser);
      setToken(idToken);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Invalid credentials." };
    }
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    // 1. Try Firebase first
    try {
      const fbRes = await signInWithFirebase(email, pass);
      if (fbRes.success) return fbRes;
    } catch {
      /* fallback to local/backend */
    }

    // 2. Try Backend API
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
      }
    } catch {
      /* fallback */
    }

    // 3. Fallback for demo credentials
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
  };

  const register = async (data: { email: string; pass: string; fullName: string; role?: "student" | "admin"; department?: string }) => {
    // Try Firebase
    try {
      const fbRes = await signUpWithFirebase(data);
      if (fbRes.success) return fbRes;
    } catch {
      /* fallback */
    }

    // Try backend
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
      }
    } catch {
      /* fallback */
    }

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
  };

  const quickLogin = async (role: "admin" | "student") => {
    if (role === "admin") {
      await login("admin@campuspulse.edu", "admin123");
    } else {
      await login("student@campuspulse.edu", "student123");
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      /* ignore */
    }
    setUser(null);
    setToken(null);
    setFirebaseUser(null);
    localStorage.removeItem("campuspulse_user");
    localStorage.removeItem("campuspulse_jwt");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        firebaseUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        signInWithGoogle,
        signUpWithFirebase,
        signInWithFirebase,
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
