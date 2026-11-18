import { useState } from "react";
import {
  Lock, Mail, User, Shield, ArrowRight, Loader2, CheckCircle2,
  Sparkles, ArrowLeft, Building2, Globe
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { Logo } from "../components/ui";
import { DEPARTMENTS, type Department } from "../types";

export default function SignupPage() {
  const { signUpWithFirebase, signInWithGoogle, isAuthenticated, user, logout } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "admin">("student");
  const [department, setDepartment] = useState<Department>("Computer Science");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await signUpWithFirebase({
        email,
        pass: password,
        fullName,
        role,
        department,
      });
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Signup failed. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const res = await signInWithGoogle(role, department);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Google authentication was cancelled or failed.");
      }
    } catch (err: any) {
      setError(err?.message || "Google signup error.");
    } finally {
      setGoogleLoading(false);
    }
  };

  if (isAuthenticated && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/70 via-white to-slate-50 flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl animate-fade-up">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
            <User className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Already Signed In</h2>
          <p className="mt-1 text-sm text-slate-500">
            You are signed in as <span className="font-semibold text-slate-800">{user?.fullName}</span> ({user?.email})
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <a
              href={user?.role === "admin" ? "#/admin" : "#/feedback"}
              className="rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition"
            >
              {user?.role === "admin" ? "Go to Admin Dashboard" : "Go to Feedback Portal"}
            </a>
            <button
              onClick={logout}
              className="rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 via-white to-slate-50 flex flex-col">
      {/* Header */}
      <header className="glass sticky top-0 z-30 border-b border-slate-200/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#/"><Logo /></a>
          <a
            href="#/"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          {success ? (
            <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-2xl animate-fade-up">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Account Created!</h1>
              <p className="mt-2 text-sm text-slate-500">
                Welcome to CampusPulse AI. Your profile has been authenticated via Firebase.
              </p>
              <div className="mt-6 flex flex-col gap-2.5">
                <a
                  href="#/feedback"
                  className="rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 transition"
                >
                  Submit Student Feedback
                </a>
                <a
                  href="#/admin"
                  className="rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Explore Admin Dashboard
                </a>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl animate-fade-up">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
                  <Sparkles className="h-3.5 w-3.5" /> Firebase Authentication
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Create Your Account
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  Sign up with Google or enter your institutional email.
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                <span>Sign up with Google</span>
              </button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 font-medium text-slate-400">or sign up with email</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Full Name</label>
                  <div className="relative mt-1">
                    <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Priya Nair / Dr. Rajesh Kumar"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">Account Type</label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={`rounded-xl border py-2 text-xs font-semibold transition ${role === "student" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("admin")}
                      className={`rounded-xl border py-2 text-xs font-semibold transition ${role === "admin" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      Administrator
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

                <div>
                  <label className="block text-xs font-medium text-slate-700">Institutional Email</label>
                  <div className="relative mt-1">
                    <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@university.edu"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700">Create Password</label>
                  <div className="relative mt-1">
                    <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Complete Sign Up</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-500">
                Already have an account?{" "}
                <a href="#/login" className="font-semibold text-blue-600 hover:text-blue-700">
                  Sign in here
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
