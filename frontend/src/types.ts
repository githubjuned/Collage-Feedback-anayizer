export type Sentiment = "Positive" | "Neutral" | "Negative";
export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Status = "Open" | "In Progress" | "Resolved";
export type Language = "en" | "hi" | "mr";

export const CATEGORIES = [
  "Academics",
  "Faculty",
  "Infrastructure",
  "Hostel",
  "Canteen",
  "Transport",
  "Library",
  "IT & Wi-Fi",
  "Administration",
  "Safety",
  "General",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const DEPARTMENTS = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Business Admin",
  "Biotechnology",
  "Mathematics",
  "Architecture",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const PRIORITIES: Priority[] = ["Critical", "High", "Medium", "Low"];
export const STATUSES: Status[] = ["Open", "In Progress", "Resolved"];
export const SENTIMENTS: Sentiment[] = ["Positive", "Neutral", "Negative"];

export interface Analysis {
  sentiment: Sentiment;
  /** -1 .. 1 */
  score: number;
  /** 0 .. 1 */
  confidence: number;
  category: Category;
  secondaryCategory?: Category;
  priority: Priority;
  /** 0 .. 100 urgency score */
  urgency: number;
  emotion: string;
  keywords: string[];
  summary: string;
  reasons: string[];
  suggestedAction: string;
  suggestedOwner: string;
  sla: string;
  language?: Language;
}

export interface Feedback extends Analysis {
  id: string;
  studentName: string;
  anonymous: boolean;
  email?: string;
  department: Department;
  year: number;
  rating: number;
  text: string;
  createdAt: string;
  status: Status;
  assignee: string;
  isDemo?: boolean;
  adminNotes?: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: "admin" | "student";
  department?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
