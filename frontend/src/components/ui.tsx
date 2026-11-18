import type { ReactNode } from "react";
import { Activity, AlertOctagon, AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, Circle, CircleDot, Minus, Smile, Frown, Meh } from "lucide-react";
import { cn } from "../utils/cn";
import type { Priority, Sentiment, Status } from "../types";

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
        <Activity className="h-5 w-5 text-white" strokeWidth={2.6} />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-sky-300" />
      </div>
      <div className="leading-none">
        <div className={cn("text-[17px] font-bold tracking-tight", dark ? "text-white" : "text-slate-900")}>
          Campus<span className="text-blue-600">Pulse</span>
          <span className={cn("ml-1 rounded-md px-1 py-0.5 align-middle text-[10px] font-bold", dark ? "bg-white/15 text-sky-200" : "bg-blue-50 text-blue-700")}>AI</span>
        </div>
        <div className={cn("mt-1 text-[10px] font-medium uppercase tracking-[0.14em]", dark ? "text-blue-200/70" : "text-slate-400")}>Feedback Intelligence</div>
      </div>
    </div>
  );
}

export function Card({ className, children, ...rest }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.08)]", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon }: { title: string; subtitle?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div className="flex items-start gap-3">
        {icon && <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">{icon}</div>}
        <div>
          <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

const sentimentStyles: Record<Sentiment, string> = {
  Positive: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Neutral: "bg-slate-100 text-slate-600 ring-slate-200",
  Negative: "bg-rose-50 text-rose-700 ring-rose-200",
};
export function SentimentBadge({ value, className }: { value: Sentiment; className?: string }) {
  const Icon = value === "Positive" ? Smile : value === "Negative" ? Frown : Meh;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", sentimentStyles[value], className)}>
      <Icon className="h-3 w-3" />
      {value}
    </span>
  );
}

const priorityStyles: Record<Priority, string> = {
  Critical: "bg-rose-600 text-white ring-rose-600",
  High: "bg-orange-50 text-orange-700 ring-orange-200",
  Medium: "bg-amber-50 text-amber-700 ring-amber-200",
  Low: "bg-sky-50 text-sky-700 ring-sky-200",
};
export function PriorityBadge({ value, className }: { value: Priority; className?: string }) {
  const Icon = value === "Critical" ? AlertOctagon : value === "High" ? AlertTriangle : value === "Medium" ? Minus : ArrowDown;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset", priorityStyles[value], className)}>
      {value === "High" ? <ArrowUp className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
      {value}
    </span>
  );
}

const statusStyles: Record<Status, string> = {
  Open: "bg-blue-50 text-blue-700 ring-blue-200",
  "In Progress": "bg-violet-50 text-violet-700 ring-violet-200",
  Resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};
export function StatusBadge({ value, className }: { value: Status; className?: string }) {
  const Icon = value === "Open" ? Circle : value === "In Progress" ? CircleDot : CheckCircle2;
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", statusStyles[value], className)}>
      <Icon className="h-3 w-3" />
      {value}
    </span>
  );
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600", className)}>{children}</span>;
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name === "Anonymous" ? "?" : name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const hue = [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % 4;
  const tones = ["bg-blue-100 text-blue-700", "bg-sky-100 text-sky-700", "bg-indigo-100 text-indigo-700", "bg-cyan-100 text-cyan-700"];
  return <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold", name === "Anonymous" ? "bg-slate-100 text-slate-500" : tones[hue], className)}>{initials}</div>;
}

export function Stars({ value, rating, size = 16 }: { value?: number; rating?: number; size?: number }) {
  const val = value ?? rating ?? 0;
  return (
    <span className="inline-flex gap-0.5" aria-label={`${val} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" className={i <= val ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}>
          <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.1L12 17.6 5.7 21.3l1.7-7.1L2 9.5l7.1-.6L12 2z" fill="currentColor" />
        </svg>
      ))}
    </span>
  );
}

export function timeAgo(iso: string) {
  const s = (Date.now() - +new Date(iso)) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export const selectCls =
  "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100";

export function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color?: string; fill?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      {label && <div className="mb-1 font-semibold text-slate-900">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-slate-600">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          {p.name}: <span className="font-semibold text-slate-900">{p.value}</span>
        </div>
      ))}
    </div>
  );
}
