"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  dbGetHistory,
  dbAddHistoryEntry,
  dbRemoveHistoryEntry,
  dbClearHistory,
  dbBulkInsertHistory,
} from "@/lib/db";

const LOCAL_KEY = "promptforge_v1_history";
const MAX_LOCAL = 100;

export interface HistoryEntry {
  id:             string;
  prompt:         string;
  response:       string;
  model:          string;
  modelLabel:     string;
  mode:           "run" | "improve";
  timestamp:      number;
  durationMs:     number;
  charCount:      number;
  templateId?:    string;
  templateTitle?: string;
}

function loadLocal(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocal(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(entries.slice(0, MAX_LOCAL)));
  } catch {}
}

function clearLocal() {
  try { localStorage.removeItem(LOCAL_KEY); } catch {}
}

export function useHistory(userId: string | null, authReady: boolean) {
  const [entries, setEntries]   = useState<HistoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const prevUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
    if (userId === prevUserId.current && hydrated) return;
    prevUserId.current = userId;

    setHydrated(false);

    if (!userId) {
      setEntries(loadLocal());
      setHydrated(true);
      return;
    }

    dbGetHistory(userId)
      .then((cloudEntries) => {
        if (cloudEntries.length === 0) {
          const local = loadLocal();
          if (local.length > 0) {
            dbBulkInsertHistory(userId, local)
              .catch(console.error)
              .finally(() => clearLocal());
            setEntries(local);
          } else {
            setEntries([]);
          }
        } else {
          clearLocal();
          setEntries(cloudEntries);
        }
      })
      .catch(() => setEntries(loadLocal()))
      .finally(() => setHydrated(true));
  }, [userId, authReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hydrated && !userId) saveLocal(entries);
  }, [entries, hydrated, userId]);

  const add = useCallback((input: Omit<HistoryEntry, "id" | "timestamp">): HistoryEntry => {
    const entry: HistoryEntry = {
      ...input,
      id:        `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };
    setEntries((prev) => [entry, ...prev].slice(0, MAX_LOCAL));
    if (userId) dbAddHistoryEntry(userId, entry).catch(console.error);
    return entry;
  }, [userId]);

  const remove = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (userId) dbRemoveHistoryEntry(userId, id).catch(console.error);
  }, [userId]);

  const clearAll = useCallback(() => {
    setEntries([]);
    if (userId) dbClearHistory(userId).catch(console.error);
    else clearLocal();
  }, [userId]);

  return { entries, add, remove, clearAll, count: entries.length, hydrated };
}
