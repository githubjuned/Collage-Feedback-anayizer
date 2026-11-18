import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, BarChart3, Cloud, Flame, Heart, Radar as RadarIcon, Star } from "lucide-react";
import { Card, CardHeader, ChartTooltip } from "../../components/ui";
import { COLORS, byCategory, emotions, ratingDist, topKeywords, weeklyTrend } from "../../lib/metrics";
import { CATEGORIES, DEPARTMENTS } from "../../types";
import { cn } from "../../utils/cn";
import type { PageProps } from "./AdminLayout";

const EMO_COLORS: Record<string, string> = {
  Delighted: "#059669", Satisfied: "#10b981", Constructive: "#0ea5e9", Neutral: "#94a3b8", Disappointed: "#f59e0b", Frustrated: "#f97316", Fearful: "#e11d48",
};

export default function Analytics({ list }: PageProps) {
  const [kwFilter, setKwFilter] = useState<"all" | "Negative" | "Positive">("all");
  const trend = weeklyTrend(list);
  const cats = byCategory(list);
  const emo = emotions(list);
  const rate = ratingDist(list);
  const kws = topKeywords(list, 28, kwFilter === "all" ? undefined : kwFilter);
  const maxKw = Math.max(...kws.map((k) => k.count), 1);
  const radar = cats.filter((c) => c.category !== "General").map((c) => ({ category: c.category, index: c.index }));

  // heat map dept x category (negative)
  const heat = DEPARTMENTS.map((d) => ({
    d,
    cells: CATEGORIES.filter((c) => c !== "General").map((c) => list.filter((f) => f.department === d && f.category === c && f.sentiment === "Negative").length),
  }));
  const heatMax = Math.max(...heat.flatMap((h) => h.cells), 1);
  const heatCats = CATEGORIES.filter((c) => c !== "General");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Feedback volume vs. sentiment index" subtitle="Bars show weekly responses; line shows average sentiment (0 = very negative, 100 = very positive)" icon={<Activity className="h-4 w-4" />} />
        <div className="h-80 px-2 pb-4 pt-4">
          <ResponsiveContainer>
            <ComposedChart data={trend} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="l" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
              <YAxis yAxisId="r" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<ChartTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="l" dataKey="total" name="Responses" fill="#bfdbfe" radius={[6, 6, 0, 0]} barSize={26} />
              <Line yAxisId="r" type="monotone" dataKey="index" name="Sentiment index" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: "#fff", strokeWidth: 2 }} connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Sentiment by category" subtitle="How students feel about each area of campus life" icon={<BarChart3 className="h-4 w-4" />} />
          <div className="h-[380px] px-2 pb-4 pt-4">
            <ResponsiveContainer>
              <BarChart data={cats} layout="vertical" margin={{ left: 8, right: 20 }}>
                <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} width={96} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#eff6ff" }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Positive" stackId="a" fill={COLORS.positive} barSize={18} />
                <Bar dataKey="Neutral" stackId="a" fill={COLORS.neutral} />
                <Bar dataKey="Negative" stackId="a" fill={COLORS.negative} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="Category health radar" subtitle="Sentiment index per category (higher is better)" icon={<RadarIcon className="h-4 w-4" />} />
          <div className="h-[380px] px-2 pb-4">
            <ResponsiveContainer>
              <RadarChart data={radar} outerRadius="72%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: "#475569" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="index" name="Sentiment index" stroke="#2563eb" strokeWidth={2} fill="#3b82f6" fillOpacity={0.3} />
                <Tooltip content={<ChartTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardHeader title="Emotion detection" subtitle="Dominant emotion behind each response" icon={<Heart className="h-4 w-4" />} />
          <div className="h-72 px-2 pb-4 pt-4">
            <ResponsiveContainer>
              <BarChart data={emo} layout="vertical" margin={{ left: 8, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} width={86} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="value" name="Responses" radius={[0, 6, 6, 0]} barSize={20}>
                  {emo.map((e) => <Cell key={e.name} fill={EMO_COLORS[e.name] ?? "#3b82f6"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Rating distribution" subtitle="Self-reported satisfaction (1–5)" icon={<Star className="h-4 w-4" />} />
          <div className="h-72 px-2 pb-4 pt-4">
            <ResponsiveContainer>
              <BarChart data={rate} margin={{ left: 0, right: 16 }}>
                <CartesianGrid strokeDasharray="3 4" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="rating" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "#eff6ff" }} />
                <Bar dataKey="count" name="Responses" radius={[8, 8, 0, 0]} barSize={34}>
                  {rate.map((_, i) => <Cell key={i} fill={["#f43f5e", "#fb923c", "#fbbf24", "#60a5fa", "#2563eb"][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader
            title="Keyword cloud"
            subtitle="Most frequent AI-extracted terms"
            icon={<Cloud className="h-4 w-4" />}
            action={
              <select value={kwFilter} onChange={(e) => setKwFilter(e.target.value as typeof kwFilter)} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-600 outline-none">
                <option value="all">All</option><option value="Negative">Negative</option><option value="Positive">Positive</option>
              </select>
            }
          />
          <div className="flex h-72 flex-wrap content-center items-center justify-center gap-x-3 gap-y-1.5 overflow-hidden p-5">
            {kws.map((k) => {
              const lean = k.neg === k.pos ? "n" : k.neg > k.pos ? "neg" : "pos";
              return (
                <span key={k.word} title={`${k.count} mentions`} className={cn("font-semibold leading-tight transition hover:scale-110", lean === "neg" ? "text-rose-500" : lean === "pos" ? "text-emerald-600" : "text-blue-600")} style={{ fontSize: `${12 + (k.count / maxKw) * 20}px`, opacity: 0.55 + (k.count / maxKw) * 0.45 }}>
                  {k.word}
                </span>
              );
            })}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Complaint heat map" subtitle="Negative feedback by department and category — darker means more complaints" icon={<Flame className="h-4 w-4" />} />
        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[720px] border-separate border-spacing-1 text-xs">
            <thead>
              <tr>
                <th />
                {heatCats.map((c) => <th key={c} className="px-1 pb-1 text-center font-medium text-slate-500">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {heat.map((row) => (
                <tr key={row.d}>
                  <td className="whitespace-nowrap pr-3 text-right font-medium text-slate-700">{row.d}</td>
                  {row.cells.map((v, i) => (
                    <td key={i} className="h-10 rounded-lg text-center font-semibold" style={{ background: v ? `rgba(37,99,235,${0.1 + (v / heatMax) * 0.85})` : "#f8fafc", color: v / heatMax > 0.45 ? "#fff" : v ? "#1e3a8a" : "#cbd5e1" }}>
                      {v || "·"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
