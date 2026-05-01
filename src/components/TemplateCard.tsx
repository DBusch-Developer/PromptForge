"use client";

import type { Template } from "@/types";
import { getCategoryColor } from "@/data/categories";
import CategoryBadge from "./CategoryBadge";
import CopyButton from "./CopyButton";

interface TemplateCardProps {
  template: Template;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isCustom?: boolean;
  onEdit?: (template: Template) => void;
  onDelete?: (id: string) => void;
  onTest?: (template: Template) => void;
}

export default function TemplateCard({
  template,
  index,
  isFavorite,
  onToggleFavorite,
  isCustom = false,
  onEdit,
  onDelete,
  onTest,
}: TemplateCardProps) {
  const color = getCategoryColor(template.cat);
  const delay = Math.min(index * 28, 280); // cap at 280ms for large grids

  return (
    <article
      className="animate-rise flex flex-col bg-bg-surface border border-border-subtle rounded-[10px] overflow-hidden
                 transition-colors duration-200 hover:border-border-muted"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Category stripe */}
      <div className="h-[2px] w-full flex-shrink-0" style={{ background: color }} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2.5">
        <div className="flex flex-col gap-2 min-w-0">
          <CategoryBadge catId={template.cat} />
          <h2 className="text-[14.5px] font-medium text-text-primary leading-snug">
            {template.title}
          </h2>
        </div>

        {/* Favorite star */}
        <button
          onClick={() => onToggleFavorite(template.id)}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={`
            flex-shrink-0 mt-0.5 text-lg leading-none transition-all duration-150
            hover:scale-110 active:scale-95
            ${isFavorite ? "text-accent-amber" : "text-text-muted hover:text-accent-amber"}
          `}
        >
          ★
        </button>
      </div>

      {/* Description */}
      <p className="px-4 pb-3 text-[13px] text-text-secondary leading-relaxed">
        {template.desc}
      </p>

      {/* Code block */}
      <div className="mx-4 mb-3 border border-border-subtle rounded-lg overflow-hidden relative">
        <pre
          className="code-scroll bg-bg-raised px-4 py-3 font-code text-[11.5px]
                     leading-[1.85] text-[#b8c4e0] overflow-x-auto max-h-64 overflow-y-auto
                     whitespace-pre"
        >
          {template.code}
        </pre>
        <CopyButton text={template.code} />
      </div>

      {template.tip && (
        <div
          className="mx-4 mb-3 px-3 py-2 bg-bg-raised border-l-2 rounded-r-md
                     text-[12px] text-text-secondary leading-relaxed"
          style={{ borderColor: color + "66" }}
          dangerouslySetInnerHTML={{ __html: template.tip }}
        />
      )}

      {/* Community shared badge */}
      {template.isShared && template.authorName && !isCustom && (
        <div className="mx-4 mb-2 flex items-center gap-1.5">
          <span className="font-code text-[9px] tracking-widest uppercase
                           text-accent-green border border-accent-green/30
                           bg-accent-green/10 px-2 py-0.5 rounded">
            🌐 Community
          </span>
          <span className="text-[11px] text-text-muted">by {template.authorName}</span>
        </div>
      )}

      {/* Test button */}
      <div className="mx-4 mb-3 flex items-center">
        <button
          onClick={() => onTest?.(template)}
          className="flex items-center gap-1.5 font-code text-[10px] tracking-wider
                     text-accent-blue border border-accent-blue/30 bg-accent-blue/10
                     hover:bg-accent-blue/20 px-3 py-1.5 rounded-md transition-colors"
        >
          <span>▶</span> Test Prompt
        </button>
      </div>

      {/* Custom template controls */}
      {isCustom && (
        <div className="mx-4 mb-4 flex items-center gap-2">
          <span className="font-code text-[9px] tracking-widest uppercase
                           text-accent-amber border border-accent-amber/30
                           bg-accent-amber/10 px-2 py-0.5 rounded">
            ✦ Custom
          </span>
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => onEdit?.(template)}
              className="font-code text-[10px] text-text-muted hover:text-text-primary
                         border border-border-subtle hover:border-border-muted
                         px-2 py-1 rounded transition-colors"
            >
              edit
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete "${template.title}"?`)) onDelete?.(template.id);
              }}
              className="font-code text-[10px] text-text-muted hover:text-red-400
                         border border-border-subtle hover:border-red-500/40
                         px-2 py-1 rounded transition-colors"
            >
              delete
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
