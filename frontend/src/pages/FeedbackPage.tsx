import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, CheckCircle2, EyeOff, Loader2, LayoutDashboard, Lock, Send,
  Sparkles, Wand2, Globe, User, LogOut, Check
} from "lucide-react";
import { Logo, PriorityBadge, SentimentBadge } from "../components/ui";
import { AnalysisPanel } from "../components/AnalysisPanel";
import { apiAnalyzeLive } from "../lib/api";
import { useStore } from "../lib/store";
import { useAuth } from "../lib/auth";
import { LANGUAGES, SAMPLE_PROMPTS, UI_STRINGS } from "../lib/i18n";
import { DEPARTMENTS, type Department, type Feedback, type Language, type Analysis } from "../types";
import { cn } from "../utils/cn";

const field =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

const STEPS = [
  "Reading feedback & detecting language",
  "Evaluating sentiment & emotional tone",
  "Categorizing campus domain",
  "Scoring urgency & safety priority",
  "Assigning SLA & routing to team",
];

export default function FeedbackPage({ onOpenAuth }: { onOpenAuth?: () => void }) {
  const { addFeedback } = useStore();
  const { user, isAuthenticated, logout } = useAuth();

  const [lang, setLang] = useState<Language>("en");
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [department, setDepartment] = useState<Department>((user?.department as Department) || "Computer Science");
  const [year, setYear] = useState(2);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"form" | "analyzing" | "done">("form");
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<Feedback | null>(null);
  const [live, setLive] = useState<Analysis | null>(null);
  const [isLiveAnalyzing, setIsLiveAnalyzing] = useState(false);

  const t = UI_STRINGS[lang];

  useEffect(() => {
    if (user && !name) {
      setName(user.fullName);
      setEmail(user.email);
      if (user.department) setDepartment(user.department as Department);
    }
  }, [user]);

  // Debounced live NLP analysis
  useEffect(() => {
    let active = true;
    if (text.trim().length >= 10) {
      setIsLiveAnalyzing(true);
      const timer = setTimeout(async () => {
        try {
          const res = await apiAnalyzeLive(text, rating || undefined);
          if (active) setLive(res);
        } catch {
          // fallback handled
        } finally {
          if (active) setIsLiveAnalyzing(false);
        }
      }, 350);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    } else {
      setLive(null);
    }
  }, [text, rating]);

  useEffect(() => {
    if (phase !== "analyzing") return;
    const interval = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 400);
    return () => clearInterval(interval);
  }, [phase]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!anonymous && !name.trim()) err.name = "Please enter your name or choose anonymous.";
    if (email && !/^\S+@\S+\.\S+$/.test(email)) err.email = "Enter a valid email address.";
    if (!rating) err.rating = "Please rate your overall experience.";
    if (text.trim().length < 15) err.text = "Please write at least 15 characters so our AI can accurately classify the issue.";
    setErrors(err);
    if (Object.keys(err).length) return;

    setPhase("analyzing");
    setStep(0);

    try {
      const fb = await addFeedback({
        studentName: name.trim(),
        anonymous,
        email: email.trim() || undefined,
        department,
        year,
        rating,
        text: text.trim(),
      });
      setTimeout(() => {
        setResult(fb);
        setPhase("done");
      }, 2000);
    } catch {
      setPhase("form");
      alert("Submission error. Please try again.");
    }
  };

  const reset = () => {
    setText("");
    setRating(0);
    setErrors({});
    setResult(null);
    setPhase("form");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/70 via-white to-slate-50">
      <header className="glass sticky top-0 z-30 border-b border-slate-200/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#/"><Logo /></a>
          <div className="flex items-center gap-3">
            <a href="#/" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:flex">
              <ArrowLeft className="h-4 w-4" /> Home
            </a>
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  {user?.fullName}
                </span>
                <button
                  onClick={logout}
                  className="rounded-lg p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hidden sm:inline-flex rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Sign In
              </button>
            )}
            <a href="#/admin" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">
              <LayoutDashboard className="h-4 w-4" /> Admin
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {phase === "done" && result ? (
          <div className="mx-auto max-w-3xl animate-fade-up">
            <div className="mb-6 rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h1 className="mt-5 text-2xl font-bold text-slate-900">Thank you — your feedback is recorded!</h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Our AI has triaged your submission and automatically routed it to{" "}
                <span className="font-semibold text-slate-800">{result.suggestedOwner}</span>.
              </p>
              <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-slate-50 px-5 py-3 border border-slate-100">
                <span className="font-mono text-lg font-bold text-blue-700">{result.id}</span>
                <span className="h-5 w-px bg-slate-200" />
                <SentimentBadge value={result.sentiment} />
                <PriorityBadge value={result.priority} />
                <span className="text-xs font-medium text-slate-600">{result.sla}</span>
              </div>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={reset}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700"
                >
                  Submit another feedback
                </button>
                <a
                  href="#/admin/issues"
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                >
                  View in issue tracker
                </a>
              </div>
            </div>
            <AnalysisPanel a={result} />
          </div>
        ) : (
          <>
            {/* Header + Language Switcher */}
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  <Sparkles className="h-3.5 w-3.5" /> Takes about 60 seconds
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {t.formTitle}
                </h1>
                <p className="mt-2 text-slate-600">
                  {t.formSubtitle}
                </p>
              </div>

              {/* Language Selector Pills */}
              <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
                <Globe className="ml-2 h-4 w-4 text-slate-400" />
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
                      lang === l.code
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {l.flag} {l.nativeLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <form onSubmit={submit} noValidate className="relative space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                {phase === "analyzing" && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-3xl bg-white/95 p-6 backdrop-blur-sm">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white animate-pulse-ring">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                    <p className="mt-5 font-semibold text-slate-900">CampusPulse AI is analysing…</p>
                    <ul className="mt-4 space-y-2">
                      {STEPS.map((s, i) => (
                        <li key={s} className={cn("flex items-center gap-2 text-sm transition", i < step ? "text-emerald-600 font-medium" : i === step ? "font-semibold text-blue-700" : "text-slate-300")}>
                          {i < step ? <CheckCircle2 className="h-4 w-4" /> : i === step ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="h-4 w-4 rounded-full border border-slate-200" />}
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Anonymity toggle */}
                <button
                  type="button"
                  onClick={() => setAnonymous(!anonymous)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition",
                    anonymous ? "border-blue-300 bg-blue-50/70" : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", anonymous ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500")}>
                    <EyeOff className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-900">Submit anonymously</div>
                    <div className="text-xs text-slate-500">{t.anonymousNotice}</div>
                  </div>
                  <div className={cn("relative h-6 w-11 rounded-full transition", anonymous ? "bg-blue-600" : "bg-slate-300")}>
                    <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", anonymous ? "left-[22px]" : "left-0.5")} />
                  </div>
                </button>

                {!anonymous && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.nameLabel}</label>
                      <input
                        className={cn(field, errors.name && "border-rose-300")}
                        placeholder="e.g. Priya Nair / अमित कुमार"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        {t.emailLabel} <span className="text-slate-400">(optional)</span>
                      </label>
                      <input
                        className={cn(field, errors.email && "border-rose-300")}
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.departmentLabel}</label>
                    <select
                      className={field}
                      value={department}
                      onChange={(e) => setDepartment(e.target.value as Department)}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.yearLabel}</label>
                    <select
                      className={field}
                      value={year}
                      onChange={(e) => setYear(+e.target.value)}
                    >
                      {[1, 2, 3, 4].map((y) => (
                        <option key={y} value={y}>Year {y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">{t.ratingLabel}</label>
                  <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        onMouseEnter={() => setHover(i)}
                        onClick={() => setRating(i)}
                        aria-label={`${i} stars`}
                        className="rounded p-0.5 transition hover:scale-110"
                      >
                        <svg
                          width="34"
                          height="34"
                          viewBox="0 0 24 24"
                          className={i <= (hover || rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
                        >
                          <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.1L12 17.6 5.7 21.3l1.7-7.1L2 9.5l7.1-.6L12 2z" fill="currentColor" />
                        </svg>
                      </button>
                    ))}
                    <span className="ml-3 text-sm text-slate-500 font-medium">
                      {["", "Very poor", "Poor", "Okay", "Good", "Excellent"][hover || rating]}
                    </span>
                  </div>
                  {errors.rating && <p className="mt-1 text-xs text-rose-600">{errors.rating}</p>}
                </div>

                {/* Text area */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">{t.feedbackLabel}</label>
                    <span className={cn("text-xs font-medium", text.trim().length >= 15 ? "text-emerald-600" : "text-slate-400")}>
                      {text.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    className={cn(field, "resize-none leading-relaxed", errors.text && "border-rose-300")}
                    placeholder={t.feedbackPlaceholder}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  {errors.text && <p className="mt-1 text-xs text-rose-600">{errors.text}</p>}

                  {/* Sample prompt quick buttons */}
                  <div className="mt-3">
                    <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                      <Wand2 className="h-3.5 w-3.5 text-blue-500" /> {t.samplesHeading}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_PROMPTS[lang].map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setText(p)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs text-slate-600 transition truncate max-w-xs",
                            text === p
                              ? "border-blue-400 bg-blue-50 text-blue-700 font-semibold"
                              : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                          )}
                        >
                          "{p.slice(0, 42)}..."
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.99]"
                >
                  <Send className="h-4 w-4" /> {t.submitBtn}
                </button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <Lock className="h-3.5 w-3.5" /> End-to-end encrypted and routed according to institutional policy.
                </p>
              </form>

              {/* Live Preview Panel */}
              <div className="lg:sticky lg:top-24">
                <AnalysisPanel a={live} empty={!live} loading={isLiveAnalyzing} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
