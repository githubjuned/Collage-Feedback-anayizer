import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Department, Feedback, Status } from "../types";
import { analyzeFeedback } from "./analyzer";
import { buildSeed } from "./seed";
import {
  apiFetchFeedback, apiSubmitFeedback, apiUpdateStatus,
  apiUpdateAssignee, apiAddNotes, apiReseedDemo, apiClearDemo, checkBackendHealth
} from "./api";

const LOCAL_KEY = "campuspulse.feedback.v2";

export type DemoFilter = "all" | "real" | "demo";

interface Store {
  feedback: Feedback[];
  filteredFeedback: Feedback[];
  isLoading: boolean;
  isOnline: boolean;
  demoFilter: DemoFilter;
  setDemoFilter: (filter: DemoFilter) => void;
  addFeedback: (input: {
    studentName?: string;
    anonymous: boolean;
    email?: string;
    department: Department;
    year: number;
    rating: number;
    text: string;
  }) => Promise<Feedback>;
  updateStatus: (id: string, status: Status) => Promise<void>;
  updateAssignee: (id: string, assignee: string) => Promise<void>;
  addNotes: (id: string, notes: string) => Promise<void>;
  reset: () => Promise<void>;
  clearDemo: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

function loadLocalBackup(): Feedback[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Feedback[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return buildSeed();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [feedback, setFeedback] = useState<Feedback[]>(loadLocalBackup);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [demoFilter, setDemoFilter] = useState<DemoFilter>("all");

  const latest = useRef(feedback);
  latest.current = feedback;

  const loadFromBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      const online = await checkBackendHealth();
      setIsOnline(online);
      if (online) {
        const remote = await apiFetchFeedback();
        if (remote && remote.length) {
          setFeedback(remote);
          localStorage.setItem(LOCAL_KEY, JSON.stringify(remote));
        }
      }
    } catch {
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFromBackend();
  }, [loadFromBackend]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(feedback));
    } catch {
      /* ignore quota */
    }
  }, [feedback]);

  const addFeedback: Store["addFeedback"] = useCallback(async (input) => {
    try {
      if (isOnline) {
        const created = await apiSubmitFeedback(input);
        setFeedback((prev) => [created, ...prev]);
        return created;
      }
    } catch {
      /* Fallback to local analyzer below */
    }

    const a = analyzeFeedback(input.text, input.rating);
    const maxId = latest.current.reduce(
      (m, f) => Math.max(m, parseInt(f.id.replace("CP-", ""), 10) || 0),
      1000
    );
    const localCreated: Feedback = {
      ...a,
      ...input,
      studentName: input.anonymous ? "Anonymous" : input.studentName || "Student",
      id: `CP-${maxId + 1}`,
      createdAt: new Date().toISOString(),
      status: "Open",
      assignee: a.suggestedOwner,
      isDemo: false,
    };
    latest.current = [localCreated, ...latest.current];
    setFeedback((prev) => [localCreated, ...prev]);
    return localCreated;
  }, [isOnline]);

  const updateStatus = useCallback(async (id: string, status: Status) => {
    setFeedback((p) => p.map((f) => (f.id === id ? { ...f, status } : f)));
    if (isOnline) {
      try {
        await apiUpdateStatus(id, status);
      } catch {
        /* local state updated */
      }
    }
  }, [isOnline]);

  const updateAssignee = useCallback(async (id: string, assignee: string) => {
    setFeedback((p) => p.map((f) => (f.id === id ? { ...f, assignee } : f)));
    if (isOnline) {
      try {
        await apiUpdateAssignee(id, assignee);
      } catch {
        /* local state updated */
      }
    }
  }, [isOnline]);

  const addNotes = useCallback(async (id: string, notes: string) => {
    setFeedback((p) => p.map((f) => (f.id === id ? { ...f, adminNotes: notes } : f)));
    if (isOnline) {
      try {
        await apiAddNotes(id, notes);
      } catch {
        /* local state updated */
      }
    }
  }, [isOnline]);

  const reset = useCallback(async () => {
    if (isOnline) {
      try {
        await apiReseedDemo();
        const remote = await apiFetchFeedback();
        setFeedback(remote);
        return;
      } catch {
        /* fallback to seed */
      }
    }
    const s = buildSeed();
    setFeedback(s);
  }, [isOnline]);

  const clearDemo = useCallback(async () => {
    if (isOnline) {
      try {
        await apiClearDemo();
        const remote = await apiFetchFeedback();
        setFeedback(remote);
        return;
      } catch {
        /* fallback */
      }
    }
    setFeedback((prev) => prev.filter((f) => !f.isDemo));
  }, [isOnline]);

  const filteredFeedback = useMemo(() => {
    if (demoFilter === "real") return feedback.filter((f) => !f.isDemo);
    if (demoFilter === "demo") return feedback.filter((f) => f.isDemo);
    return feedback;
  }, [feedback, demoFilter]);

  const value = useMemo(
    () => ({
      feedback,
      filteredFeedback,
      isLoading,
      isOnline,
      demoFilter,
      setDemoFilter,
      addFeedback,
      updateStatus,
      updateAssignee,
      addNotes,
      reset,
      clearDemo,
      refresh: loadFromBackend,
    }),
    [
      feedback,
      filteredFeedback,
      isLoading,
      isOnline,
      demoFilter,
      setDemoFilter,
      addFeedback,
      updateStatus,
      updateAssignee,
      addNotes,
      reset,
      clearDemo,
      loadFromBackend,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}
