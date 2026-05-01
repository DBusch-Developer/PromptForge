"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Template } from "@/types";
import { useAI } from "@/hooks/useAI";
import { extractVariables, fillVariables } from "@/lib/ai";
import type { HistoryEntry } from "@/hooks/useHistory";
import CategoryBadge from "./CategoryBadge";

interface PromptTesterProps {
  initialTemplate?: Template | null;
  onSaveAsTemplate?: (code: string) => void;
  onAddHistory?: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
}

export default function PromptTester({
  initialTemplate,
  onSaveAsTemplate,
  onAddHistory,
}: PromptTesterProps) {
  const ai = useAI();

  const [prompt, setPrompt]           = useState(initialTemplate?.code ?? "");
  const [varValues, setVarValues]     = useState<Record<string, string>>({});
  const [showVars, setShowVars]       = useState(false);
  const [activePanel, setActivePanel] = useState<"response" | "improve">("response");

  // Track when a run finishes so we can save history
  const prevGenerating = useRef(false);
  const runStartMs = useRef(0);

  const responseEndRef = useRef<HTMLDivElement>(null);

  const variables    = extractVariables(prompt);
  const hasVars      = variables.length > 0;
  const filledPrompt = hasVars ? fillVariables(prompt, varValues) : prompt;
  const hasUnfilled  = hasVars && variables.some((v) => !varValues[v]?.trim());

  // Auto-scroll while streaming
  useEffect(() => {
    if (ai.isGenerating) {
      responseEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [ai.response, ai.improvedPrompt, ai.isGenerating]);

  // Save to history when generation finishes
  useEffect(() => {
    const justFinished = prevGenerating.current && !ai.isGenerating;
    prevGenerating.current = ai.isGenerating;

    if (justFinished && onAddHistory) {
      const content = ai.mode === "run" ? ai.response : ai.improvedPrompt;
      if (content.trim()) {
        onAddHistory({
          prompt: ai.mode === "run" ? filledPrompt : prompt,
          response: content,
          model: ai.selectedModel,
          modelLabel: ai.models.find((m) => m.id === ai.selectedModel)?.label ?? ai.selectedModel,
          mode: ai.mode,
          durationMs: ai.elapsedMs,
          charCount: content.length,
          templateId: initialTemplate?.id,
          templateTitle: initialTemplate?.title,
        });
      }
    }
  }, [ai.isGenerating]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load template when it changes
  useEffect(() => {
    if (initialTemplate) {
      setPrompt(initialTemplate.code);
      setVarValues({});
      setShowVars(false);
      ai.clearResponse();
      ai.clearImproved();
    }
  }, [initialTemplate?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRun = useCallback(() => {
    if (!filledPrompt.trim()) return;
    runStartMs.current = Date.now();
    setActivePanel("response");
    ai.run(filledPrompt);
  }, [filledPrompt, ai]);

  const handleImprove = useCallback(() => {
    if (!prompt.trim()) return;
    runStartMs.current = Date.now();
    setActivePanel("improve");
    ai.improve(prompt);
  }, [prompt, ai]);

  const handleUseImproved = useCallback(() => {
    if (!ai.improvedPrompt) return;
    setPrompt(ai.improvedPrompt);
    ai.clearImproved();
    setVarValues({});
    setActivePanel("response");
  }, [ai]);

  const formatTime = (ms: number) =>
    ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;

  const selectedModelInfo = ai.models.find((m) => m.id === ai.selectedModel);

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-9 py-6 pb-16">

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-medium text-text-primary">Test Prompts</h1>
          <p className="text-[12px] text-text-secondary mt-0.5">
            Run prompts against Groq AI or improve them with AI assistance.
            Powered by <span className="text-accent-green font-medium">Groq</span> — free and fast.
          </p>
        </div>

        {/* Model selector */}
        <div className="flex flex-col gap-1">
          <label className="font-code text-[10px] tracking-widest uppercase text-text-muted">
            Model
          </label>
          <select
            value={ai.selectedModel}
            onChange={(e) => ai.setSelectedModel(e.target.value)}
            disabled={ai.loadingModels}
            className="bg-bg-raised border border-border-subtle rounded-md
                       px-3 py-2 font-code text-[12px] text-text-primary
                       outline-none focus:border-border-muted transition-colors
                       min-w-[240px] cursor-pointer disabled:opacity-60"
          >
            {ai.loadingModels ? (
              <option>Loading models...</option>
            ) : (
              ai.models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}{m.badge ? ` · ${m.badge}` : ""}
                </option>
              ))
            )}
          </select>
          {selectedModelInfo && (
            <span className="text-[11px] text-text-muted">{selectedModelInfo.desc}</span>
          )}
        </div>
      </div>

      {/* Template chip */}
      {initialTemplate && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-bg-surface
                        border border-border-subtle rounded-lg w-fit">
          <CategoryBadge catId={initialTemplate.cat} size="sm" />
          <span className="text-[12px] text-text-secondary">{initialTemplate.title}</span>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* LEFT: Editor */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col bg-bg-surface border border-border-subtle rounded-[10px] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle">
              <span className="font-code text-[10px] tracking-widest uppercase text-text-muted">
                Prompt Editor
              </span>
              <div className="flex items-center gap-2">
                {hasVars && (
                  <button
                    onClick={() => setShowVars((v) => !v)}
                    className={`font-code text-[10px] tracking-wider px-2.5 py-1 rounded border transition-colors
                      ${showVars
                        ? "text-accent-amber border-accent-amber/40 bg-accent-amber/10"
                        : "text-text-muted border-border-subtle hover:text-text-primary"}`}
                  >
                    [ ] {variables.length} variable{variables.length !== 1 ? "s" : ""}
                  </button>
                )}
                <button
                  onClick={() => { setPrompt(""); setVarValues({}); ai.clearResponse(); ai.clearError(); }}
                  className="font-code text-[10px] text-text-muted hover:text-text-primary
                             border border-border-subtle hover:border-border-muted
                             px-2 py-1 rounded transition-colors"
                >
                  clear
                </button>
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Paste or type a prompt here, or click 'Test Prompt' on any card in the library..."
              rows={16}
              className="font-code text-[12px] leading-[1.85] text-[#b8c4e0]
                         bg-bg-raised px-4 py-3 outline-none resize-y min-h-[240px]
                         placeholder:text-text-muted w-full"
            />

            <div className="px-4 py-1.5 border-t border-border-subtle text-right">
              <span className="font-code text-[10px] text-text-muted">{prompt.length} chars</span>
            </div>
          </div>

          {/* Variables */}
          {hasVars && showVars && (
            <div className="bg-bg-surface border border-border-subtle rounded-[10px] overflow-hidden animate-rise">
              <div className="px-4 py-2.5 border-b border-border-subtle flex items-center justify-between">
                <span className="font-code text-[10px] tracking-widest uppercase text-text-muted">
                  Fill Variables
                </span>
                <span className="text-[11px] text-text-muted">
                  {variables.filter((v) => varValues[v]?.trim()).length}/{variables.length} filled
                </span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {variables.map((v) => (
                  <div key={v} className="flex flex-col gap-1">
                    <label className="font-code text-[10px] text-accent-amber">[{v}]</label>
                    <input
                      type="text"
                      value={varValues[v] ?? ""}
                      onChange={(e) => setVarValues((prev) => ({ ...prev, [v]: e.target.value }))}
                      placeholder={`Enter ${v}...`}
                      className="bg-bg-raised border border-border-subtle rounded-md
                                 px-2.5 py-1.5 text-[12px] text-text-primary font-sans
                                 placeholder:text-text-muted outline-none
                                 focus:border-border-muted transition-colors"
                    />
                  </div>
                ))}
              </div>
              {hasUnfilled && (
                <p className="px-4 pb-3 text-[11px] text-text-muted">
                  Unfilled variables will be sent as-is with their [brackets].
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {ai.isGenerating ? (
              <button
                onClick={ai.stop}
                className="flex items-center gap-2 px-4 py-2 rounded-md
                           bg-red-500/20 border border-red-500/40 text-red-300
                           hover:bg-red-500/30 text-[13px] font-medium transition-colors"
              >
                <span className="w-2 h-2 rounded-sm bg-red-400 animate-pulse" />
                Stop generating
              </button>
            ) : (
              <>
                <button
                  onClick={handleRun}
                  disabled={!prompt.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-md
                             bg-accent-blue/20 border border-accent-blue/40 text-accent-blue
                             hover:bg-accent-blue/30 text-[13px] font-medium
                             disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span>▶</span> Run Prompt
                </button>
                <button
                  onClick={handleImprove}
                  disabled={!prompt.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-md
                             bg-accent-amber/10 border border-accent-amber/30 text-accent-amber
                             hover:bg-accent-amber/20 text-[13px] font-medium
                             disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <span>✦</span> Improve with AI
                </button>
              </>
            )}
            {(ai.isGenerating || ai.elapsedMs > 0) && (
              <span className="font-code text-[11px] text-text-muted ml-auto">
                ⏱ {formatTime(ai.elapsedMs)}
              </span>
            )}
          </div>

          {ai.error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg
                            text-[12px] text-red-300 leading-relaxed flex items-start gap-2">
              <span className="flex-1">{ai.error}</span>
              <button onClick={ai.clearError} className="text-red-400 hover:text-red-300 text-[18px] leading-none flex-shrink-0">×</button>
            </div>
          )}
        </div>

        {/* RIGHT: Output */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1 bg-bg-surface border border-border-subtle rounded-lg p-1 w-fit">
            {(["response", "improve"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setActivePanel(p)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-code tracking-wide transition-colors
                  ${activePanel === p ? "bg-bg-overlay text-text-primary" : "text-text-muted hover:text-text-primary"}`}
              >
                {p === "response" ? "Response" : "✦ Improved Prompt"}
                {p === "improve" && ai.improvedPrompt && (
                  <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-accent-amber inline-block" />
                )}
              </button>
            ))}
          </div>

          {activePanel === "response" && (
            <div className="flex flex-col gap-2">
              <OutputPanel
                content={ai.response}
                isStreaming={ai.isGenerating && ai.mode === "run"}
                placeholder="Run a prompt to see the response here..."
                onClear={ai.clearResponse}
                responseRef={responseEndRef}
              />
              {ai.response && !ai.isGenerating && onSaveAsTemplate && (
                <button
                  onClick={() => onSaveAsTemplate(ai.response)}
                  className="flex items-center gap-2 px-4 py-2 rounded-md w-fit
                             bg-accent-green/10 border border-accent-green/30 text-accent-green
                             hover:bg-accent-green/20 font-code text-[11px] transition-colors"
                >
                  ✦ Save as Template ↗
                </button>
              )}
            </div>
          )}

          {activePanel === "improve" && (
            <div className="flex flex-col gap-2">
              <OutputPanel
                content={ai.improvedPrompt}
                isStreaming={ai.isGenerating && ai.mode === "improve"}
                placeholder='Click "Improve with AI" to get an enhanced version of your prompt...'
                onClear={ai.clearImproved}
                responseRef={responseEndRef}
                monoFont
              />
              {ai.improvedPrompt && !ai.isGenerating && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleUseImproved}
                    className="flex items-center gap-2 px-4 py-2 rounded-md
                               bg-accent-amber/20 border border-accent-amber/40 text-accent-amber
                               hover:bg-accent-amber/30 text-[13px] font-medium transition-colors"
                  >
                    ← Use this prompt
                  </button>
                  {onSaveAsTemplate && (
                    <button
                      onClick={() => onSaveAsTemplate(ai.improvedPrompt)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md
                                 bg-accent-green/10 border border-accent-green/30 text-accent-green
                                 hover:bg-accent-green/20 font-code text-[11px] transition-colors"
                    >
                      ✦ Save as Template ↗
                    </button>
                  )}
                  <button
                    onClick={() => navigator.clipboard.writeText(ai.improvedPrompt)}
                    className="px-3 py-2 rounded-md font-code text-[11px] border border-border-subtle
                               text-text-muted hover:text-text-primary hover:border-border-muted transition-colors"
                  >
                    copy
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedModelInfo && (
            <div className="bg-bg-surface border border-border-subtle rounded-[10px] px-4 py-3">
              <div className="font-code text-[10px] tracking-widest uppercase text-text-muted mb-2">Active Model</div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-accent-blue/10 border border-accent-blue/20
                                flex items-center justify-center text-accent-blue text-[13px]">◆</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-text-primary">{selectedModelInfo.label}</span>
                    {selectedModelInfo.badge && (
                      <span className="font-code text-[9px] tracking-wider uppercase
                                       text-accent-green border border-accent-green/30
                                       bg-accent-green/10 px-1.5 py-0.5 rounded">
                        {selectedModelInfo.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    {selectedModelInfo.desc} · Powered by Groq
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OutputPanel({
  content, isStreaming, placeholder, onClear, responseRef, monoFont = false,
}: {
  content: string; isStreaming: boolean; placeholder: string;
  onClear: () => void; responseRef: React.RefObject<HTMLDivElement>; monoFont?: boolean;
}) {
  return (
    <div className="flex flex-col bg-bg-surface border border-border-subtle rounded-[10px] overflow-hidden flex-1 min-h-[360px]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          {isStreaming && <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />}
          <span className="font-code text-[10px] tracking-widest uppercase text-text-muted">
            {isStreaming ? "Generating..." : content ? `${content.length} chars` : "Output"}
          </span>
        </div>
        {content && (
          <div className="flex items-center gap-2">
            <button onClick={() => navigator.clipboard.writeText(content)}
              className="font-code text-[10px] text-text-muted hover:text-text-primary border border-border-subtle hover:border-border-muted px-2 py-1 rounded transition-colors">
              copy
            </button>
            <button onClick={onClear}
              className="font-code text-[10px] text-text-muted hover:text-text-primary border border-border-subtle hover:border-border-muted px-2 py-1 rounded transition-colors">
              clear
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto max-h-[520px] px-4 py-3 code-scroll">
        {content ? (
          <div className={`text-[12.5px] leading-[1.85] text-text-primary whitespace-pre-wrap ${monoFont ? "font-code" : "font-sans"}`}>
            {content}
            {isStreaming && <span className="inline-block w-[2px] h-[14px] bg-accent-green ml-0.5 animate-pulse align-middle" />}
          </div>
        ) : (
          <p className="text-[12px] text-text-muted italic pt-4">{placeholder}</p>
        )}
        <div ref={responseRef} />
      </div>
    </div>
  );
}
