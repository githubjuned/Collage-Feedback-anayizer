import { useState } from "react";
import { Lock, Mail, User as UserIcon, Shield, Sparkles, X, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "../lib/auth";
import { Logo } from "./ui";
import { DEPARTMENTS, type Department } from "../types";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { login, register, quickLogin } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"admin" | "student">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState<Department>("Computer Science");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === "login") {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.error || "Invalid email or password");
        }
      } else {
        const res = await register({
          email,
          pass: password,
          fullName,
          role,
          department,
        });
        if (res.success) {
          onClose();
        } else {
          setError(res.error || "Registration failed");
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (targetRole: "admin" | "student") => {
    setLoading(true);
    setError(null);
    try {
      await quickLogin(targetRole);
      onClose();
    } catch {
      setError("Quick login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-fade-up sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 flex flex-col items-center text-center">
          <Logo />
          <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
            {tab === "login" ? "Sign In to CampusPulse" : "Create an Account"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Access real-time sentiment telemetry and AI response triage.
          </p>
        </div>

        {/* Quick 1-click test buttons */}
        <div className="mb-5 rounded-2xl bg-blue-50/70 p-3 ring-1 ring-blue-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Demo Quick Access:
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuick("admin")}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-white px-2.5 py-2 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-600 hover:text-white"
            >
              <Shield className="h-3.5 w-3.5" /> Dean / Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuick("student")}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-800 hover:text-white"
            >
              <UserIcon className="h-3.5 w-3.5" /> Student Login
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="mb-5 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => { setTab("login"); setError(null); }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${tab === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab("register"); setError(null); }}
            className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition ${tab === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "register" && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700">Full Name</label>
                <div className="relative mt-1">
                  <UserIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kumar or Rohan Sen"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Role</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`rounded-xl border py-2 text-xs font-semibold transition ${role === "admin" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Administrator
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`rounded-xl border py-2 text-xs font-semibold transition ${role === "student" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Student
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700">Email Address</label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@campuspulse.edu"
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">Password</label>
            <div className="relative mt-1">
              <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {tab === "login" ? "Sign In" : "Complete Registration"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
