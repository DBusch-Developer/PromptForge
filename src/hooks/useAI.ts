"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  streamGenerate,
  buildImprovePrompt,
  DEFAULT_MODEL,
  GROQ_MODELS,          // used as fallback only
  type AIModel,
} from "@/lib/ai";

export type GenerateMode = "run" | "improve";

export interface UseAIReturn {
  models: AIModel[];
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  loadingModels: boolean;

  response: string;
  improvedPrompt: string;
  isGenerating: boolean;
  mode: GenerateMode;
  elapsedMs: number;

  run: (prompt: string) => Promise<void>;
  improve: (prompt: string) => Promise<void>;
  stop: () => void;
  clearResponse: () => void;
  clearImproved: () => void;

  error: string | null;
  clearError: () => void;
}

export function useAI(): UseAIReturn {
  const [models, setModels]               = useState<AIModel[]>(GROQ_MODELS);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [loadingModels, setLoadingModels] = useState(true);
  const [response, setResponse]           = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [isGenerating, setIsGenerating]   = useState(false);
  const [mode, setMode]                   = useState<GenerateMode>("run");
  const [elapsedMs, setElapsedMs]         = useState(0);
  const [error, setError]                 = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  // ── Fetch live model list from Groq on mount ──────────────────────────
  useEffect(() => {
    async function loadModels() {
      try {
        const res = await fetch("/api/models");
        if (!res.ok) throw new Error("Failed to fetch models");
        const data = await res.json();
        if (data.models?.length > 0) {
          setModels(data.models);
          // Keep current selection if it's still valid, else default to first
          setSelectedModel((prev) =>
            data.models.some((m: AIModel) => m.id === prev)
              ? prev
              : data.models[0].id
          );
        }
      } catch {
        // Silently fall back to the hardcoded list — still usable
      } finally {
        setLoadingModels(false);
      }
    }
    loadModels();
  }, []);

  // ── Timer helpers ─────────────────────────────────────────────────────
  const startTimer = () => {
    startRef.current = Date.now();
    setElapsedMs(0);
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 100);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setElapsedMs(Date.now() - startRef.current);
  };

  // ── Stream handler ────────────────────────────────────────────────────
  const stream = useCallback(
    async (prompt: string, generatingMode: GenerateMode) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsGenerating(true);
      setMode(generatingMode);
      setError(null);
      startTimer();

      if (generatingMode === "run") setResponse("");
      else setImprovedPrompt("");

      const setter = generatingMode === "run" ? setResponse : setImprovedPrompt;

      try {
        for await (const chunk of streamGenerate({
          prompt,
          model: selectedModel,
          signal: controller.signal,
        })) {
          setter((prev) => prev + chunk);
        }
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        stopTimer();
        setIsGenerating(false);
      }
    },
    [selectedModel]
  );

  const run     = useCallback((p: string) => stream(p, "run"),                         [stream]);
  const improve = useCallback((p: string) => stream(buildImprovePrompt(p), "improve"), [stream]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    stopTimer();
    setIsGenerating(false);
  }, []);

  const clearResponse = useCallback(() => setResponse(""),       []);
  const clearImproved = useCallback(() => setImprovedPrompt(""), []);
  const clearError    = useCallback(() => setError(null),        []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    models,
    selectedModel,
    setSelectedModel,
    loadingModels,
    response,
    improvedPrompt,
    isGenerating,
    mode,
    elapsedMs,
    run,
    improve,
    stop,
    clearResponse,
    clearImproved,
    error,
    clearError,
  };
}

