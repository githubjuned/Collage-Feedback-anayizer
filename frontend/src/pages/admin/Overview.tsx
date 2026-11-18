import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertOctagon, ArrowRight, CheckCircle2, Inbox, Lightbulb, MessageSquare, Smile, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardHeader, ChartTooltip, PriorityBadge, SentimentBadge, timeAgo, Avatar } from "../../components/ui";
import { COLORS, byCategory, byPriority, insights, kpis, sentimentSplit, weeklyTrend } from "../../lib/metrics";
import { cn } from "../../utils/cn";
import type { PageProps } from "./AdminLayout";

function delta(list: PageProps["list"], all: PageProps["all"]) {
  // compare last 14 days vs the 14 before
  const now = Date.now();
  const D = 14 * 86400000;
  const cur = all.filter((f) => now - +new Date(f.createdAt) < D);
  const prev = all.filter((f) => now - +new Date(f.createdAt) >= D && now - +new Date(f.createdAt) < D * 2);
  const a = kpis(cur);
  const b = kpis(prev);
  return {
    total: b.total ? Math.round(((a.total - b.total) / b.total) * 100) : 0,
    index: a.index - b.index,
    list,
  };
}

function Kpi({ icon: Icon, label, value, sub, trend, tone }: { icon: typeof Inbox; label: string; value: string; sub: string; trend?: number; tone: string }) {
  return (
    <Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", tone)}><Icon className="h-5 w-5" /></div>
        {trend !== undefined && (
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", trend >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend >= 0 ? "+" : ""}{trend}
          </span>
        )}
      </div>
      <div className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-0.5 text-sm font-medium text-slate-600">{label}</div>
      <div className="mt-1 text-xs text-slate-400">{sub}</div>
    </Card>
  );
}

export default function Overview({ list, all, onSelectFeedback }: PageProps) {
  const k = kpis(list);
  const d = delta(list, all);
  const trend = weeklyTrend(list);
  const split = sentimentSplit(list);
  const cats = byCategory(list.filter((f) => f.sentiment === "Negative")).slice(0, 7);
  const pri = byPriority(list);
  const ins = insights(all);
  const urgent = all
    .filter((f) => (f.priority === "Critical" || f.priority === "High") && f.status !== "Resolved")
    .sort((a, b) => (b.priority === "Critical" ? 1 : 0) - (a.priority === "Critical" ? 1 : 0) || +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={MessageSquare} label="Total feedback" value={String(k.total)} sub={`${k.rating.toFixed(1)} avg. rating`} trend={d.total} tone="bg-blue-50 text-blue-600" />
        <Kpi icon={Smile} label="Sentiment index" value={`${k.index}/100`} sub={`${Math.round((k.positive / Math.max(1, k.total)) * 100)}% positive responses`} trend={d.index} tone="bg-emerald-50 text-emerald-600" />
        <Kpi icon={AlertOctagon} label="Open critical issues" value={String(k.openCritical)} sub="Require response within 4 hours" tone="bg-rose-50 text-rose-600" />
        <Kpi icon={CheckCircle2} label="Resolution rate" value={`${k.resolutionRate}%`} sub={`${k.open} open · ${k.inProgress} in progress`} tone="bg-sky-50 text-sky-600" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Sentiment trend" subtitle="Weekly feedback volume by sentiment" />
          <div className="h-72 px-2 pb-4 pt-4">
            <ResponsiveContainer>
              <AreaChart data={trend} margin={{ left: 0, right: 16, top: 8 }}>
                <defs>
                  {[["p", COLORS.positive], ["u", COLORS.neutral], ["n", COLORS.negative]].map(([id, c]) => (
                    <linearGradient key={id} id={`g-${id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={0.4} /><stop offset="100%" stopColor={c} stopOpacity={0.02} /></linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Positive" stackId="1" stroke={COLORS.positive} strokeWidth={2} fill="url(#g-p)" />
                <Area type="monotone" dataKey="Neutral" stackId="1" stroke={COLORS.neutral} strokeWidth={2} fill="url(#g-u)" />
                <Area type="monotone" dataKey="Negative" stackId="1" stroke={COLORS.negative} strokeWidth={2} fill="url(#g-n)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Sentiment split" subtitle="AI-classified responses" />
          <div className="relative h-52 px-4 pt-2">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={split} dataKey="value" nameKey="name" innerRadius={62} outerRadius={86} paddingAngle={3} cornerRadius={6} stroke="none">
                  {split.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
              <div className="text-3xl font-bold text-slate-900">{k.total}</div>
              <div className="text-xs text-slate-500">responses</div>
            </div>
          </div>
          <div className="space-y-2 px-5 pb-5">
            {split.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-slate-600">{s.name}</span>
                <span className="ml-auto font-semibold text-slate-900">{s.value}</span>
                <span className="w-10 text-right text-xs text-slate-400">{Math.round((s.value / Math.max(1, k.total)) * 100)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader title="Top complaint categories" subtitle="Negative feedback by AI category" />
          <div className="h-72 px-2 pb-4 pt-3">
            <ResponsiveContainer>
              <BarChart data={cats} layout="vertical" margin={{ left: 8, right: 20 }}>
                <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} width={92} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#eff6ff" }} />
                <Bar dataKey="Negative" name="Complaints" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Priority detection" subtitle="Open vs. total by AI-assigned priority" />
          <div className="space-y-4 p-5 pt-5">
            {pri.map((p) => {
              const max = Math.max(...pri.map((x) => x.value), 1);
              return (
                <div key={p.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <PriorityBadge value={p.name as "Critical"} />
                    <span className="text-slate-500"><span className="font-semibold text-slate-900">{p.open}</span> open / {p.value}</span>
                  </div>
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="absolute inset-y-0 left-0 rounded-full opacity-25" style={{ width: `${(p.value / max) * 100}%`, background: p.color }} />
                    <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(p.open / max) * 100}%`, background: p.color }} />
                  </div>
                </div>
              );
            })}
            <p className="pt-1 text-xs text-slate-400">Priority is scored from sentiment intensity, safety terms, urgency language, scope of impact and rating.</p>
          </div>
        </Card>

        <Card>
          <CardHeader title="AI insights" subtitle="Auto-generated from latest data" icon={<Sparkles className="h-4 w-4" />} />
          <div className="space-y-3 p-5">
            {ins.map((i) => (
              <div key={i.title} className={cn("rounded-xl border p-3.5", i.tone === "risk" ? "border-rose-100 bg-rose-50/60" : i.tone === "good" ? "border-emerald-100 bg-emerald-50/60" : "border-blue-100 bg-blue-50/60")}>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Lightbulb className={cn("h-4 w-4", i.tone === "risk" ? "text-rose-500" : i.tone === "good" ? "text-emerald-500" : "text-blue-500")} />
                  {i.title}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{i.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Needs attention now"
          subtitle="Unresolved critical and high-priority issues"
          action={<a href="#/admin/issues" className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">View all <ArrowRight className="h-4 w-4" /></a>}
        />
        <div className="divide-y divide-slate-100 p-2 pt-3">
          {urgent.map((f) => (
            <div
              key={f.id}
              onClick={() => onSelectFeedback?.(f)}
              className="flex items-start gap-3 rounded-xl px-3 py-3 transition hover:bg-blue-50/50 cursor-pointer"
            >
              <Avatar name={f.studentName} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-400">{f.id}</span>
                  <PriorityBadge value={f.priority} />
                  <SentimentBadge value={f.sentiment} />
                  <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">{f.category}</span>
                </div>
                <p className="mt-1.5 line-clamp-1 text-sm text-slate-700">{f.summary}</p>
              </div>
              <div className="hidden text-right text-xs text-slate-400 sm:block">
                <div>{f.department}</div>
                <div className="mt-0.5">{timeAgo(f.createdAt)}</div>
              </div>
            </div>
          ))}
          {urgent.length === 0 && <div className="p-8 text-center text-sm text-slate-500">🎉 No unresolved critical issues.</div>}
        </div>
      </Card>
    </div>
  );
}
