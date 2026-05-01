"use client";

import { CATEGORIES } from "@/data/categories";
import { TEMPLATES } from "@/data/templates";
import type { ActiveCategory } from "@/types";
import type { User } from "@supabase/supabase-js";

interface SidebarProps {
  activeCategory: ActiveCategory;
  onCategoryChange: (cat: ActiveCategory) => void;
  query: string;
  onQueryChange: (q: string) => void;
  favoriteCount: number;
  customCount: number;
  historyCount: number;
  isOpen: boolean;
  onClose: () => void;
  onOpenBuilder: () => void;
  onOpenTester: () => void;
  onOpenHistory: () => void;
  onExportFavorites: () => void;
  onExportAll: () => void;
  activeView: "library" | "builder" | "tester" | "history";
  user: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
}

export default function Sidebar({
  activeCategory,
  onCategoryChange,
  query,
  onQueryChange,
  favoriteCount,
  customCount,
  historyCount,
  isOpen,
  onClose,
  onOpenBuilder,
  onOpenTester,
  onOpenHistory,
  onExportFavorites,
  onExportAll,
  activeView,
  user,
  onOpenAuth,
  onSignOut,
}: SidebarProps) {
  const handleCat = (id: ActiveCategory) => {
    onCategoryChange(id);
    onClose();
  };

  const navItemClasses = (id: string) =>
    `flex items-center gap-2.5 px-2.5 py-[7px] rounded-md cursor-pointer
     transition-all duration-120 text-[13px] font-normal select-none
     ${
       activeCategory === id
         ? "bg-bg-overlay text-text-primary"
         : "text-text-secondary hover:bg-bg-raised hover:text-text-primary"
     }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-[265px] flex flex-col
          bg-bg-surface border-r border-border-subtle
          overflow-y-auto transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="px-[22px] pt-[26px] pb-[18px] border-b border-border-subtle flex-shrink-0">
          <div className="font-serif-display text-[23px] text-text-primary leading-none tracking-[0.01em]">
            Prompt<span className="text-accent-amber">Forge</span>
          </div>
          <div className="font-code text-[10.5px] text-text-muted tracking-[0.13em] uppercase mt-1.5">
            AI Prompt Template Library
          </div>
        </div>

        {/* Search */}
        <div className="px-3.5 py-3 border-b border-border-subtle flex-shrink-0">
          <div className="relative">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
              width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search templates..."
              className="w-full bg-bg-raised border border-border-subtle rounded-md
                         pl-8 pr-3 py-2 font-sans text-[13px] text-text-primary
                         placeholder:text-text-muted outline-none
                         focus:border-border-muted transition-colors"
            />
          </div>
          <div className="font-code text-[10px] text-text-muted text-right mt-1.5 tracking-[0.04em]">
            press / to focus
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2.5 overflow-y-auto">
          {/* Browse section */}
          <div className="font-code text-[10px] tracking-[0.12em] uppercase text-text-muted px-2.5 py-1.5 mb-1">
            Browse
          </div>

          {/* Build a Template CTA */}
          <button
            onClick={() => { onOpenBuilder(); onClose(); }}
            className={`
              w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-md mb-1
              text-[13px] font-medium transition-all duration-120
              ${activeView === "builder"
                ? "bg-accent-amber/20 text-accent-amber border border-accent-amber/30"
                : "text-accent-amber border border-accent-amber/20 hover:bg-accent-amber/10"
              }
            `}
          >
            <span className="text-[15px] leading-none">＋</span>
            <span className="flex-1 text-left">Build a Template</span>
          </button>

          {/* Test Prompts CTA */}
          <button
            onClick={() => { onOpenTester(); onClose(); }}
            className={`
              w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-md mb-1
              text-[13px] font-medium transition-all duration-120
              ${activeView === "tester"
                ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/30"
                : "text-accent-blue border border-accent-blue/20 hover:bg-accent-blue/10"
              }
            `}
          >
            <span className="text-[15px] leading-none">▶</span>
            <span className="flex-1 text-left">Test Prompts</span>
          </button>

          {/* History CTA */}
          <button
            onClick={() => { onOpenHistory(); onClose(); }}
            className={`
              w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-md mb-2
              text-[13px] font-medium transition-all duration-120
              ${activeView === "history"
                ? "bg-bg-overlay text-text-primary border border-border-muted"
                : "text-text-secondary border border-border-subtle hover:bg-bg-raised hover:text-text-primary"
              }
            `}
          >
            <span className="text-[15px] leading-none">◷</span>
            <span className="flex-1 text-left">History</span>
            {historyCount > 0 && (
              <span className="font-code text-[11px] text-text-muted">{historyCount}</span>
            )}
          </button>

          <button className={navItemClasses("all")} onClick={() => handleCat("all")}>
            <span className="nav-dot w-[7px] h-[7px] rounded-full bg-text-muted flex-shrink-0" />
            <span className="flex-1 text-left">All Templates</span>
            <span className="font-code text-[11px] text-text-muted">{TEMPLATES.length + customCount}</span>
          </button>

          <div className="flex items-center gap-1">
            <button className={`${navItemClasses("favorites")} flex-1`} onClick={() => handleCat("favorites")}>
              <span className="w-[7px] h-[7px] rounded-full bg-accent-amber flex-shrink-0" />
              <span className="flex-1 text-left">Favorites ★</span>
              <span className="font-code text-[11px] text-text-muted">{favoriteCount}</span>
            </button>
            {favoriteCount > 0 && (
              <button
                onClick={onExportFavorites}
                title="Export favorites as markdown"
                className="px-2 py-[7px] text-text-muted hover:text-accent-amber
                           transition-colors text-[11px] font-code flex-shrink-0"
              >
                ↓md
              </button>
            )}
          </div>

          <button className={navItemClasses("custom")} onClick={() => handleCat("custom")}>
            <span className="w-[7px] h-[7px] rounded-full bg-accent-amber/60 flex-shrink-0" />
            <span className="flex-1 text-left">My Templates ✦</span>
            <span className="font-code text-[11px] text-text-muted">{customCount}</span>
          </button>

          {/* Techniques section */}
          <div className="font-code text-[10px] tracking-[0.12em] uppercase text-text-muted px-2.5 py-1.5 mt-3 mb-1">
            Techniques
          </div>

          {CATEGORIES.map((cat) => {
            const count = TEMPLATES.filter((t) => t.cat === cat.id).length;
            return (
              <button
                key={cat.id}
                className={navItemClasses(cat.id)}
                onClick={() => handleCat(cat.id)}
              >
                <span
                  className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                  style={{ background: cat.color }}
                />
                <span className="flex-1 text-left">{cat.label}</span>
                <span className="font-code text-[11px] text-text-muted">{count}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-[22px] py-3.5 border-t border-border-subtle flex-shrink-0">
          <div className="text-[11px] text-text-muted leading-[1.7]">
            {TEMPLATES.length + customCount} templates · v1.0
          </div>
          <button
            onClick={onExportAll}
            className="text-[11px] text-text-muted hover:text-text-secondary
                       transition-colors mt-0.5 underline underline-offset-2"
          >
            Export all as markdown ↓
          </button>

          {/* Auth section */}
          <div className="mt-3 pt-3 border-t border-border-subtle">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Avatar initials */}
                <div className="w-6 h-6 rounded-full bg-accent-amber/20 border border-accent-amber/30
                                flex items-center justify-center flex-shrink-0">
                  <span className="font-code text-[9px] text-accent-amber font-medium">
                    {user.email?.[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-text-secondary truncate">{user.email}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-green flex-shrink-0" />
                    <span className="font-code text-[9px] text-accent-green">synced</span>
                  </div>
                </div>
                <button
                  onClick={onSignOut}
                  className="font-code text-[9px] text-text-muted hover:text-text-primary
                             border border-border-subtle hover:border-border-muted
                             px-1.5 py-0.5 rounded transition-colors flex-shrink-0"
                >
                  out
                </button>
              </div>
            ) : (
              <button
                onClick={() => { onOpenAuth(); onClose(); }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md
                           border border-dashed border-border-subtle hover:border-border-muted
                           text-text-muted hover:text-text-primary transition-colors group"
              >
                <span className="text-[13px]">☁</span>
                <div className="text-left">
                  <div className="text-[11px] font-medium group-hover:text-text-primary transition-colors">
                    Sign in to sync
                  </div>
                  <div className="text-[10px] text-text-muted">
                    Across all your devices
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
