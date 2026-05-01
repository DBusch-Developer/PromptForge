"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Template } from "@/types";
import {
  dbGetCustomTemplates,
  dbAddCustomTemplate,
  dbUpdateCustomTemplate,
  dbRemoveCustomTemplate,
  dbBulkInsertCustomTemplates,
} from "@/lib/db";

const LOCAL_KEY = "promptforge_v1_custom";

export interface CustomTemplateInput {
  title: string;
  cat:   string;
  desc:  string;
  code:  string;
  tip?:  string;
}

function loadLocal(): Template[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocal(templates: Template[]) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(templates)); } catch {}
}

function clearLocal() {
  try { localStorage.removeItem(LOCAL_KEY); } catch {}
}

export function useCustomTemplates(userId: string | null, authReady: boolean) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [hydrated, setHydrated]   = useState(false);
  const prevUserId = useRef<string | null>(null);

  useEffect(() => {
    // Don't do anything until auth has fully resolved
    if (!authReady) return;

    // If userId hasn't actually changed, don't re-fetch
    if (userId === prevUserId.current && hydrated) return;
    prevUserId.current = userId;

    setHydrated(false);

    if (!userId) {
      setTemplates(loadLocal());
      setHydrated(true);
      return;
    }

    dbGetCustomTemplates(userId)
      .then((cloudTemplates) => {
        if (cloudTemplates.length === 0) {
          const local = loadLocal();
          if (local.length > 0) {
            dbBulkInsertCustomTemplates(userId, local)
              .catch(console.error)
              .finally(() => clearLocal());
            setTemplates(local);
          } else {
            setTemplates([]);
          }
        } else {
          clearLocal();
          setTemplates(cloudTemplates);
        }
      })
      .catch(() => setTemplates(loadLocal()))
      .finally(() => setHydrated(true));
  }, [userId, authReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hydrated && !userId) saveLocal(templates);
  }, [templates, hydrated, userId]);

  const add = useCallback((input: CustomTemplateInput): Template => {
    const newTemplate: Template = {
      id: `custom_${Date.now()}`,
      ...input,
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    if (userId) dbAddCustomTemplate(userId, newTemplate).catch(console.error);
    return newTemplate;
  }, [userId]);

  const update = useCallback((id: string, input: CustomTemplateInput) => {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...input };
        if (userId) dbUpdateCustomTemplate(userId, updated).catch(console.error);
        return updated;
      })
    );
  }, [userId]);

  const remove = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (userId) dbRemoveCustomTemplate(userId, id).catch(console.error);
  }, [userId]);

  const isCustom = useCallback(
    (id: string) => templates.some((t) => t.id === id),
    [templates]
  );

  return { templates, add, update, remove, isCustom, count: templates.length, hydrated };
}
