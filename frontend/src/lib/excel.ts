import type { Feedback } from "../types";

export function exportToCsv(list: Feedback[], filename = "campuspulse_feedback.csv") {
  const headers = [
    "Ticket ID",
    "Date",
    "Student Name",
    "Anonymous",
    "Email",
    "Department",
    "Year",
    "Rating",
    "Feedback Text",
    "Language",
    "Sentiment",
    "Score",
    "Category",
    "Priority",
    "Urgency",
    "Emotion",
    "Keywords",
    "Status",
    "Assignee",
    "SLA",
    "AI Summary",
    "Suggested Action",
    "Is Demo",
  ];

  const escapeCell = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = list.map((f) => [
    escapeCell(f.id),
    escapeCell(new Date(f.createdAt).toLocaleString("en-GB")),
    escapeCell(f.studentName),
    escapeCell(f.anonymous ? "Yes" : "No"),
    escapeCell(f.email || "N/A"),
    escapeCell(f.department),
    escapeCell(f.year),
    escapeCell(f.rating),
    escapeCell(f.text.replace(/[\r\n]+/g, " ")),
    escapeCell(f.language ? f.language.toUpperCase() : "EN"),
    escapeCell(f.sentiment),
    escapeCell(f.score.toFixed(2)),
    escapeCell(f.category),
    escapeCell(f.priority),
    escapeCell(f.urgency),
    escapeCell(f.emotion),
    escapeCell(f.keywords.join(", ")),
    escapeCell(f.status),
    escapeCell(f.assignee),
    escapeCell(f.sla),
    escapeCell(f.summary),
    escapeCell(f.suggestedAction),
    escapeCell(f.isDemo ? "Yes" : "No"),
  ]);

  const csvContent = "\ufeff" + [headers.map(escapeCell).join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
