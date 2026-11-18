import { useState } from "react";
import {
  X, Clock, Building2, User, Mail, Sparkles, AlertOctagon, CheckCircle2,
  Calendar, MessageSquare, Tag, FileText, Send, Share2, Check, Shield
} from "lucide-react";
import type { Feedback, Status } from "../types";
import { PriorityBadge, SentimentBadge, StatusBadge, Stars, timeAgo } from "./ui";
import { useStore } from "../lib/store";
import { useAuth } from "../lib/auth";

const TEAMS = [
  "Academic Affairs",
  "Head of Department",
  "Facilities Team",
  "Hostel Administration",
  "Mess Committee",
  "Transport Office",
  "Library Services",
  "IT Services",
  "Registrar Office",
  "Security Office",
  "Student Affairs",
];

export function IssueDetailDrawer({
  feedback,
  onClose,
}: {
  feedback: Feedback | null;
  onClose: () => void;
}) {
  const { updateStatus, updateAssignee, addNotes } = useStore();
  const { isAdmin } = useAuth();
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!feedback) return null;

  const handleStatusChange = async (s: Status) => {
    await updateStatus(feedback.id, s);
  };

  const handleAssigneeChange = async (a: string) => {
    await updateAssignee(feedback.id, a);
  };

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    await addNotes(feedback.id, noteText.trim());
    setNoteText("");
    setSavingNote(false);
  };

  const copyId = () => {
    navigator.clipboard?.writeText(feedback.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const langLabels = { en: "English", hi: "Hindi (हिंदी)", mr: "Marathi (मराठी)" };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl animate-slide-in flex flex-col">
          {/* Header */}
          <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-bold text-blue-700">{feedback.id}</span>
                <button
                  onClick={copyId}
                  className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50"
                  title="Copy Ticket ID"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-600 inline" /> : <Share2 className="h-3 w-3 inline" />}
                </button>
                {feedback.isDemo && (
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                    Demo Seed
                  </span>
                )}
                {feedback.language && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    {langLabels[feedback.language as keyof typeof langLabels] || feedback.language}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge value={feedback.status} />
              <PriorityBadge value={feedback.priority} />
              <SentimentBadge value={feedback.sentiment} />
              <span className="ml-auto text-xs text-slate-500">
                <Clock className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
                {timeAgo(feedback.createdAt)}
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Student metadata */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-xs sm:grid-cols-4">
              <div>
                <span className="text-slate-400 block font-medium">Submitted by</span>
                <span className="font-semibold text-slate-800">
                  {feedback.anonymous ? "Anonymous Student" : feedback.studentName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Department</span>
                <span className="font-semibold text-slate-800">{feedback.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Year</span>
                <span className="font-semibold text-slate-800">Year {feedback.year}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Experience</span>
                <div className="mt-0.5"><Stars rating={feedback.rating} /></div>
              </div>
            </div>

            {/* Student Message */}
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Student Response
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-sm leading-relaxed text-slate-800 shadow-sm">
                "{feedback.text}"
              </div>
            </div>

            {/* AI Analysis Card */}
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-blue-100/70 pb-3">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
                  <Sparkles className="h-4 w-4 text-blue-600" /> AI Triage & Assessment
                </div>
                <span className="text-xs font-medium text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-full">
                  {Math.round(feedback.confidence * 100)}% Confidence
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
                <div>
                  <span className="text-slate-500">Domain Category</span>
                  <div className="mt-1 font-semibold text-slate-800">{feedback.category}</div>
                </div>
                <div>
                  <span className="text-slate-500">Detected Emotion</span>
                  <div className="mt-1 font-semibold text-slate-800">{feedback.emotion}</div>
                </div>
                <div>
                  <span className="text-slate-500">Urgency Meter</span>
                  <div className="mt-1 font-semibold text-slate-800">{feedback.urgency}/100</div>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-4 rounded-xl bg-white p-3 text-xs text-slate-700 ring-1 ring-slate-100">
                <span className="font-semibold text-slate-900">Executive Summary: </span>
                {feedback.summary}
              </div>

              {/* Priority reasons */}
              {feedback.reasons && feedback.reasons.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs font-medium text-slate-500">Classification Drivers:</span>
                  <ul className="mt-1 space-y-1">
                    {feedback.reasons.map((r) => (
                      <li key={r} className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Keywords */}
              {feedback.keywords && feedback.keywords.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Tag className="h-3 w-3 text-slate-400" />
                  {feedback.keywords.map((kw) => (
                    <span key={kw} className="rounded-md bg-blue-100/70 px-2 py-0.5 text-[11px] font-medium text-blue-800">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Suggested Remediation & SLA */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Remediation & SLA Commitment
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-slate-400">Responsible Department</div>
                    <div className="font-semibold text-slate-800">{feedback.suggestedOwner}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-slate-400">Target SLA</div>
                    <div className="font-semibold text-slate-800">{feedback.sla}</div>
                  </div>
                </div>

                <div className="mt-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Recommended Action: </span>
                  {feedback.suggestedAction}
                </div>
              </div>
            </div>

            {/* Management & Status Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Workflow Resolution
                </span>
                {!isAdmin && (
                  <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                    Admin access enables modifications
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Ticket Status</label>
                  <select
                    disabled={!isAdmin}
                    value={feedback.status}
                    onChange={(e) => handleStatusChange(e.target.value as Status)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-500 disabled:opacity-60"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Assigned Team</label>
                  <select
                    disabled={!isAdmin}
                    value={feedback.assignee || feedback.suggestedOwner}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-500 disabled:opacity-60"
                  >
                    {TEAMS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Internal Administrative Notes
                </label>
                {feedback.adminNotes && (
                  <div className="mb-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-100">
                    {feedback.adminNotes}
                  </div>
                )}
                {isAdmin && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add an internal follow-up note..."
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-400"
                    />
                    <button
                      onClick={handleSaveNote}
                      disabled={savingNote || !noteText.trim()}
                      className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                    >
                      {savingNote ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
