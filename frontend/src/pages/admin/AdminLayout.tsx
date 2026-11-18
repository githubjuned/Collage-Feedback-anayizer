import { useMemo, useState, type ReactNode } from "react";
import {
  BarChart3, Building2, ChevronDown, ClipboardList, FileText, LayoutDashboard,
  LogOut, Menu, MessageSquarePlus, RotateCcw, X, Download, Shield, Sparkles,
  Database, Trash2, FileSpreadsheet, User as UserIcon
} from "lucide-react";
import { Avatar, Logo, selectCls } from "../../components/ui";
import { cn } from "../../utils/cn";
import { useStore, type DemoFilter } from "../../lib/store";
import { useAuth } from "../../lib/auth";
import { exportReport } from "../../lib/pdf";
import { exportToCsv } from "../../lib/excel";
import { IssueDetailDrawer } from "../../components/IssueDetailDrawer";
import Overview from "./Overview";
import Issues from "./Issues";
import Analytics from "./Analytics";
import Departments from "./Departments";
import Reports from "./Reports";
import type { Feedback } from "../../types";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, title: "Overview", sub: "Real-time pulse of student sentiment across campus" },
  { to: "/admin/issues", label: "Issue Tracker", icon: ClipboardList, title: "Issue Tracker", sub: "Triage, assign and resolve student-reported issues" },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, title: "Analytics", sub: "Trends, topics and emotion across all feedback" },
  { to: "/admin/departments", label: "Departments", icon: Building2, title: "Department Reports", sub: "Benchmark sentiment and resolution by department" },
  { to: "/admin/reports", label: "Reports & Export", icon: FileText, title: "Reports & Export", sub: "Generate board-ready PDF & Excel reports" },
];

export const PERIODS = [
  { id: "30", label: "Last 30 days", days: 30 },
  { id: "60", label: "Last 60 days", days: 60 },
  { id: "all", label: "Last 12 weeks", days: 84 },
];

export interface PageProps {
  list: Feedback[];
  all: Feedback[];
  periodLabel: string;
  onSelectFeedback?: (f: Feedback) => void;
}

export default function AdminLayout({ route, onOpenAuth }: { route: string; onOpenAuth?: () => void }) {
  const { feedback, filteredFeedback, demoFilter, setDemoFilter, reset, clearDemo, isOnline } = useStore();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const p = PERIODS.find((x) => x.id === period)!;
  const list = useMemo(() => {
    return filteredFeedback.filter((f) => Date.now() - +new Date(f.createdAt) <= p.days * 86400000);
  }, [filteredFeedback, p.days]);

  const criticalOpen = filteredFeedback.filter((f) => f.priority === "Critical" && f.status !== "Resolved").length;
  const realCount = feedback.filter((f) => !f.isDemo).length;
  const demoCount = feedback.filter((f) => f.isDemo).length;

  const current = NAV.find((n) => n.to === route) ?? NAV[0];
  const props: PageProps = {
    list,
    all: filteredFeedback,
    periodLabel: p.label,
    onSelectFeedback: (f: Feedback) => setSelectedFeedback(f),
  };

  let page: ReactNode;
  switch (route) {
    case "/admin/issues": page = <Issues {...props} />; break;
    case "/admin/analytics": page = <Analytics {...props} />; break;
    case "/admin/departments": page = <Departments {...props} />; break;
    case "/admin/reports": page = <Reports {...props} />; break;
    default: page = <Overview {...props} />;
  }

  const Sidebar = (
    <div className="flex h-full flex-col bg-slate-950 text-slate-300">
      <div className="flex h-16 items-center justify-between px-5 border-b border-white/5">
        <a href="#/"><Logo dark /></a>
        <button className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 lg:hidden" onClick={() => setOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-3 pt-4">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Workspace</div>
        <nav className="space-y-1">
          {NAV.map((n) => {
            const active = route === n.to || (n.to === "/admin" && route === "/admin/");
            return (
              <a
                key={n.to}
                href={`#${n.to}`}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <n.icon className="h-[18px] w-[18px]" />
                {n.label}
                {n.to === "/admin/issues" && criticalOpen > 0 && (
                  <span className={cn("ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold", active ? "bg-white/20 text-white" : "bg-rose-500 text-white")}>
                    {criticalOpen}
                  </span>
                )}
              </a>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-3 p-4 border-t border-white/5">
        <a
          href="#/feedback"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
        >
          <MessageSquarePlus className="h-4 w-4 text-sky-400" /> Student feedback portal
        </a>

        {/* AI & DB Status */}
        <div className="rounded-xl bg-gradient-to-br from-blue-950/70 to-slate-900 p-3.5 ring-1 ring-white/10">
          <div className="flex items-center justify-between text-xs font-semibold text-white">
            <span>AI NLP Engine</span>
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-mono", isOnline ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300")}>
              {isOnline ? "FastAPI Live" : "Browser NLP"}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", isOnline ? "bg-emerald-400" : "bg-amber-400")} />
              <span className={cn("relative inline-flex h-2 w-2 rounded-full", isOnline ? "bg-emerald-400" : "bg-amber-400")} />
            </span>
            <span>English, Hindi & Marathi AI</span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2 text-[11px]">
            <button
              onClick={() => {
                if (confirm("Reset to clean multilingual demo dataset?")) reset();
              }}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition"
              title="Re-seed demo feedback"
            >
              <RotateCcw className="h-3 w-3" /> Reset demo
            </button>
            <button
              onClick={() => {
                if (confirm("Remove all demo feedback and keep ONLY real student submissions?")) clearDemo();
              }}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-400 transition"
              title="Delete demo feedback"
            >
              <Trash2 className="h-3 w-3" /> Clear demo
            </button>
          </div>
        </div>

        {/* Current User */}
        <div className="flex items-center gap-3 pt-2">
          <Avatar
            name={user ? user.fullName : "Elena Marsh"}
            className="bg-blue-600 text-white font-bold"
          />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-sm font-semibold text-white">
              {user ? user.fullName : "Dr. Elena Marsh"}
            </div>
            <div className="truncate text-xs text-slate-400">
              {user ? (user.role === "admin" ? "Dean, Student Affairs" : "Student") : "Dean, Student Affairs"}
            </div>
          </div>
          {isAuthenticated ? (
            <button
              onClick={logout}
              aria-label="Sign Out"
              title="Sign Out"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              title="Sign in with specific credentials"
              className="rounded-lg p-1.5 text-blue-400 hover:bg-white/10 hover:text-white text-xs font-semibold"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{Sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-slide-in">{Sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top Header */}
        <header className="glass sticky top-0 z-20 border-b border-slate-200/70">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold text-slate-900">{current.title}</h1>
              <p className="hidden truncate text-xs text-slate-500 sm:block">{current.sub}</p>
            </div>

            {/* Demo vs Real Filter Pills */}
            <div className="hidden md:flex items-center gap-1 rounded-xl bg-slate-200/60 p-1 text-xs font-semibold">
              <button
                onClick={() => setDemoFilter("all")}
                className={cn(
                  "rounded-lg px-2.5 py-1 transition",
                  demoFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                All Data ({feedback.length})
              </button>
              <button
                onClick={() => setDemoFilter("real")}
                className={cn(
                  "rounded-lg px-2.5 py-1 transition",
                  demoFilter === "real" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                Real Feedback ({realCount})
              </button>
              <button
                onClick={() => setDemoFilter("demo")}
                className={cn(
                  "rounded-lg px-2.5 py-1 transition",
                  demoFilter === "demo" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                Demo Data ({demoCount})
              </button>
            </div>

            {/* Period select */}
            <div className="relative hidden sm:block">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className={cn(selectCls, "appearance-none pr-8 font-medium")}
              >
                {PERIODS.map((x) => (
                  <option key={x.id} value={x.id}>{x.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
            </div>

            {/* Quick Export Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToCsv(list, `campuspulse_export_${p.id}.csv`)}
                title="Download as Excel CSV"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition shadow-sm"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span className="hidden sm:inline">Excel</span>
              </button>
              <button
                onClick={() => exportReport({ kind: "executive", list, periodLabel: p.label })}
                title="Download Executive PDF"
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
          {page}
        </main>
      </div>

      {/* Slide-over Ticket Detail Drawer */}
      <IssueDetailDrawer
        feedback={selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
      />
    </div>
  );
}
