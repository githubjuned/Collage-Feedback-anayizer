import type { Analysis, Category, Priority, Sentiment } from "../types";

/* ------------------------------------------------------------------ */
/*  CampusPulse NLP engine — lexicon + rule based, runs fully in-browser */
/* ------------------------------------------------------------------ */

const POSITIVE: Record<string, number> = {
  great: 2, excellent: 3, amazing: 3, good: 1.5, helpful: 2, love: 2.5, loved: 2.5, best: 2.5,
  clean: 1.5, friendly: 2, supportive: 2, awesome: 3, outstanding: 3, improved: 2, improvement: 2,
  thank: 1.5, thanks: 1.5, happy: 2, satisfied: 2, fantastic: 3, wonderful: 3, engaging: 2,
  smooth: 1.5, smoothly: 1.5, quick: 1.2, quickly: 1.2, fast: 1.2, nice: 1.5, impressed: 2.5,
  enjoy: 2, enjoyed: 2, appreciate: 2, informative: 2, responsive: 2, comfortable: 1.5,
  delicious: 2.5, tasty: 2, interactive: 1.5, resolved: 1.5, recommend: 2, modern: 1.5,
  punctual: 2, polite: 1.8, fresh: 1.5, hygienic: 2, convenient: 1.5, perfectly: 2, perfect: 2.5,
  easy: 1.2, useful: 1.8, safe: 1.5, confidence: 1.5, maintained: 1.2, clearly: 1.2, huge: 0.5,
  variety: 1, instantly: 1.5, helpful_: 0,
};

const NEGATIVE: Record<string, number> = {
  bad: -2, poor: -2.5, terrible: -3, worst: -3.5, horrible: -3, awful: -3, slow: -1.8,
  dirty: -2.5, broken: -2.5, late: -1.5, unhygienic: -3, unsafe: -3.5, rude: -2.5, ignored: -2.5,
  ignoring: -2.5, delay: -1.5, delayed: -2, crowded: -1.5, overcrowded: -2, noisy: -1.5, noise: -1,
  leak: -2, leaking: -2.5, smelly: -2.5, stale: -2.5, insects: -2.5, cockroaches: -3, rats: -3,
  harassing: -4, harassment: -4, ragging: -4, unfair: -3, biased: -3, disappointed: -2.5,
  frustrating: -2.5, frustrated: -2.5, annoying: -2, useless: -3, outdated: -2, lacks: -2,
  lacking: -2, shortage: -2, unavailable: -2, issue: -1, issues: -1, problem: -1.5, problems: -1.5,
  struggling: -2, stressful: -2, cancelled: -1.5, waste: -2, overpriced: -2.5, confusing: -2,
  unresponsive: -2.5, negligent: -3, crashing: -2.5, crashes: -2.5, failed: -2, fails: -2,
  damaged: -2.5, malfunctioning: -2.5, uncomfortable: -2, boring: -2, incorrectly: -2.5,
  incorrect: -2.5, rashly: -2.5, scared: -3, danger: -3, dangerous: -3.5, hazard: -3, hurt: -2.5,
  blocked: -2, expired: -2.5, cold: -1, hot: -1, dark: -1, wet: -1.5, heavy: -1, fast_: 0,
  poisoning: -4, sparks: -2.5, never: -1, unbearable: -3.5, repeated: -1.5, repeatedly: -1.8,
  refuses: -2.5, refused: -2.5, rude_: 0, down: -2, crash: -2.5, small: -0.8, long: -1,
  missing: -1.5, miss: -1.5, missed: -1.5, wrong: -2, tired: -1.5, messy: -2,
};

const NEGATIONS = new Set([
  "not", "no", "never", "isnt", "dont", "doesnt", "wasnt", "cant", "cannot", "hardly", "without", "nobody", "didnt", "wont",
]);
const INTENSIFIERS = new Set(["very", "extremely", "really", "so", "too", "absolutely", "highly", "completely", "totally", "always"]);

const PHRASES: [string, number][] = [
  ["not working", -3], ["no water", -3], ["not clean", -2.5], ["no response", -3], ["too many", -1.5],
  ["food poisoning", -4], ["short circuit", -3.5], ["no action", -3], ["waste of", -2.5], ["not available", -2],
  ["could not", -1.5], ["cannot", -1.5], ["would be great", 1], ["would be nice", 0.5], ["thank you", 1.5],
  ["no problem", 1.5],
];

/* ----------------------------- categories ----------------------------- */

const CATEGORY_KEYWORDS: Record<Exclude<Category, "General">, string[]> = {
  Academics: [
    "exam", "exams", "syllabus", "curriculum", "course", "courses", "assignment", "assignments", "lab", "labs",
    "timetable", "schedule", "marks", "revaluation", "internal", "semester", "lectures", "lecture", "classes",
    "project", "projects", "practicals", "placement", "revision", "subject", "grading", "results", "practical",
    "workshop", "training", "electives", "topics",
  ],
  Faculty: [
    "professor", "teacher", "faculty", "lecturer", "mentor", "mentorship", "teaching", "taught", "sir",
    "madam", "explains", "explain", "doubt", "doubts", "instructors", "instructor", "prof",
  ],
  Infrastructure: [
    "classroom", "classrooms", "building", "projector", "ac", "fan", "fans", "restroom", "washroom", "washrooms",
    "toilet", "bench", "benches", "parking", "lift", "elevator", "ground", "campus", "electricity", "power",
    "water", "roof", "ceiling", "furniture", "lights", "seminar", "hall", "gym", "sports", "sound", "socket",
    "cooler", "drinking", "air", "conditioning", "corridor", "block",
  ],
  Hostel: ["hostel", "hostels", "warden", "roommate", "dorm", "laundry", "curfew", "rooms"],
  Canteen: [
    "canteen", "food", "mess", "meal", "meals", "lunch", "breakfast", "dinner", "snack", "snacks", "cafeteria",
    "menu", "tea", "coffee", "kitchen", "counter", "delicious", "tasty", "portion",
  ],
  Transport: ["bus", "buses", "transport", "route", "driver", "shuttle", "commute", "pickup", "van"],
  Library: ["library", "book", "books", "journal", "journals", "librarian", "reading", "borrow", "e-resources", "reference", "resources"],
  "IT & Wi-Fi": [
    "wifi", "internet", "network", "portal", "website", "server", "login", "computer", "computers", "software",
    "lms", "erp", "app", "bandwidth", "online", "streaming", "buffering", "signal",
  ],
  Administration: [
    "office", "fee", "fees", "scholarship", "admin", "administration", "document", "documents", "certificate",
    "certificates", "bonafide", "registrar", "clerk", "refund", "paperwork", "approval", "payment", "receipt", "authorities",
  ],
  Safety: [
    "harassing", "harassment", "ragging", "unsafe", "security", "theft", "stolen", "fire", "assault", "threat",
    "bullying", "bullied", "cctv", "emergency", "injury", "accident", "stalking", "safety", "abuse", "drugs",
    "poisoning", "hazard", "sparks", "extinguishers", "safe", "guards", "scared", "seniors",
  ],
};

/** Strong signals that should win a category contest */
const CATEGORY_BOOST: Record<string, Category> = {
  hostel: "Hostel", canteen: "Canteen", mess: "Canteen", library: "Library", wifi: "IT & Wi-Fi", bus: "Transport",
  ragging: "Safety", harassing: "Safety", harassment: "Safety", poisoning: "Safety", fire: "Safety", sparks: "Safety",
  security: "Safety", scholarship: "Administration", professor: "Faculty", portal: "IT & Wi-Fi", erp: "IT & Wi-Fi",
};

const CRITICAL_TERMS = [
  "harass", "ragging", "assault", "threat", "molest", "fire", "electric shock", "short circuit", "sparks", "injury",
  "injured", "accident", "food poisoning", "poisoning", "suicide", "stalk", "abuse", "drugs", "hospital", "fainted",
  "bleeding", "extinguisher", "emergency exit", "bully",
];
const URGENCY_TERMS = [
  "urgent", "urgently", "immediately", "asap", "emergency", "dangerous", "serious", "hazard", "unbearable",
  "weeks", "months", "since", "repeatedly", "again", "nobody", "no response", "ignored", "ignoring", "unsafe", "scared", "no action",
];
const IMPACT_TERMS = ["all students", "everyone", "many students", "several", "hundreds", "every week", "every day", "every night", "entire", "juniors", "most students"];

const STOP = new Set(
  "the a an and or but if then for to of in on at by with from is are was were be been being it its this that these those i we you they he she my our your their me us them there here as so very just also have has had do does did can could would should will shall may might about into over after before during while than too more most some any all not no".split(" "),
);

/* ----------------------------- metadata ----------------------------- */

const ACTIONS: Record<Category, { action: string; owner: string }> = {
  Academics: { action: "Escalate to the Academic Dean and review the schedule/assessment process.", owner: "Academic Affairs" },
  Faculty: { action: "Share anonymised feedback with the HoD and arrange a mentoring conversation.", owner: "Head of Department" },
  Infrastructure: { action: "Dispatch the facilities team for on-site inspection and repair.", owner: "Facilities Team" },
  Hostel: { action: "Alert the Chief Warden and schedule a hostel inspection.", owner: "Hostel Administration" },
  Canteen: { action: "Notify the mess committee and run a hygiene & quality audit.", owner: "Mess Committee" },
  Transport: { action: "Review route timings and driver compliance with the Transport Office.", owner: "Transport Office" },
  Library: { action: "Forward to the Chief Librarian for acquisition or service improvement.", owner: "Library Services" },
  "IT & Wi-Fi": { action: "Open a ticket with IT Services and check network/uptime logs.", owner: "IT Services" },
  Administration: { action: "Route to the Registrar's office with a 48-hour response target.", owner: "Registrar Office" },
  Safety: { action: "Immediately notify the Security Office and Student Welfare Cell.", owner: "Security Office" },
  General: { action: "Triage manually and assign to the relevant office.", owner: "Student Affairs" },
};

const SLA: Record<Priority, string> = { Critical: "Respond within 4 hours", High: "Respond within 24 hours", Medium: "Respond within 3 days", Low: "Respond within 7 days" };

/* ----------------------------- helpers ----------------------------- */

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/wi-?\s?fi/g, "wifi")
    .replace(/e-resources/g, "eresources")
    .replace(/['’]s\b/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

export function analyzeFeedback(text: string, rating?: number): Analysis {
  const clean = text.trim();
  const lower = clean.toLowerCase().replace(/wi-?\s?fi/g, "wifi");
  const tokens = tokenize(clean);

  /* ---- sentiment ---- */
  let sum = 0;
  let hits = 0;
  const sentimentWords: string[] = [];
  tokens.forEach((tok, i) => {
    let val = POSITIVE[tok] ?? NEGATIVE[tok];
    if (!val) return;
    const prev = tokens.slice(Math.max(0, i - 2), i);
    if (prev.some((p) => INTENSIFIERS.has(p))) val *= 1.4;
    if (prev.some((p) => NEGATIONS.has(p)) && !(tok === "problem" || tok === "problems")) val *= -0.8;
    else if (prev.some((p) => NEGATIONS.has(p))) val = Math.abs(val);
    sum += val;
    hits++;
    sentimentWords.push(tok);
  });
  PHRASES.forEach(([p, v]) => {
    if (lower.includes(p)) {
      sum += v;
      hits++;
    }
  });
  if (/!{2,}/.test(clean)) sum *= 1.1;
  const textScore = Math.tanh(sum / 6);
  const ratingScore = rating ? (rating - 3) / 2 : 0;
  const score = clamp(rating ? textScore * 0.78 + ratingScore * 0.22 : textScore, -1, 1);
  const sentiment: Sentiment = score > 0.18 ? "Positive" : score < -0.18 ? "Negative" : "Neutral";
  const confidence = clamp(0.62 + Math.abs(score) * 0.28 + Math.min(hits, 6) * 0.015 + (clean.length > 60 ? 0.03 : -0.05), 0.55, 0.99);

  /* ---- category ---- */
  const catScores = new Map<Category, number>();
  const catHits = new Map<Category, string[]>();
  (Object.keys(CATEGORY_KEYWORDS) as Exclude<Category, "General">[]).forEach((cat) => {
    const set = new Set(CATEGORY_KEYWORDS[cat]);
    tokens.forEach((tok) => {
      if (set.has(tok)) {
        catScores.set(cat, (catScores.get(cat) ?? 0) + 1 + (CATEGORY_BOOST[tok] === cat ? 2 : 0));
        catHits.set(cat, [...(catHits.get(cat) ?? []), tok]);
      }
    });
  });
  // extreme safety terms override everything
  const safetyHit = CRITICAL_TERMS.filter((t) => lower.includes(t));
  if (safetyHit.length && sentiment === "Negative") catScores.set("Safety", (catScores.get("Safety") ?? 0) + 4);
  const ranked = [...catScores.entries()].sort((a, b) => b[1] - a[1]);
  const category: Category = ranked[0]?.[0] ?? "General";
  const secondaryCategory = ranked[1] && ranked[1][1] >= 2 ? ranked[1][0] : undefined;

  /* ---- priority ---- */
  let urgency = 0;
  const reasons: string[] = [];
  if (score < 0) {
    urgency += Math.abs(score) * 38;
    reasons.push(`Negative sentiment intensity ${Math.round(Math.abs(score) * 100)}%`);
  }
  const urgencyHits = URGENCY_TERMS.filter((t) => lower.includes(t));
  if (urgencyHits.length && score < 0.1) {
    urgency += Math.min(urgencyHits.length, 4) * 7;
    reasons.push(`Urgency language: “${urgencyHits.slice(0, 3).join("”, “")}”`);
  }
  if (safetyHit.length && score < 0.1) {
    urgency += 38;
    reasons.push(`Safety / welfare risk: “${[...new Set(safetyHit)].slice(0, 3).join("”, “")}”`);
  }
  const impactHits = IMPACT_TERMS.filter((t) => lower.includes(t));
  if (impactHits.length && score < 0.1) {
    urgency += 10;
    reasons.push("Affects multiple students");
  }
  if (score < 0.1) {
    if (category === "Safety" && !safetyHit.length) {
      urgency += 26;
      reasons.push("Safety-related concern on campus");
    }
    if (category === "Hostel" || category === "IT & Wi-Fi") urgency += 6;
    if (category === "Academics" && /exam|marks|revaluation|deadline/.test(lower)) {
      urgency += 8;
      reasons.push("Academic outcome at risk");
    }
    if (rating && rating <= 2) {
      urgency += 7;
      reasons.push(`Low satisfaction rating (${rating}/5)`);
    }
  }
  urgency = clamp(Math.round(urgency), 0, 100);
  let priority: Priority = urgency >= 72 ? "Critical" : urgency >= 38 ? "High" : urgency >= 24 ? "Medium" : "Low";
  if (sentiment === "Positive") priority = "Low";
  if (safetyHit.length && sentiment === "Negative" && priority !== "Critical") priority = "Critical";
  if (priority === "Low" && !reasons.length) reasons.push(sentiment === "Positive" ? "Positive feedback — no action required" : "No urgency indicators detected");

  /* ---- emotion ---- */
  let emotion = "Neutral";
  const suggestion = /\b(should|suggest|please|would be (great|nice|good)|could we|maybe|consider)\b/.test(lower);
  if (sentiment === "Positive") emotion = score > 0.5 ? "Delighted" : "Satisfied";
  else if (sentiment === "Negative") {
    if (safetyHit.length || /scared|unsafe|fear|afraid/.test(lower)) emotion = "Fearful";
    else if (/ignored|nobody|no response|no action|again|weeks|months|unbearable/.test(lower)) emotion = "Frustrated";
    else emotion = "Disappointed";
  } else if (suggestion) emotion = "Constructive";

  /* ---- keywords ---- */
  const kw = new Set<string>();
  sentimentWords.forEach((w) => kw.add(w));
  (catHits.get(category) ?? []).forEach((w) => kw.add(w));
  if (kw.size < 4) {
    const freq = new Map<string, number>();
    tokens.filter((t) => t.length > 4 && !STOP.has(t)).forEach((t) => freq.set(t, (freq.get(t) ?? 0) + 1));
    [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).forEach(([w]) => kw.add(w));
  }
  const keywords = [...kw].filter((w) => !STOP.has(w)).slice(0, 6);

  /* ---- summary ---- */
  const topics = (catHits.get(category) ?? []).slice(0, 2);
  const topicStr = topics.length ? topics.join(" & ") : category.toLowerCase();
  let summary: string;
  if (!clean) summary = "Awaiting feedback text…";
  else if (sentiment === "Positive") summary = `Student praises ${category.toLowerCase()} — highlights ${topicStr}.`;
  else if (sentiment === "Negative") summary = `${priority === "Critical" ? "Urgent: s" : "S"}tudent reports ${category.toLowerCase()} problems around ${topicStr}${impactHits.length ? ", affecting multiple students" : ""}.`;
  else summary = `${suggestion ? "Suggestion" : "Observation"} regarding ${category.toLowerCase()}: ${topicStr}.`;

  const meta = ACTIONS[category];
  const suggestedAction = sentiment === "Positive" ? `Share this recognition with ${meta.owner} and log as a best practice.` : meta.action;

  return {
    sentiment, score, confidence, category, secondaryCategory, priority, urgency, emotion, keywords,
    summary, reasons, suggestedAction, suggestedOwner: meta.owner, sla: SLA[priority],
  };
}
