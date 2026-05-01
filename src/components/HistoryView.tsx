"use client";

import { useState, useMemo } from "react";
import type { HistoryEntry } from "@/hooks/useHistory";

interface HistoryViewProps {
  entries: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return "just now";
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 7)   return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function formatDuration(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

export default function HistoryView({
  entries,
  onRestore,
  onDelete,
  onClearAll,
}: HistoryViewProps) {
  const [query, setQuery] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return entries;
    const q = query.toLowerCase();
    return entries.filter(
      (e) =>
        e.prompt.toLowerCase().includes(q) ||
        e.response.toLowerCase().includes(q) ||
        e.modelLabel.toLowerCase().includes(q) ||
        e.templateTitle?.toLowerCase().includes(q)
    );
  }, [entries, query]);

  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-9 py-6 pb-16">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[18px] font-medium text-text-primary">Prompt History</h1>
          <p className="text-[12px] text-text-secondary mt-0.5">
            {entries.length} run{entries.length !== 1 ? "s" : ""} saved · last 100 kept
          </p>
        </div>
        {entries.length > 0 && (
          <div>
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-text-secondary">Sure?</span>
                <button
                  onClick={() => { onClearAll(); setConfirmClear(false); }}
                  className="font-code text-[11px] text-red-400 border border-red-500/40
                             hover:bg-red-500/10 px-2.5 py-1 rounded transition-colors"
                >
                  Yes, clear all
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="font-code text-[11px] text-text-muted border border-border-subtle
                             hover:border-border-muted px-2.5 py-1 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="font-code text-[11px] text-text-muted border border-border-subtle
                           hover:border-border-muted hover:text-text-primary
                           px-3 py-1.5 rounded-md transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="font-code text-[28px] text-text-muted mb-3">[ ]</div>
          <p className="text-[14px] text-text-secondary">No history yet.</p>
          <p className="text-[12px] text-text-muted mt-2">
            Run a prompt in the tester and it will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full bg-bg-surface border border-border-subtle rounded-md
                         pl-9 pr-3 py-2 text-[13px] text-text-primary font-sans
                         placeholder:text-text-muted outline-none focus:border-border-muted
                         transition-colors"
            />
          </div>

          {/* Entries */}
          <div className="flex flex-col gap-2">
            {filtered.length === 0 ? (
              <p className="text-center text-[13px] text-text-muted py-12">
                No results for "{query}"
              </p>
            ) : (
              filtered.map((entry) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                  isExpanded={expandedId === entry.id}
                  onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                  onRestore={() => onRestore(entry)}
                  onDelete={() => onDelete(entry.id)}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── History card ─────────────────────────────────────────────────────────
function HistoryCard({
  entry,
  isExpanded,
  onToggle,
  onRestore,
  onDelete,
}: {
  entry: HistoryEntry;
  isExpanded: boolean;
  onToggle: () => void;
  onRestore: () => void;
  onDelete: () => void;
}) {
  const modeColor = entry.mode === "run" ? "text-accent-blue" : "text-accent-amber";
  const modeLabel = entry.mode === "run" ? "▶ Run" : "✦ Improve";

  return (
    <div className={`bg-bg-surface border rounded-[10px] overflow-hidden transition-colors
                     ${isExpanded ? "border-border-muted" : "border-border-subtle hover:border-border-muted"}`}>

      {/* Card header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 flex items-start gap-3"
      >
        {/* Mode badge */}
        <span className={`font-code text-[10px] flex-shrink-0 mt-0.5 ${modeColor}`}>
          {modeLabel}
        </span>

        {/* Prompt preview */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-text-primary leading-snug line-clamp-2 text-left">
            {entry.prompt.slice(0, 200)}
          </p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="font-code text-[10px] text-text-muted">
              {entry.modelLabel}
            </span>
            {entry.templateTitle && (
              <span className="font-code text-[10px] text-text-muted">
                · {entry.templateTitle}
              </span>
            )}
            <span className="font-code text-[10px] text-text-muted">
              · {entry.charCount} chars
            </span>
            <span className="font-code text-[10px] text-text-muted">
              · {formatDuration(entry.durationMs)}
            </span>
          </div>
        </div>

        {/* Timestamp */}
        <span className="font-code text-[10px] text-text-muted flex-shrink-0 mt-0.5">
          {timeAgo(entry.timestamp)}
        </span>

        {/* Chevron */}
        <span className={`text-text-muted flex-shrink-0 transition-transform duration-200 text-[10px] mt-1
                          ${isExpanded ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border-subtle animate-rise">
          {/* Prompt */}
          <div className="px-4 py-3 border-b border-border-subtle">
            <div className="font-code text-[10px] tracking-widest uppercase text-text-muted mb-2">
              Prompt
            </div>
            <pre className="font-code text-[11px] leading-[1.75] text-[#b8c4e0]
                            whitespace-pre-wrap max-h-40 overflow-y-auto code-scroll">
              {entry.prompt}
            </pre>
          </div>

          {/* Response */}
          <div className="px-4 py-3 border-b border-border-subtle">
            <div className="font-code text-[10px] tracking-widest uppercase text-text-muted mb-2">
              Response
            </div>
            <pre className="font-sans text-[12px] leading-[1.75] text-text-primary
                            whitespace-pre-wrap max-h-48 overflow-y-auto code-scroll">
              {entry.response}
            </pre>
          </div>

          {/* Actions */}
          <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
            <button
              onClick={onRestore}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md
                         bg-accent-blue/10 border border-accent-blue/30 text-accent-blue
                         hover:bg-accent-blue/20 font-code text-[11px] transition-colors"
            >
              ↩ Restore in tester
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(entry.response)}
              className="px-3 py-1.5 rounded-md border border-border-subtle
                         font-code text-[11px] text-text-muted hover:text-text-primary
                         hover:border-border-muted transition-colors"
            >
              Copy response
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(entry.prompt)}
              className="px-3 py-1.5 rounded-md border border-border-subtle
                         font-code text-[11px] text-text-muted hover:text-text-primary
                         hover:border-border-muted transition-colors"
            >
              Copy prompt
            </button>
            <button
              onClick={onDelete}
              className="ml-auto px-3 py-1.5 rounded-md border border-border-subtle
                         font-code text-[11px] text-text-muted hover:text-red-400
                         hover:border-red-500/40 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
