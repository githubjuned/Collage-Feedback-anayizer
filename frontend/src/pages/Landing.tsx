import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, BarChart3, Bell, Brain, Building2, CheckCircle2, ClipboardList, FileDown, LayoutDashboard, MessageSquareText,
  Menu, ShieldAlert, ShieldCheck, Sparkles, Tags, X, Zap, Star, TrendingUp, AlertTriangle, User, LogOut, Globe
} from "lucide-react";
import { Logo } from "../components/ui";
import { AnalysisPanel } from "../components/AnalysisPanel";
import { apiAnalyzeLive } from "../lib/api";
import { useAuth } from "../lib/auth";
import { cn } from "../utils/cn";
import type { Analysis, Language } from "../types";

const SAMPLES_BY_LANG: Record<Language, string[]> = {
  en: [
    "Ragging incidents are being ignored by the hostel authorities. Students are scared to complain.",
    "Wi-Fi in the hostel has been down for two weeks and nobody responds to our complaints.",
    "Prof. Mehta explains complex topics so clearly. Her doubt-clearing sessions are really helpful!",
    "Could we have the exam timetable shared a week earlier? It would help us plan.",
  ],
  hi: [
    "हॉस्टल के पास कुछ छात्र देर रात तक रैगिंग करते हैं। हम डरे हुए हैं और सुरक्षा गार्ड कुछ नहीं कर रहे।",
    "मेस के खाने में कीड़े निकले हैं और कई छात्र बीमार पड़ गए हैं। तुरंत रसोई का निरीक्षण किया जाए।",
    "कंप्यूटर साइंस विभाग के प्रोफेसर बहुत अच्छा पढ़ाते हैं और प्रैक्टिकल में पूरा सहयोग करते हैं। धन्यवाद।",
    "गर्मी में क्लासरूम के पंखे खराब हैं और पीने के पानी का कूलर पिछले एक महीने से बंद पड़ा है।",
  ],
  mr: [
    "वसतिगृहात गेल्या आठवड्यापासून पिण्याच्या पाण्याची तीव्र टंचाई आहे आणि स्वच्छतागृहांमध्ये पाणी नाही.",
    "मेसमधील जेवण अत्यंत निकृष्ट दर्जाचे असून अनेक विद्यार्थ्यांना उलट्या आणि त्रास झाला आहे.",
    "प्राध्यापक देशपांडे यांचे व्याख्यान अतिशय उत्तम आणि माहितीपूर्ण असते. सर्व संकल्पना स्पष्ट होतात.",
    "कॉलेजच्या मुख्य प्रवेशद्वाराजवळ रात्रीच्या वेळी पथदिवे बंद असतात, अत्यंत असुरक्षित वाटते.",
  ],
};

const FEATURES = [
  { icon: Brain, title: "Multilingual AI Sentiment", body: "Understand tone, emotion and intensity across English, Hindi (हिंदी) and Marathi (मराठी) with explainable confidence scores." },
  { icon: Tags, title: "Complaint Categorization", body: "Auto-route feedback to Academics, Hostel, Canteen, IT, Safety and more — zero manual triage." },
  { icon: ShieldAlert, title: "Priority & Safety Detection", body: "Safety risks, repeated issues and urgent language surface as Critical within seconds with 4-hr SLA." },
  { icon: LayoutDashboard, title: "Admin Command Center", body: "A real-time dashboard with KPIs, trends and AI-written insights for deans and staff." },
  { icon: Building2, title: "Department Reports", body: "Benchmark every department's sentiment index, resolution rate and top recurring issue." },
  { icon: ClipboardList, title: "Issue Tracking", body: "Assign owners, move tickets from Open to Resolved and keep SLAs visible to everyone." },
  { icon: BarChart3, title: "Interactive Analytics", body: "Drill into trends, keyword clouds, emotion mix and category heat — with a click." },
  { icon: FileDown, title: "PDF & Excel Exports", body: "Board-ready executive summaries, department audits, and UTF-8 Excel sheets generated instantly." },
];

const STEPS = [
  { n: "01", title: "Students share feedback", body: "A friendly 60-second form in English, Hindi, or Marathi — named or anonymous, from any device." },
  { n: "02", title: "AI reads and understands", body: "Sentiment, domain category, emotion and urgency are classified and explained in real time." },
  { n: "03", title: "Teams act and close the loop", body: "Tickets are routed to the right owner with a suggested action, SLA commitment, and audit trail." },
];

export default function Landing({ onOpenAuth }: { onOpenAuth?: () => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const [text, setText] = useState(SAMPLES_BY_LANG["en"][0]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    let active = true;
    if (text.trim().length > 4) {
      setAnalyzing(true);
      const timer = setTimeout(async () => {
        try {
          const res = await apiAnalyzeLive(text);
          if (active) setAnalysis(res);
        } catch {
          // handled
        } finally {
          if (active) setAnalyzing(false);
        }
      }, 300);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    } else {
      setAnalysis(null);
    }
  }, [text]);

  const links = [
    ["Features", "#features"],
    ["How it works", "#how"],
    ["Live demo", "#demo"],
    ["Testimonials", "#proof"],
  ];

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-white">
      {/* NAV */}
      <header className="glass sticky top-0 z-40 border-b border-slate-200/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <a href="#/"><Logo /></a>
          <nav className="hidden items-center gap-8 md:flex">
            {links.map(([l, h]) => (
              <a key={l} href={h} onClick={go(h)} className="text-sm font-medium text-slate-600 transition hover:text-blue-600">{l}</a>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-blue-600" />
                  {user?.fullName.split(" ")[0]} ({user?.role})
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
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenAuth}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Sign In
                </button>
                <a
                  href="#/signup"
                  className="rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  Sign Up
                </a>
              </div>
            )}
            <a href="#/admin" className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700">Admin dashboard</a>
            <a href="#/feedback" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700">Submit feedback</a>
          </div>
          <button className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
            {links.map(([l, h]) => (
              <a key={l} href={h} onClick={go(h)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">{l}</a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <a href="#/admin" className="rounded-lg border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-slate-700">Dashboard</a>
              <a href="#/feedback" className="rounded-lg bg-blue-600 px-3 py-2.5 text-center text-sm font-semibold text-white">Feedback</a>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-white">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -right-24 top-40 h-96 w-96 rounded-full bg-sky-300/25 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-28 lg:pt-24">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 py-1 pl-1 pr-3 text-xs font-medium text-slate-600 shadow-sm">
              <span className="rounded-full bg-blue-600 px-2 py-0.5 font-semibold text-white">Multilingual AI</span>
              Supports English, Hindi (हिंदी) & Marathi (मराठी)
              <ArrowRight className="h-3 w-3 text-blue-600" />
            </div>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem]">
              Hear every student.
              <span className="block bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 bg-clip-text text-transparent">Fix what matters first.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              CampusPulse AI reads, categorizes, and prioritizes campus feedback in real time. Safety hazards and critical grievances reach department heads in seconds — not next semester.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#/feedback" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition hover:bg-blue-700">
                Submit feedback <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#/admin" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700">
                <LayoutDashboard className="h-4 w-4 text-blue-600" /> Explore admin dashboard
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> 100% Anonymous option</span>
              <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-blue-500" /> Live AI sentiment scoring</span>
              <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-indigo-500" /> EN · HI · MR</span>
            </div>
          </div>

          {/* mockup */}
          <div className="relative animate-fade-up [animation-delay:150ms]">
            <div className="relative rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-blue-900/10">
              <div className="mb-3 flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-300" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <div className="ml-3 h-5 flex-1 rounded-md bg-slate-100 text-center text-[10px] leading-5 text-slate-400">app.campuspulse.ai/admin</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[["Total Feedback", "1,284", "+12%"], ["Sentiment Index", "68/100", "+4 pts"], ["Resolved Rate", "87%", "+9%"]].map(([l, v, d]) => (
                  <div key={l} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{l}</div>
                    <div className="mt-1 text-lg font-bold text-slate-900">{v}</div>
                    <div className="text-[11px] font-medium text-emerald-600">{d}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-slate-100 p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Sentiment trend</span>
                  <span className="text-slate-400">12 weeks</span>
                </div>
                <svg viewBox="0 0 400 110" className="w-full">
                  <defs>
                    <linearGradient id="hg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity=".35" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient>
                  </defs>
                  {[20, 50, 80].map((y) => <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="3 4" />)}
                  <path d="M0 80 C40 70 60 85 100 62 S160 50 200 56 260 30 300 38 360 14 400 18 V110 H0Z" fill="url(#hg)" />
                  <path d="M0 80 C40 70 60 85 100 62 S160 50 200 56 260 30 300 38 360 14 400 18" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
                  <path d="M0 98 C50 92 90 96 140 88 S230 84 280 78 360 70 400 66" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
                </svg>
              </div>
              <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-4 rounded-xl border border-slate-100 p-3">
                <div className="relative h-20 w-20 rounded-full" style={{ background: "conic-gradient(#10b981 0 52%, #94a3b8 52% 66%, #f43f5e 66% 100%)" }}>
                  <div className="absolute inset-[11px] flex items-center justify-center rounded-full bg-white text-xs font-bold text-slate-800">52%</div>
                </div>
                <div className="space-y-1.5 text-xs">
                  {[["Positive", "bg-emerald-500", "52%"], ["Neutral", "bg-slate-400", "14%"], ["Negative", "bg-rose-500", "34%"]].map(([n, c, p]) => (
                    <div key={n} className="flex items-center gap-2"><span className={cn("h-2 w-2 rounded-full", c)} /><span className="text-slate-600">{n}</span><span className="ml-auto font-semibold text-slate-800">{p}</span></div>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -left-6 top-24 hidden animate-float rounded-2xl border border-rose-100 bg-white p-3 shadow-xl sm:block">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600"><AlertTriangle className="h-5 w-5" /></div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Critical issue detected</div>
                  <div className="text-[11px] text-slate-500">Safety · Hostel Block B · 2m ago</div>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 bottom-10 hidden animate-float rounded-2xl border border-blue-100 bg-white p-3 shadow-xl [animation-delay:2s] sm:block">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600"><Sparkles className="h-5 w-5" /></div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">AI categorized 38 reports</div>
                  <div className="text-[11px] text-slate-500">Routed to 6 teams automatically</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Trusted by forward-looking institutions</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-lg font-bold tracking-tight text-slate-400">
            {["Northbridge University", "St. Aurelia College", "Techvalley Institute", "Meridian Polytechnic", "Crestwood Univ."].map((n) => (
              <span key={n} className="flex items-center gap-2"><Building2 className="h-5 w-5" />{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold uppercase tracking-wider text-blue-600">Platform</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need to turn feedback into action</h2>
          <p className="mt-4 text-slate-600">From the first student comment to the final board report, CampusPulse automates the heavy lifting of listening at scale.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 text-blue-600 ring-1 ring-blue-100 transition group-hover:from-blue-600 group-hover:to-blue-500 group-hover:text-white">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="bg-slate-950 py-20 text-white lg:py-28">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-sm font-semibold uppercase tracking-wider text-sky-400">How it works</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">From student voice to resolved ticket in three steps</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-7">
                <div className="bg-gradient-to-br from-blue-400 to-sky-300 bg-clip-text text-4xl font-black text-transparent">{s.n}</div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
                {i < 2 && <ArrowRight className="absolute -right-5 top-1/2 hidden h-6 w-6 text-blue-500 md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEMO WITH MULTILINGUAL TABS */}
      <section id="demo" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold uppercase tracking-wider text-blue-600">Live AI Analyzer</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Try the NLP engine in any language</h2>
          <p className="mt-4 text-slate-600">Test with English, Hindi (हिंदी), or Marathi (मराठी). The AI evaluates tone, urgency, domain category, and target SLA instantly.</p>
          
          {/* Language Picker */}
          <div className="mt-6 inline-flex rounded-2xl bg-slate-100 p-1.5">
            {[
              { code: "en", label: "English" },
              { code: "hi", label: "हिंदी (Hindi)" },
              { code: "mr", label: "मराठी (Marathi)" }
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code as Language);
                  setText(SAMPLES_BY_LANG[l.code as Language][0]);
                }}
                className={cn(
                  "rounded-xl px-4 py-1.5 text-xs font-semibold transition",
                  lang === l.code ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-800">
              <span className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-blue-600" /> Student feedback text
              </span>
              <span className="text-xs font-normal text-slate-400">
                {lang.toUpperCase()} · {text.length} chars
              </span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Type any student feedback or complaint..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-sm leading-relaxed text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            <div className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Quick test prompts ({lang.toUpperCase()}):
            </div>
            <div className="mt-2 flex flex-col gap-2">
              {SAMPLES_BY_LANG[lang].map((s) => (
                <button
                  key={s}
                  onClick={() => setText(s)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-left text-xs leading-snug transition",
                    text === s ? "border-blue-300 bg-blue-50 text-blue-800 font-medium" : "border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-slate-50"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <AnalysisPanel a={analysis} loading={analyzing} />
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 text-center sm:px-6 md:grid-cols-4">
          {[[Zap, "< 2s", "Time to analyze a response"], [ShieldCheck, "100%", "Anonymous option for students"], [TrendingUp, "+31%", "Avg. rise in satisfaction in 2 terms"], [Bell, "4 hrs", "Critical-issue response SLA"]].map(([I, v, l]) => {
            const Icon = I as typeof Zap;
            return (
              <div key={l as string}>
                <Icon className="mx-auto h-6 w-6 text-sky-200" />
                <div className="mt-3 text-4xl font-extrabold">{v as string}</div>
                <div className="mt-1 text-sm text-blue-100">{l as string}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PROOF */}
      <section id="proof" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold uppercase tracking-wider text-blue-600">Loved by campus teams</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Leaders who finally see the full picture</h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            ["We used to read feedback in spreadsheets once a semester. Now a safety complaint reaches our Security Office within minutes.", "Dr. Elena Marsh", "Dean of Student Affairs, Northbridge University"],
            ["The department scorecards changed our review meetings. Everyone sees the same data and the same top issue.", "Prof. Rajiv Anand", "Head of Mechanical Engineering"],
            ["The PDF reports are board-ready. What took our team three days now takes a single click.", "Sarah Okafor", "Registrar, St. Aurelia College"],
          ].map(([q, n, r]) => (
            <figure key={n} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex gap-0.5 text-amber-400">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <blockquote className="mt-4 text-sm leading-relaxed text-slate-700">“{q}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-sky-400 text-sm font-bold text-white">{n.split(" ").slice(-2).map((p) => p[0]).join("")}</div>
                <div><div className="text-sm font-semibold text-slate-900">{n}</div><div className="text-xs text-slate-500">{r}</div></div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-slate-950 px-6 py-14 text-center text-white sm:px-12">
          <div className="absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-blue-600/40 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to hear your campus clearly?</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">Submit feedback as a student, or open the admin dashboard to explore a fully populated demo workspace.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a href="#/feedback" className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500">Submit feedback</a>
              <a href="#/admin" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-blue-50">
                <CheckCircle2 className="h-4 w-4 text-blue-600" /> Open dashboard
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row">
          <Logo />
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} CampusPulse AI · Intelligent College Feedback Analyzer · Privacy-first by design</p>
          <div className="flex gap-5 text-xs font-medium text-slate-500">
            <a href="#features" onClick={go("#features")} className="hover:text-blue-600">Features</a>
            <a href="#/feedback" className="hover:text-blue-600">Feedback</a>
            <a href="#/admin" className="hover:text-blue-600">Dashboard</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
