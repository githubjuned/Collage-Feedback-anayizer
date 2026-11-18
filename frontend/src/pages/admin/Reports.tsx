import { useState } from "react";
import {
  Building2, CheckCircle2, Download, FileBarChart2, FileText, ListChecks,
  ShieldAlert, FileSpreadsheet
} from "lucide-react";
import { Card, CardHeader, selectCls } from "../../components/ui";
import { exportReport, type ReportKind } from "../../lib/pdf";
import { exportToCsv } from "../../lib/excel";
import { kpis } from "../../lib/metrics";
import { DEPARTMENTS } from "../../types";
import { cn } from "../../utils/cn";
import type { PageProps } from "./AdminLayout";

const REPORTS: { kind: ReportKind; title: string; desc: string; icon: typeof FileText; includes: string[] }[] = [
  { kind: "executive", title: "Executive summary", desc: "Board-ready overview of campus sentiment, categories, departments and urgent issues.", icon: FileBarChart2, includes: ["KPI summary", "Sentiment distribution", "AI insights", "Category & department tables", "Top critical issues"] },
  { kind: "department", title: "Department report", desc: "A focused report for a single department, ready to share with its Head.", icon: Building2, includes: ["Department KPIs", "Sentiment distribution", "Category breakdown", "Top open issues"] },
  { kind: "critical", title: "Critical issues log", desc: "All Critical and High priority tickets sorted by AI urgency score.", icon: ShieldAlert, includes: ["Urgency-ranked log", "Priority & status", "AI summaries"] },
  { kind: "issues", title: "Full issue tracker export", desc: "Every feedback ticket in the selected period as a paginated report table.", icon: ListChecks, includes: ["All tickets", "Department & category", "Status snapshot"] },
];

export default function Reports({ list, periodLabel }: PageProps) {
  const [dept, setDept] = useState<string>(DEPARTMENTS[0]);
  const [busy, setBusy] = useState<ReportKind | null>(null);
  const [done, setDone] = useState<ReportKind | null>(null);
  const k = kpis(list);

  const runPdf = (kind: ReportKind) => {
    setBusy(kind);
    setTimeout(() => {
      exportReport({ kind, department: kind === "department" ? dept : undefined, list: kind === "department" ? list.filter((f) => f.department === dept) : list, periodLabel });
      setBusy(null);
      setDone(kind);
      setTimeout(() => setDone(null), 2500);
    }, 500);
  };

  const runCsv = (kind: ReportKind) => {
    const targetList = kind === "department"
      ? list.filter((f) => f.department === dept)
      : kind === "critical"
      ? list.filter((f) => f.priority === "Critical" || f.priority === "High")
      : list;
    const name = `campuspulse_${kind}_${Date.now()}.csv`;
    exportToCsv(targetList, name);
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-sky-500 p-6 text-white">
          <div>
            <div className="text-sm font-medium text-blue-100">Reporting period</div>
            <div className="text-2xl font-bold">{periodLabel}</div>
            <div className="mt-1 text-sm text-blue-100">{k.total} responses · {k.openCritical} open critical · {k.resolutionRate}% resolved</div>
          </div>
          <FileText className="hidden h-16 w-16 text-white/25 sm:block" />
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        {REPORTS.map((r) => (
          <Card key={r.kind} className="flex flex-col p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100"><r.icon className="h-6 w-6" /></div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{r.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{r.desc}</p>
              </div>
            </div>
            <ul className="mt-5 grid gap-1.5 sm:grid-cols-2">
              {r.includes.map((i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 text-blue-500" />{i}</li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
              {r.kind === "department" && (
                <select className={selectCls} value={dept} onChange={(e) => setDept(e.target.value)}>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => runCsv(r.kind)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 transition shadow-sm"
                  title="Export as CSV/Excel"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel
                </button>
                <button
                  onClick={() => runPdf(r.kind)}
                  disabled={busy !== null}
                  className={cn("flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition", done === r.kind ? "bg-emerald-600 text-white" : "bg-blue-600 text-white shadow-blue-600/30 hover:bg-blue-700", busy && "opacity-70")}
                >
                  {busy === r.kind ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Generating…</> : done === r.kind ? <><CheckCircle2 className="h-4 w-4" /> Downloaded</> : <><Download className="h-4 w-4" /> Download PDF</>}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Scheduled delivery" subtitle="Automatically email reports to leadership (preview)" />
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          {[["Weekly digest", "Mondays 8:00 AM", "Deans & HoDs"], ["Critical alerts", "Instant", "Security & Student Welfare"], ["Monthly board report", "1st of every month", "Vice Chancellor's office"]].map(([t, s, w]) => (
            <div key={t} className="rounded-xl border border-slate-200 p-4">
              <div className="text-sm font-semibold text-slate-900">{t}</div>
              <div className="mt-1 text-xs text-slate-500">{s}</div>
              <div className="mt-3 inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{w}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
