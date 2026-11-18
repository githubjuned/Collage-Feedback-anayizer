import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft, ChevronRight, Columns3, Download, List, Mail, Search, X,
  GraduationCap, Building2, Calendar, FileSpreadsheet, Globe
} from "lucide-react";
import { Avatar, Card, PriorityBadge, SentimentBadge, StatusBadge, Stars, selectCls, timeAgo } from "../../components/ui";
import { AnalysisPanel } from "../../components/AnalysisPanel";
import { useStore } from "../../lib/store";
import { exportReport } from "../../lib/pdf";
import { exportToCsv } from "../../lib/excel";
import { CATEGORIES, DEPARTMENTS, PRIORITIES, STATUSES, type Feedback, type Status } from "../../types";
import { cn } from "../../utils/cn";
import type { PageProps } from "./AdminLayout";

const TEAMS = [
  "Academic Affairs", "Head of Department", "Facilities Team", "Hostel Administration",
  "Mess Committee", "Transport Office", "Library Services", "IT Services",
  "Registrar Office", "Security Office", "Student Affairs"
];
const PAGE = 12;
const priRank = { Critical: 0, High: 1, Medium: 2, Low: 3 };

export default function Issues({ list, periodLabel, onSelectFeedback }: PageProps) {
  const { feedback, updateStatus, updateAssignee } = useStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All" | Status>("All");
  const [priority, setPriority] = useState("All");
  const [category, setCategory] = useState("All");
  const [dept, setDept] = useState("All");
  const [lang, setLang] = useState("All");
  const [sort, setSort] = useState("priority");
  const [view, setView] = useState<"table" | "board">("table");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const base = useMemo(
    () =>
      list.filter((f) => {
        if (priority !== "All" && f.priority !== priority) return false;
        if (category !== "All" && f.category !== category) return false;
        if (dept !== "All" && f.department !== dept) return false;
        if (lang !== "All" && f.language !== lang) return false;
        if (q) {
          const s = q.toLowerCase();
          if (!`${f.id} ${f.text} ${f.summary} ${f.studentName} ${f.keywords.join(" ")}`.toLowerCase().includes(s)) return false;
        }
        return true;
      }),
    [list, q, priority, category, dept, lang],
  );

  const filtered = useMemo(() => {
    const r = base.filter((f) => status === "All" || f.status === status);
    return r.sort((a, b) =>
      sort === "newest"
        ? +new Date(b.createdAt) - +new Date(a.createdAt)
        : sort === "oldest"
        ? +new Date(a.createdAt) - +new Date(b.createdAt)
        : priRank[a.priority] - priRank[b.priority] || b.urgency - a.urgency || +new Date(b.createdAt) - +new Date(a.createdAt),
    );
  }, [base, status, sort]);

  useEffect(() => setPage(1), [q, status, priority, category, dept, lang, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const rows = filtered.slice((page - 1) * PAGE, page * PAGE);
  const selected = openId ? feedback.find((f) => f.id === openId) ?? null : null;
  const count = (s: Status) => base.filter((f) => f.status === s).length;

  const handleRowClick = (f: Feedback) => {
    if (onSelectFeedback) {
      onSelectFeedback(f);
    } else {
      setOpenId(f.id);
    }
  };

  return (
    <div className="space-y-5">
      {/* tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-slate-200/60 p-1">
          {(["All", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-sm font-medium transition",
                status === s ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {s}{" "}
              <span className={cn("ml-1 rounded-full px-1.5 text-xs", status === s ? "bg-blue-100 text-blue-700" : "bg-slate-300/60 text-slate-600")}>
                {s === "All" ? base.length : count(s)}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => setView("table")}
              className={cn("rounded-md p-1.5", view === "table" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600")}
              aria-label="Table view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("board")}
              className={cn("rounded-md p-1.5", view === "board" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600")}
              aria-label="Board view"
            >
              <Columns3 className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => exportToCsv(filtered, `campuspulse_issues_${Date.now()}.csv`)}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Excel
          </button>
          <button
            onClick={() => exportReport({ kind: "issues", list: filtered, periodLabel })}
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700"
          >
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* filters */}
      <Card className="flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by ID, keyword, student…"
            className={cn(selectCls, "w-full pl-9")}
          />
        </div>
        <select className={selectCls} value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="All">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className={selectCls} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All categories</option>
          {CATEGORIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className={selectCls} value={dept} onChange={(e) => setDept(e.target.value)}>
          <option value="All">All departments</option>
          {DEPARTMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className={selectCls} value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="All">All languages</option>
          <option value="en">English (EN)</option>
          <option value="hi">हिंदी (Hindi)</option>
          <option value="mr">मराठी (Marathi)</option>
        </select>
        <select className={selectCls} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="priority">Sort: Priority</option>
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
        </select>
      </Card>

      {view === "table" ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold">Issue Details</th>
                  <th className="px-3 py-3 font-semibold">Language</th>
                  <th className="px-3 py-3 font-semibold">Category</th>
                  <th className="px-3 py-3 font-semibold">Sentiment</th>
                  <th className="px-3 py-3 font-semibold">Priority</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Assigned Owner</th>
                  <th className="px-5 py-3 text-right font-semibold">Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((f) => (
                  <tr
                    key={f.id}
                    onClick={() => handleRowClick(f)}
                    className="cursor-pointer transition hover:bg-blue-50/40"
                  >
                    <td className="max-w-md px-5 py-3.5">
                      <div className="flex items-start gap-3">
                        <Avatar name={f.studentName} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-slate-400">{f.id}</span>
                            <span className="text-xs text-slate-400">· {f.department}</span>
                            {f.isDemo && (
                              <span className="rounded bg-amber-50 px-1.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">
                                Demo
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 line-clamp-2 text-slate-800">{f.summary}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {f.language ? f.language.toUpperCase() : "EN"}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{f.category}</span>
                    </td>
                    <td className="px-3 py-3.5"><SentimentBadge value={f.sentiment} /></td>
                    <td className="px-3 py-3.5"><PriorityBadge value={f.priority} /></td>
                    <td className="px-3 py-3.5"><StatusBadge value={f.status} /></td>
                    <td className="px-3 py-3.5 text-xs text-slate-500">{f.assignee}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-right text-xs text-slate-400">{timeAgo(f.createdAt)}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-16 text-center text-slate-500">No issues match your current filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
            <span>Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE + 1}–{Math.min(page * PAGE, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
              <span className="px-2 text-xs">Page {page} / {pages}</span>
              <button disabled={page === pages} onClick={() => setPage(page + 1)} className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {STATUSES.map((s) => {
            const items = base.filter((f) => f.status === s).sort((a, b) => priRank[a.priority] - priRank[b.priority] || +new Date(b.createdAt) - +new Date(a.createdAt));
            return (
              <div key={s} className="rounded-2xl bg-slate-100/70 p-3">
                <div className="mb-3 flex items-center justify-between px-1.5">
                  <StatusBadge value={s} />
                  <span className="text-xs font-semibold text-slate-500">{items.length}</span>
                </div>
                <div className="max-h-[640px] space-y-2.5 overflow-y-auto pr-1">
                  {items.slice(0, 20).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleRowClick(f)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-slate-400">{f.id}</span>
                        <PriorityBadge value={f.priority} />
                      </div>
                      <p className="mt-2 line-clamp-3 text-sm text-slate-700">{f.summary}</p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span className="rounded-md bg-blue-50 px-1.5 py-0.5 font-medium text-blue-700">{f.category}</span>
                        <span>{timeAgo(f.createdAt)}</span>
                      </div>
                    </button>
                  ))}
                  {items.length === 0 && <div className="p-6 text-center text-xs text-slate-400">Nothing here</div>}
                  {items.length > 20 && <div className="p-2 text-center text-xs text-slate-400">+ {items.length - 20} more — use filters</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* fallback drawer if onSelectFeedback not wired */}
      {!onSelectFeedback && selected && (
        <Drawer
          f={selected}
          onClose={() => setOpenId(null)}
          onStatus={(st) => updateStatus(selected.id, st)}
          onAssign={(a) => updateAssignee(selected.id, a)}
        />
      )}
    </div>
  );
}

function Drawer({ f, onClose, onStatus, onAssign }: { f: Feedback; onClose: () => void; onStatus: (s: Status) => void; onAssign: (a: string) => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  const teams = TEAMS.includes(f.assignee) ? TEAMS : [f.assignee, ...TEAMS];
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-xl animate-slide-in flex-col bg-slate-50 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-blue-700">{f.id}</span>
              <PriorityBadge value={f.priority} />
            </div>
            <div className="mt-0.5 text-xs text-slate-500">Submitted {new Date(f.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Avatar name={f.studentName} className="h-10 w-10" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-slate-900">{f.studentName}</div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{f.department}</span>
                  <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />Year {f.year}</span>
                  {f.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{f.email}</span>}
                </div>
              </div>
              <Stars value={f.rating} size={14} />
            </div>
            <blockquote className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">“{f.text}”</blockquote>
          </Card>

          <Card className="p-5">
            <div className="mb-3 text-sm font-semibold text-slate-900">Ticket management</div>
            <div className="mb-1.5 text-xs font-medium text-slate-500">Status</div>
            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => onStatus(s)}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-xs font-semibold transition",
                    f.status === s ? "border-blue-600 bg-blue-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mb-1.5 mt-4 text-xs font-medium text-slate-500">Assigned to</div>
            <select className={cn(selectCls, "w-full")} value={f.assignee} onChange={(e) => onAssign(e.target.value)}>
              {teams.map((t) => <option key={t}>{t}</option>)}
            </select>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><Calendar className="h-3.5 w-3.5" /> {f.sla}</div>
          </Card>

          <AnalysisPanel a={f} />
        </div>
      </aside>
    </div>
  );
}
