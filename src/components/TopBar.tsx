"use client";

import { getCategoryLabel } from "@/data/categories";
import type { ActiveCategory } from "@/types";

interface TopBarProps {
  activeCategory: ActiveCategory;
  resultCount: number;
  onMenuToggle: () => void;
  activeView: "library" | "builder" | "tester" | "history";
}

function getTitle(cat: ActiveCategory, view: "library" | "builder" | "tester" | "history"): string {
  if (view === "builder") return "Build a Template";
  if (view === "tester")  return "Test Prompts";
  if (view === "history") return "Prompt History";
  if (cat === "all")      return "All Templates";
  if (cat === "favorites") return "Favorites";
  if (cat === "community") return "Community Library 🌐";
  return getCategoryLabel(cat);
}

export default function TopBar({ activeCategory, resultCount, onMenuToggle, activeView }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 bg-bg-base border-b border-border-subtle
                        flex items-center justify-between gap-3
                        px-4 md:px-9 py-5">
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        aria-label="Open navigation menu"
        className="lg:hidden flex flex-col gap-1.5 p-1.5 text-text-secondary
                   hover:text-text-primary transition-colors"
      >
        <span className="block w-5 h-[1.5px] bg-current rounded" />
        <span className="block w-5 h-[1.5px] bg-current rounded" />
        <span className="block w-5 h-[1.5px] bg-current rounded" />
      </button>

      <div className="text-[15px] font-medium text-text-primary">
        {getTitle(activeCategory, activeView)}
      </div>

      {activeView === "library" && (
        <div className="font-code text-[12px] text-text-muted tracking-[0.04em] ml-auto">
          {resultCount} template{resultCount !== 1 ? "s" : ""}
        </div>
      )}
    </header>
  );
}
