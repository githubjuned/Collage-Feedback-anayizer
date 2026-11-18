import type { Analysis, Feedback, Status, User } from "../types";
import { analyzeFeedback as localAnalyzeFeedback } from "./analyzer";
import { buildSeed } from "./seed";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("campuspulse_jwt");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

// Convert backend snake_case response to frontend camelCase Feedback
function mapBackendFeedback(f: any): Feedback {
  return {
    id: f.id,
    studentName: f.student_name,
    anonymous: f.anonymous,
    email: f.email,
    department: f.department,
    year: f.year,
    rating: f.rating,
    text: f.text,
    language: f.language,
    sentiment: f.sentiment,
    score: f.score,
    confidence: f.confidence,
    category: f.category,
    secondaryCategory: f.secondary_category,
    priority: f.priority,
    urgency: f.urgency,
    emotion: f.emotion,
    keywords: Array.isArray(f.keywords) ? f.keywords : [],
    summary: f.summary,
    reasons: Array.isArray(f.reasons) ? f.reasons : [],
    suggestedAction: f.suggested_action,
    suggestedOwner: f.suggested_owner,
    sla: f.sla,
    status: f.status,
    assignee: f.assignee || f.suggested_owner,
    isDemo: Boolean(f.is_demo),
    adminNotes: f.admin_notes,
    createdAt: f.created_at,
  };
}

export async function apiAnalyzeLive(text: string, rating?: number): Promise<Analysis> {
  try {
    const res = await fetch(`${API_BASE}/feedback/analyze-live`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, rating }),
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const d = await res.json();
      return {
        sentiment: d.sentiment,
        score: d.score,
        confidence: d.confidence,
        category: d.category,
        secondaryCategory: d.secondary_category,
        priority: d.priority,
        urgency: d.urgency,
        emotion: d.emotion,
        keywords: d.keywords || [],
        summary: d.summary,
        reasons: d.reasons || [],
        suggestedAction: d.suggested_action,
        suggestedOwner: d.suggested_owner,
        sla: d.sla,
        language: d.language,
      };
    }
  } catch (err) {
    // Graceful offline fallback to local NLP engine
  }
  return localAnalyzeFeedback(text, rating);
}

export async function apiSubmitFeedback(input: {
  studentName?: string;
  anonymous: boolean;
  email?: string;
  department: string;
  year: number;
  rating: number;
  text: string;
}): Promise<Feedback> {
  try {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        student_name: input.studentName,
        anonymous: input.anonymous,
        email: input.email,
        department: input.department,
        year: input.year,
        rating: input.rating,
        text: input.text,
      }),
      signal: AbortSignal.timeout(7000),
    });
    if (res.ok) {
      const data = await res.json();
      return mapBackendFeedback(data);
    }
  } catch (err) {
    // Fallback handled by store
  }
  throw new Error("Unable to reach backend API. Local fallback will be used.");
}

export async function apiFetchFeedback(filters?: {
  status?: string;
  priority?: string;
  category?: string;
  department?: string;
  language?: string;
  isDemo?: string;
  search?: string;
  days?: number;
  sort?: string;
}): Promise<Feedback[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== "All") params.append("status", filters.status);
    if (filters?.priority && filters.priority !== "All") params.append("priority", filters.priority);
    if (filters?.category && filters.category !== "All") params.append("category", filters.category);
    if (filters?.department && filters.department !== "All") params.append("department", filters.department);
    if (filters?.language && filters.language !== "All") params.append("language", filters.language);
    if (filters?.isDemo) params.append("is_demo", filters.isDemo);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.days) params.append("days", String(filters.days));
    if (filters?.sort) params.append("sort", filters.sort);

    const res = await fetch(`${API_BASE}/feedback?${params.toString()}`, {
      headers: getAuthHeader(),
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      return data.map(mapBackendFeedback);
    }
  } catch (err) {
    // Fallback handled by store
  }
  throw new Error("API unreachable");
}

export async function apiUpdateStatus(id: string, status: Status): Promise<void> {
  const res = await fetch(`${API_BASE}/feedback/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
}

export async function apiUpdateAssignee(id: string, assignee: string): Promise<void> {
  const res = await fetch(`${API_BASE}/feedback/${id}/assignee`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ assignee }),
  });
  if (!res.ok) throw new Error("Failed to update assignee");
}

export async function apiAddNotes(id: string, notes: string): Promise<void> {
  const res = await fetch(`${API_BASE}/feedback/${id}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) throw new Error("Failed to add note");
}

export async function apiReseedDemo(): Promise<void> {
  const res = await fetch(`${API_BASE}/feedback/seed-demo`, {
    method: "POST",
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error("Failed to reseed demo");
}

export async function apiClearDemo(): Promise<void> {
  const res = await fetch(`${API_BASE}/feedback/demo`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error("Failed to clear demo");
}

export function getExportCsvUrl(days?: number, isDemo?: string): string {
  const params = new URLSearchParams();
  if (days) params.append("days", String(days));
  if (isDemo) params.append("is_demo", isDemo);
  return `${API_BASE}/export/csv?${params.toString()}`;
}
