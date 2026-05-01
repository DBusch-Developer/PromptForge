"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface UseAuthReturn {
  user:        User | null;
  loading:     boolean;
  signUp:      (email: string, password: string) => Promise<string | null>;
  signIn:      (email: string, password: string) => Promise<string | null>;
  signInMagic: (email: string)                  => Promise<string | null>;
  signOut:     ()                               => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for any auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Returns an error string on failure, null on success
  const signUp = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { error } = await supabase.auth.signUp({ email, password });
      return error ? error.message : null;
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return error ? error.message : null;
    },
    []
  );

  const signInMagic = useCallback(
    async (email: string): Promise<string | null> => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      return error ? error.message : null;
    },
    []
  );

  const signOut = useCallback(async () => {
    // Clear all local data before signing out so the next
    // user that logs in on this device starts completely fresh
    try {
      localStorage.removeItem("promptforge_v1_favs");
      localStorage.removeItem("promptforge_v1_custom");
      localStorage.removeItem("promptforge_v1_history");
    } catch {}
    await supabase.auth.signOut();
  }, []);

  return { user, loading, signUp, signIn, signInMagic, signOut };
}
