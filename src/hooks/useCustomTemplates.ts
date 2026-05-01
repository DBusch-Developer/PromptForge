"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Template } from "@/types";
import {
  dbGetCustomTemplates,
  dbAddCustomTemplate,
  dbUpdateCustomTemplate,
  dbRemoveCustomTemplate,
  dbBulkInsertCustomTemplates,
  dbSetShared,
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
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(templates));
  } catch {}
}

function clearLocal() {
  try { localStorage.removeItem(LOCAL_KEY); } catch {}
}

export function useCustomTemplates(userId: string | null, authReady: boolean) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [hydrated, setHydrated]   = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const prevUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
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
          // New account — check for local templates to migrate
          const local = loadLocal();
          if (local.length > 0) {
            dbBulkInsertCustomTemplates(userId, local)
              .then(() => {
                clearLocal();
                console.log("Migrated", local.length, "local templates to Supabase");
              })
              .catch((err) => {
                console.error("Migration failed:", err);
                setSaveError("Could not sync local templates to cloud: " + err.message);
              });
            setTemplates(local);
          } else {
            setTemplates([]);
          }
        } else {
          // Returning user — cloud wins
          clearLocal();
          setTemplates(cloudTemplates);
        }
      })
      .catch((err) => {
        console.error("Failed to load templates from Supabase:", err);
        // Fall back to local
        setTemplates(loadLocal());
      })
      .finally(() => setHydrated(true));
  }, [userId, authReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // Always keep localStorage in sync as a safety net,
  // even when logged in — cleared on successful Supabase load
  useEffect(() => {
    if (hydrated && templates.length > 0) {
      saveLocal(templates);
    }
  }, [templates, hydrated]);

  const add = useCallback((input: CustomTemplateInput): Template => {
    const newTemplate: Template = {
      id: `custom_${Date.now()}`,
      ...input,
    };

    // Update UI immediately
    setTemplates((prev) => {
      const updated = [newTemplate, ...prev];
      saveLocal(updated); // backup immediately
      return updated;
    });

    // Save to Supabase if logged in
    if (userId) {
      setSaveError(null);
      dbAddCustomTemplate(userId, newTemplate)
        .then(() => {
          console.log("Template saved to Supabase:", newTemplate.id);
        })
        .catch((err) => {
          console.error("Failed to save template to Supabase:", err);
          setSaveError(
            "Template saved locally but failed to sync to cloud. " +
            "It may be lost if you sign out. Error: " + err.message
          );
        });
    }

    return newTemplate;
  }, [userId]);

  const update = useCallback((id: string, input: CustomTemplateInput) => {
    setTemplates((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== id) return t;
        const updatedTemplate = { ...t, ...input };
        if (userId) {
          dbUpdateCustomTemplate(userId, updatedTemplate)
            .catch((err) => {
              console.error("Failed to update template in Supabase:", err);
              setSaveError("Template updated locally but failed to sync: " + err.message);
            });
        }
        return updatedTemplate;
      });
      saveLocal(updated);
      return updated;
    });
  }, [userId]);

  const remove = useCallback((id: string) => {
    setTemplates((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveLocal(updated);
      return updated;
    });
    if (userId) {
      dbRemoveCustomTemplate(userId, id)
        .catch((err) => console.error("Failed to delete template from Supabase:", err));
    }
  }, [userId]);

  const toggleShare = useCallback(
    (id: string, isShared: boolean, authorName?: string) => {
      setTemplates((prev) => {
        const updated = prev.map((t) =>
          t.id === id ? { ...t, isShared, authorName } : t
        );
        saveLocal(updated);
        return updated;
      });
      if (userId) {
        dbSetShared(userId, id, isShared, authorName)
          .catch((err) => console.error("Failed to update sharing:", err));
      }
    },
    [userId]
  );

  const isCustom = useCallback(
    (id: string) => templates.some((t) => t.id === id),
    [templates]
  );

  return {
    templates,
    add,
    update,
    remove,
    toggleShare,
    isCustom,
    count: templates.length,
    hydrated,
    saveError,
    clearSaveError: () => setSaveError(null),
  };
}
