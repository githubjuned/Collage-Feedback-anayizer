import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertOctagon, FileDown, Trophy, FileSpreadsheet } from "lucide-react";
import { Card, CardHeader, ChartTooltip, PriorityBadge, StatusBadge, timeAgo } from "../../components/ui";
import { COLORS, byCategory, byDepartment } from "../../lib/metrics";
import { exportReport } from "../../lib/pdf";
import { exportToCsv } from "../../lib/excel";
import { cn } from "../../utils/cn";
import type { PageProps } from "./AdminLayout";

const tone = (i: number) => (i >= 65 ? "#10b981" : i >= 50 ? "#3b82f6" : i >= 38 ? "#f59e0b" : "#f43f5e");
const label = (i: number) => (i >= 65 ? "Thriving" : i >= 50 ? "Healthy" : i >= 38 ? "Watch" : "At risk");

function Ring({ value, color }: { value: number; color: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" className="shrink-0">
      <circle cx="34" cy="34" r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" />
      <circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 34 34)" className="transition-all duration-700" />
      <text x="34" y="39" textAnchor="middle" className="fill-slate-900 text-[15px] font-bold">{value}</text>
    </svg>
  );
}

export default function Departments({ list, periodLabel, onSelectFeedback }: PageProps) {
  const depts = byDepartment(list);
  const [sel, setSel] = useState<string>(depts[depts.length - 1]?.department ?? "");
  const cur = depts.find((d) => d.department === sel) ?? depts[0];
  const curCats = byCategory(cur.items);
  const open = cur.items.filter((f) => f.status !== "Resolved" && f.sentiment !== "Positive").sort((a, b) => b.urgency - a.urgency).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader title="Sentiment index ranking" subtitle="Average sentiment per department (0–100)" icon={<Trophy className="h-4 w-4" />} />
          <div className="h-[380px] px-2 pb-4 pt-4">
            <ResponsiveContainer>
              <BarChart data={depts} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="department" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} width={104} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#eff6ff" }} />
                <Bar dataKey="index" name="Sentiment index" radius={[0, 8, 8, 0]} barSize={20} onClick={(d) => setSel((d as unknown as { department: string }).department)} className="cursor-pointer">
                  {depts.map((d) => <Cell key={d.department} fill={tone(d.index)} opacity={d.department === cur.department ? 1 : 0.55} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="overflow-hidden xl:col-span-3">
          <CardHeader title="Department scorecard" subtitle="Select a row to open its detailed report" />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-2.5 font-semibold">Department</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Reports</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Index</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Critical</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Resolved</th>
                  <th className="px-5 py-2.5 font-semibold">Top issue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {depts.map((d, i) => (
                  <tr key={d.department} onClick={() => setSel(d.department)} className={cn("cursor-pointer transition hover:bg-blue-50/40", d.department === cur.department && "bg-blue-50/60")}>
                    <td className="px-5 py-3 font-medium text-slate-900"><span className="mr-2 text-xs text-slate-400">{i + 1}</span>{d.department}</td>
                    <td className="px-3 py-3 text-right text-slate-600">{d.total}</td>
                    <td className="px-3 py-3 text-right"><span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: tone(d.index) + "1f", color: tone(d.index) }}>{d.index}</span></td>
                    <td className="px-3 py-3 text-right text-slate-600">{d.critical}</td>
                    <td className="px-3 py-3 text-right text-slate-600">{d.resolutionRate}%</td>
                    <td className="px-5 py-3"><span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{d.topIssue}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {depts.map((d) => (
          <button key={d.department} onClick={() => setSel(d.department)} className={cn("rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg", d.department === cur.department ? "border-blue-400 ring-4 ring-blue-100" : "border-slate-200")}>
            <div className="flex items-center gap-4">
              <Ring value={d.index} color={tone(d.index)} />
              <div className="min-w-0">
                <div className="truncate font-semibold text-slate-900">{d.department}</div>
                <div className="mt-0.5 text-xs font-semibold" style={{ color: tone(d.index) }}>{label(d.index)}</div>
                <div className="mt-0.5 text-xs text-slate-400">{d.total} responses</div>
              </div>
            </div>
            <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-100">
              <div style={{ width: `${(d.positive / Math.max(1, d.total)) * 100}%`, background: COLORS.positive }} />
              <div style={{ width: `${(d.neutral / Math.max(1, d.total)) * 100}%`, background: COLORS.neutral }} />
              <div style={{ width: `${(d.negative / Math.max(1, d.total)) * 100}%`, background: COLORS.negative }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Top issue: <span className="font-semibold text-slate-700">{d.topIssue}</span></span>
              {d.openCritical > 0 && <span className="flex items-center gap-1 font-semibold text-rose-600"><AlertOctagon className="h-3 w-3" />{d.openCritical}</span>}
            </div>
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">Department report</div>
            <h2 className="text-xl font-bold text-slate-900">{cur.department}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCsv(cur.items, `${cur.department.toLowerCase().replace(/\s+/g, "_")}_feedback.csv`)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 shadow-sm"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel
            </button>
            <button
              onClick={() => exportReport({ kind: "department", department: cur.department, list: cur.items, periodLabel })}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700"
            >
              <FileDown className="h-4 w-4" /> Download PDF
            </button>
          </div>
        </div>
        <div className="grid gap-px bg-slate-100 sm:grid-cols-4">
          {[["Responses", cur.total], ["Sentiment index", `${cur.index}/100`], ["Avg. rating", cur.rating.toFixed(1)], ["Resolution rate", `${cur.resolutionRate}%`]].map(([l, v]) => (
            <div key={l as string} className="bg-white p-5"><div className="text-xs font-medium text-slate-500">{l}</div><div className="mt-1 text-2xl font-bold text-slate-900">{v}</div></div>
          ))}
        </div>
        <div className="grid gap-6 p-5 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Feedback by category</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={curCats} margin={{ left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={54} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={26} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "#eff6ff" }} />
                  <Bar dataKey="Positive" stackId="a" fill={COLORS.positive} />
                  <Bar dataKey="Neutral" stackId="a" fill={COLORS.neutral} />
                  <Bar dataKey="Negative" stackId="a" fill={COLORS.negative} radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Top open issues</h3>
            <div className="space-y-2">
              {open.map((f) => (
                <div
                  key={f.id}
                  onClick={() => onSelectFeedback?.(f)}
                  className="rounded-xl border border-slate-100 p-3 hover:bg-blue-50/50 cursor-pointer transition"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-400">{f.id}</span>
                    <PriorityBadge value={f.priority} />
                    <StatusBadge value={f.status} />
                    <span className="ml-auto text-xs text-slate-400">{timeAgo(f.createdAt)}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-700">{f.summary}</p>
                </div>
              ))}
              {open.length === 0 && <div className="rounded-xl bg-emerald-50 p-6 text-center text-sm text-emerald-700">No open issues — great work!</div>}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
