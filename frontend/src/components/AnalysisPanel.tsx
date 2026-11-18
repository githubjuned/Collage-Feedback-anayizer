import { Bot, Clock, Gauge, Lightbulb, Sparkles, Tag, Users } from "lucide-react";
import type { Analysis } from "../types";
import { cn } from "../utils/cn";
import { PriorityBadge, SentimentBadge } from "./ui";

const barTone = { Positive: "bg-emerald-500", Neutral: "bg-slate-400", Negative: "bg-rose-500" };

export function AnalysisPanel({ a, empty, compact, loading }: { a: Analysis | null; empty?: boolean; compact?: boolean; loading?: boolean }) {
  if (!a || empty) {
    return (
      <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-8 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
          <Bot className="h-6 w-6" />
        </div>
        <p className="font-semibold text-slate-800">AI analysis will appear here</p>
        <p className="mt-1 max-w-xs text-sm text-slate-500">Start typing your feedback — sentiment, category and priority are detected in real time.</p>
      </div>
    );
  }
  const pos = Math.round(((a.score + 1) / 2) * 100);
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm", loading && "opacity-90")}>
      {loading && <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-blue-100"><div className="h-full w-1/4 animate-scan bg-blue-600" /></div>}
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
          <Sparkles className="h-4 w-4" /> Live AI analysis
        </div>
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Gauge className="h-3.5 w-3.5" /> {Math.round(a.confidence * 100)}% confidence
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">Sentiment</div>
            <SentimentBadge value={a.sentiment} />
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">Category</div>
            <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200">{a.category}</span>
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">Priority</div>
            <PriorityBadge value={a.priority} />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex justify-between text-xs text-slate-500">
            <span>Negative</span>
            <span className="font-medium text-slate-700">Score {a.score >= 0 ? "+" : ""}{a.score.toFixed(2)} · {a.emotion}</span>
            <span>Positive</span>
          </div>
          <div className="relative h-2 rounded-full bg-gradient-to-r from-rose-300 via-slate-200 to-emerald-300">
            <div className={cn("absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow transition-all duration-500", barTone[a.sentiment])} style={{ left: `${pos}%` }} />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex justify-between text-xs text-slate-500">
            <span>Urgency index</span>
            <span className="font-semibold text-slate-700">{a.urgency}/100</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full transition-all duration-500", a.urgency >= 72 ? "bg-rose-500" : a.urgency >= 38 ? "bg-orange-500" : a.urgency >= 24 ? "bg-amber-400" : "bg-sky-400")}
              style={{ width: `${Math.max(4, a.urgency)}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Bot className="h-3.5 w-3.5" /> AI summary</div>
          {a.summary}
        </div>

        {a.keywords.length > 0 && (
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500"><Tag className="h-3.5 w-3.5" /> Detected keywords</div>
            <div className="flex flex-wrap gap-1.5">
              {a.keywords.map((k) => (
                <span key={k} className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{k}</span>
              ))}
            </div>
          </div>
        )}

        {!compact && (
          <>
            <div>
              <div className="mb-1.5 text-xs font-medium text-slate-500">Why this priority?</div>
              <ul className="space-y-1">
                {a.reasons.map((r) => (
                  <li key={r} className="flex gap-2 text-xs text-slate-600"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500" />{r}</li>
                ))}
              </ul>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex gap-2 rounded-xl border border-slate-100 p-3 text-xs">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <div><div className="font-semibold text-slate-800">Routed to</div><div className="text-slate-500">{a.suggestedOwner}</div></div>
              </div>
              <div className="flex gap-2 rounded-xl border border-slate-100 p-3 text-xs">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <div><div className="font-semibold text-slate-800">Target SLA</div><div className="text-slate-500">{a.sla}</div></div>
              </div>
            </div>
            <div className="flex gap-2 rounded-xl bg-blue-50/70 p-3 text-xs text-blue-900">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <div><span className="font-semibold">Suggested action: </span>{a.suggestedAction}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
