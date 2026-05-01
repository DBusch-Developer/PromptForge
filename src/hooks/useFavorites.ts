"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  dbGetFavorites,
  dbAddFavorite,
  dbRemoveFavorite,
  dbBulkInsertFavorites,
} from "@/lib/db";

const LOCAL_KEY = "promptforge_v1_favs";

function loadLocal(): Set<string> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

function saveLocal(favs: Set<string>) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify([...favs])); } catch {}
}

function clearLocal() {
  try { localStorage.removeItem(LOCAL_KEY); } catch {}
}

export function useFavorites(userId: string | null, authReady: boolean) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated]   = useState(false);
  const prevUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
    if (userId === prevUserId.current && hydrated) return;
    prevUserId.current = userId;

    setHydrated(false);

    if (!userId) {
      setFavorites(loadLocal());
      setHydrated(true);
      return;
    }

    dbGetFavorites(userId)
      .then((cloudIds) => {
        if (cloudIds.length === 0) {
          const local = loadLocal();
          if (local.size > 0) {
            dbBulkInsertFavorites(userId, [...local])
              .catch(console.error)
              .finally(() => clearLocal());
            setFavorites(local);
          } else {
            setFavorites(new Set());
          }
        } else {
          clearLocal();
          setFavorites(new Set(cloudIds));
        }
      })
      .catch(() => setFavorites(loadLocal()))
      .finally(() => setHydrated(true));
  }, [userId, authReady]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hydrated && !userId) saveLocal(favorites);
  }, [favorites, hydrated, userId]);

  const toggle = useCallback((templateId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
        if (userId) dbRemoveFavorite(userId, templateId).catch(console.error);
      } else {
        next.add(templateId);
        if (userId) dbAddFavorite(userId, templateId).catch(console.error);
      }
      return next;
    });
  }, [userId]);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { favorites, toggle, isFavorite, count: favorites.size, hydrated };
}
