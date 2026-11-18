import { CATEGORIES, DEPARTMENTS, PRIORITIES, type Category, type Department, type Feedback } from "../types";

export const COLORS = {
  positive: "#10b981",
  neutral: "#94a3b8",
  negative: "#f43f5e",
  blue: "#2563eb",
  sky: "#0ea5e9",
  indigo: "#6366f1",
  priority: { Critical: "#e11d48", High: "#f97316", Medium: "#f59e0b", Low: "#38bdf8" } as Record<string, string>,
};

export const sentimentIndex = (avg: number) => Math.round(((avg + 1) / 2) * 100);

export function kpis(list: Feedback[]) {
  const total = list.length;
  const avg = total ? list.reduce((s, f) => s + f.score, 0) / total : 0;
  const rating = total ? list.reduce((s, f) => s + f.rating, 0) / total : 0;
  const actionable = list.filter((f) => f.sentiment !== "Positive");
  const resolved = actionable.filter((f) => f.status === "Resolved").length;
  const openCritical = list.filter((f) => f.priority === "Critical" && f.status !== "Resolved").length;
  const open = list.filter((f) => f.status === "Open").length;
  const inProgress = list.filter((f) => f.status === "In Progress").length;
  return {
    total,
    avg,
    index: sentimentIndex(avg),
    rating,
    openCritical,
    open,
    inProgress,
    resolutionRate: actionable.length ? Math.round((resolved / actionable.length) * 100) : 100,
    positive: list.filter((f) => f.sentiment === "Positive").length,
    neutral: list.filter((f) => f.sentiment === "Neutral").length,
    negative: list.filter((f) => f.sentiment === "Negative").length,
  };
}

export function sentimentSplit(list: Feedback[]) {
  const k = kpis(list);
  return [
    { name: "Positive", value: k.positive, color: COLORS.positive },
    { name: "Neutral", value: k.neutral, color: COLORS.neutral },
    { name: "Negative", value: k.negative, color: COLORS.negative },
  ];
}

export function weeklyTrend(list: Feedback[], weeks = 12) {
  const now = Date.now();
  const W = 7 * 86400000;
  const rows = Array.from({ length: weeks }, (_, i) => ({
    label: `W${i + 1}`,
    start: now - (weeks - i) * W,
    Positive: 0,
    Neutral: 0,
    Negative: 0,
    total: 0,
    sum: 0,
  }));
  list.forEach((f) => {
    const t = +new Date(f.createdAt);
    const idx = Math.floor((t - (now - weeks * W)) / W);
    if (idx < 0 || idx >= weeks) return;
    rows[idx][f.sentiment]++;
    rows[idx].total++;
    rows[idx].sum += f.score;
  });
  return rows.map((r) => ({
    label: new Date(r.start).toLocaleDateString("en", { month: "short", day: "numeric" }),
    Positive: r.Positive,
    Neutral: r.Neutral,
    Negative: r.Negative,
    total: r.total,
    index: r.total ? sentimentIndex(r.sum / r.total) : null,
  }));
}

export function byCategory(list: Feedback[]) {
  return CATEGORIES.map((c) => {
    const items = list.filter((f) => f.category === c);
    return {
      category: c as Category,
      total: items.length,
      Positive: items.filter((f) => f.sentiment === "Positive").length,
      Neutral: items.filter((f) => f.sentiment === "Neutral").length,
      Negative: items.filter((f) => f.sentiment === "Negative").length,
      index: items.length ? sentimentIndex(items.reduce((s, f) => s + f.score, 0) / items.length) : 50,
      open: items.filter((f) => f.status !== "Resolved" && f.sentiment !== "Positive").length,
    };
  })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
}

export function byPriority(list: Feedback[]) {
  return PRIORITIES.map((p) => ({
    name: p,
    value: list.filter((f) => f.priority === p).length,
    open: list.filter((f) => f.priority === p && f.status !== "Resolved").length,
    color: COLORS.priority[p],
  }));
}

export function byDepartment(list: Feedback[]) {
  return DEPARTMENTS.map((d) => {
    const items = list.filter((f) => f.department === d);
    const k = kpis(items);
    const cats = byCategory(items.filter((f) => f.sentiment === "Negative"));
    return {
      department: d as Department,
      ...k,
      topIssue: cats[0]?.category ?? "—",
      critical: items.filter((f) => f.priority === "Critical").length,
      items,
    };
  }).sort((a, b) => b.index - a.index);
}

export function emotions(list: Feedback[]) {
  const m = new Map<string, number>();
  list.forEach((f) => m.set(f.emotion, (m.get(f.emotion) ?? 0) + 1));
  return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function topKeywords(list: Feedback[], n = 24, sentiment?: Feedback["sentiment"]) {
  const m = new Map<string, { count: number; neg: number; pos: number }>();
  list
    .filter((f) => !sentiment || f.sentiment === sentiment)
    .forEach((f) =>
      f.keywords.forEach((k) => {
        const e = m.get(k) ?? { count: 0, neg: 0, pos: 0 };
        e.count++;
        if (f.sentiment === "Negative") e.neg++;
        if (f.sentiment === "Positive") e.pos++;
        m.set(k, e);
      }),
    );
  return [...m.entries()].map(([word, v]) => ({ word, ...v })).sort((a, b) => b.count - a.count).slice(0, n);
}

export function ratingDist(list: Feedback[]) {
  return [1, 2, 3, 4, 5].map((r) => ({ rating: `${r}★`, count: list.filter((f) => f.rating === r).length }));
}

/** Plain-English insights derived from the data */
export function insights(list: Feedback[]) {
  const out: { tone: "risk" | "good" | "info"; title: string; body: string }[] = [];
  const now = Date.now();
  const W = 7 * 86400000;
  const recent = list.filter((f) => now - +new Date(f.createdAt) < W * 2);
  const prev = list.filter((f) => {
    const a = now - +new Date(f.createdAt);
    return a >= W * 2 && a < W * 4;
  });
  const negCats = byCategory(list.filter((f) => f.sentiment === "Negative" && f.status !== "Resolved"));
  if (negCats[0]) {
    out.push({
      tone: "risk",
      title: `${negCats[0].category} is the top pain point`,
      body: `${negCats[0].total} unresolved negative reports — ${Math.round((negCats[0].total / Math.max(1, list.filter((f) => f.sentiment === "Negative" && f.status !== "Resolved").length)) * 100)}% of the open backlog.`,
    });
  }
  const rN = recent.filter((f) => f.sentiment === "Negative").length;
  const pN = prev.filter((f) => f.sentiment === "Negative").length;
  if (recent.length && prev.length) {
    const d = Math.round(((rN / recent.length) - (pN / prev.length)) * 100);
    out.push({
      tone: d > 0 ? "risk" : "good",
      title: d > 0 ? "Negative sentiment is rising" : "Negative sentiment is falling",
      body: `Negative share moved ${d > 0 ? "up" : "down"} ${Math.abs(d)} pts vs. the prior two weeks.`,
    });
  }
  const depts = byDepartment(list);
  const best = depts[0];
  const worst = depts[depts.length - 1];
  out.push({
    tone: "info",
    title: `${worst.department} needs attention`,
    body: `Lowest sentiment index (${worst.index}/100), driven by ${worst.topIssue.toLowerCase()} complaints. ${best.department} leads at ${best.index}.`,
  });
  return out;
}
