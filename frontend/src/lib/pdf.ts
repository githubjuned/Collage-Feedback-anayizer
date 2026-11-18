import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Feedback } from "../types";
import { byCategory, byDepartment, insights, kpis, sentimentSplit } from "./metrics";

export type ReportKind = "executive" | "department" | "critical" | "issues";

interface Opts {
  kind: ReportKind;
  list: Feedback[];
  department?: string;
  periodLabel: string;
}

const BLUE: [number, number, number] = [37, 99, 235];
const NAVY: [number, number, number] = [15, 23, 42];
const SLATE: [number, number, number] = [100, 116, 139];
const LIGHT: [number, number, number] = [239, 246, 255];

const TITLES: Record<ReportKind, string> = {
  executive: "Executive Feedback Report",
  department: "Department Report",
  critical: "Critical & High-Priority Issues",
  issues: "Issue Tracker Export",
};

export function exportReport({ kind, list, department, periodLabel }: Opts) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;
  const k = kpis(list);
  const title = kind === "department" && department ? `${department} — Department Report` : TITLES[kind];

  /* header */
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, W, 96, "F");
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(M, 28, 34, 34, 8, 8, "F");
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(2);
  const pts: [number, number][] = [[M + 6, 46], [M + 12, 46], [M + 16, 36], [M + 22, 56], [M + 26, 46], [M + 28, 46]];
  for (let i = 0; i < pts.length - 1; i++) doc.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, M + 46, 46);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(219, 234, 254);
  doc.text(`CampusPulse AI  ·  ${periodLabel}  ·  Generated ${new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`, M + 46, 62);
  doc.text("Confidential — for institutional use only", M + 46, 76);

  let y = 126;

  const heading = (t: string) => {
    if (y > 740) {
      doc.addPage();
      y = 56;
    }
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.5);
    doc.text(t, M, y);
    doc.setDrawColor(...BLUE);
    doc.setLineWidth(1.5);
    doc.line(M, y + 5, M + 28, y + 5);
    y += 22;
  };
  const last = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  /* KPIs */
  const cards: [string, string][] = [
    ["Total feedback", String(k.total)],
    ["Sentiment index", `${k.index}/100`],
    ["Avg. rating", k.rating.toFixed(1)],
    ["Open critical", String(k.openCritical)],
    ["Resolution rate", `${k.resolutionRate}%`],
  ];
  const cw = (W - M * 2 - 8 * 4) / 5;
  cards.forEach(([label, val], i) => {
    const x = M + i * (cw + 8);
    doc.setFillColor(...LIGHT);
    doc.roundedRect(x, y, cw, 52, 6, 6, "F");
    doc.setTextColor(...SLATE);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(label.toUpperCase(), x + 10, y + 18);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.text(val, x + 10, y + 40);
  });
  y += 76;

  if (kind === "executive" || kind === "department") {
    /* sentiment bars */
    heading("Sentiment distribution");
    const split = sentimentSplit(list);
    const colors: [number, number, number][] = [[16, 185, 129], [148, 163, 184], [244, 63, 94]];
    split.forEach((s, i) => {
      const pct = k.total ? s.value / k.total : 0;
      doc.setTextColor(...NAVY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(s.name, M, y + 9);
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(M + 70, y, W - M * 2 - 150, 11, 5, 5, "F");
      doc.setFillColor(...colors[i]);
      if (pct > 0) doc.roundedRect(M + 70, y, Math.max(8, (W - M * 2 - 150) * pct), 11, 5, 5, "F");
      doc.setTextColor(...SLATE);
      doc.text(`${s.value}  (${Math.round(pct * 100)}%)`, W - M - 70, y + 9);
      y += 20;
    });
    y += 10;

    /* insights */
    if (list.length > 10) {
      heading("AI insights");
      const ins = kind === "executive" ? insights(list) : insights(list).slice(0, 2);
      ins.forEach((i) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...NAVY);
        doc.text(`•  ${i.title}`, M, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...SLATE);
        const lines = doc.splitTextToSize(i.body, W - M * 2 - 14);
        doc.text(lines, M + 12, y + 13);
        y += 14 + lines.length * 12 + 6;
      });
      y += 4;
    }

    heading("Complaint categories");
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [["Category", "Reports", "Positive", "Neutral", "Negative", "Open issues", "Sentiment index"]],
      body: byCategory(list).map((c) => [c.category, c.total, c.Positive, c.Neutral, c.Negative, c.open, `${c.index}/100`]),
      styles: { fontSize: 9, cellPadding: 5, textColor: NAVY },
      headStyles: { fillColor: BLUE, textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    y = last() + 28;
  }

  if (kind === "executive") {
    heading("Department scorecard");
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [["Department", "Reports", "Sentiment index", "Negative", "Critical", "Resolution", "Top issue"]],
      body: byDepartment(list).map((d) => [d.department, d.total, `${d.index}/100`, d.negative, d.critical, `${d.resolutionRate}%`, d.topIssue]),
      styles: { fontSize: 9, cellPadding: 5, textColor: NAVY },
      headStyles: { fillColor: BLUE, textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    y = last() + 28;
  }

  const issueRows = (items: Feedback[]) =>
    items.map((f) => [
      f.id,
      new Date(f.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      f.department,
      f.category,
      f.priority,
      f.status,
      f.summary,
    ]);

  const issueTable = (items: Feedback[]) => {
    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [["ID", "Date", "Department", "Category", "Priority", "Status", "AI summary"]],
      body: issueRows(items),
      styles: { fontSize: 8, cellPadding: 4, textColor: NAVY, valign: "top" },
      headStyles: { fillColor: BLUE, textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: { 0: { cellWidth: 44 }, 1: { cellWidth: 40 }, 2: { cellWidth: 70 }, 3: { cellWidth: 66 }, 4: { cellWidth: 44 }, 5: { cellWidth: 52 } },
      didParseCell: (d) => {
        if (d.section === "body" && d.column.index === 4) {
          const v = String(d.cell.raw);
          d.cell.styles.fontStyle = "bold";
          d.cell.styles.textColor = v === "Critical" ? [225, 29, 72] : v === "High" ? [234, 88, 12] : v === "Medium" ? [180, 130, 0] : [14, 116, 144];
        }
      },
    });
    y = last() + 24;
  };

  if (kind === "executive") {
    heading("Top unresolved critical & high-priority issues");
    issueTable(
      list
        .filter((f) => (f.priority === "Critical" || f.priority === "High") && f.status !== "Resolved")
        .sort((a, b) => b.urgency - a.urgency)
        .slice(0, 10),
    );
  } else if (kind === "department") {
    heading("Open issues");
    issueTable(list.filter((f) => f.status !== "Resolved" && f.sentiment !== "Positive").sort((a, b) => b.urgency - a.urgency).slice(0, 25));
  } else if (kind === "critical") {
    heading("Critical & high-priority log");
    issueTable(list.filter((f) => f.priority === "Critical" || f.priority === "High").sort((a, b) => b.urgency - a.urgency));
  } else {
    heading("All feedback issues");
    issueTable([...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)));
  }

  /* footer */
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    const H = doc.internal.pageSize.getHeight();
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(M, H - 34, W - M, H - 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...SLATE);
    doc.text("CampusPulse AI · Intelligent College Feedback Analyzer", M, H - 20);
    doc.text(`Page ${p} of ${pages}`, W - M, H - 20, { align: "right" });
  }

  const name = `campuspulse-${kind}${department ? "-" + department.toLowerCase().replace(/\s+/g, "-") : ""}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(name);
}
