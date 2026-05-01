"use client";

import { useState, useEffect, useCallback } from "react";
import type { ActiveCategory, Template } from "@/types";
import { filterTemplates, TEMPLATES } from "@/data/templates";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useCustomTemplates } from "@/hooks/useCustomTemplates";
import { useHistory } from "@/hooks/useHistory";
import type { CustomTemplateInput } from "@/hooks/useCustomTemplates";
import type { HistoryEntry } from "@/hooks/useHistory";
import { exportFavoritesAsMarkdown, exportAllAsMarkdown } from "@/lib/export";
import { dbGetSharedTemplates } from "@/lib/db";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import TemplateCard from "@/components/TemplateCard";
import EmptyState from "@/components/EmptyState";
import TemplateBuilder from "@/components/TemplateBuilder";
import PromptTester from "@/components/PromptTester";
import HistoryView from "@/components/HistoryView";
import AuthModal from "@/components/AuthModal";

type ActiveView = "library" | "builder" | "tester" | "history";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>("all");
  const [query, setQuery]                   = useState("");
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [activeView, setActiveView]         = useState<ActiveView>("library");
  const [editingTemplate, setEditingTemplate]   = useState<Template | null>(null);
  const [testingTemplate, setTestingTemplate]   = useState<Template | null>(null);
  const [prefilledCode, setPrefilledCode]       = useState<string>("");
  const [authOpen, setAuthOpen]                 = useState(false);
  const [communityTemplates, setCommunityTemplates] = useState<Template[]>([]);

  const { user, loading: authLoading, signIn, signUp, signInMagic, signOut } = useAuth();
  const userId = user?.id ?? null;

  const { favorites, toggle, isFavorite, count: favCount } = useFavorites(userId, !authLoading);
  const {
    templates: customTemplates,
    add: addCustom,
    update: updateCustom,
    remove: removeCustom,
    toggleShare,
    isCustom,
    count: customCount,
    saveError: templateSaveError,
  } = useCustomTemplates(userId, !authLoading);
  const history = useHistory(userId, !authLoading);

  // Load community templates
  useEffect(() => {
    dbGetSharedTemplates()
      .then(setCommunityTemplates)
      .catch(console.error);
  }, []);

  // Refresh community templates when user shares/unshares
  const refreshCommunity = useCallback(() => {
    dbGetSharedTemplates().then(setCommunityTemplates).catch(console.error);
  }, []);

  // Keyboard shortcut: / focuses search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      }
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setAuthOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const filtered = activeCategory === "community"
    ? communityTemplates.filter((t) => {
        const q = query.toLowerCase().trim();
        return q ? [t.title, t.desc, t.code].join(" ").toLowerCase().includes(q) : true;
      })
    : filterTemplates(query, activeCategory, favorites, customTemplates);

  const favoriteTemplates = [...TEMPLATES, ...customTemplates].filter((t) =>
    favorites.has(t.id)
  );

  // ── Navigation ────────────────────────────────────────────────────────
  const handleCategoryChange = useCallback((cat: ActiveCategory) => {
    setActiveCategory(cat);
    setQuery("");
    setActiveView("library");
  }, []);

  const handleOpenBuilder = useCallback((template?: Template, code?: string) => {
    setEditingTemplate(template ?? null);
    setPrefilledCode(code ?? "");
    setActiveView("builder");
  }, []);

  const handleOpenTester = useCallback((template?: Template) => {
    setTestingTemplate(template ?? null);
    setActiveView("tester");
  }, []);

  const handleOpenHistory = useCallback(() => setActiveView("history"), []);

  const handleToggleShare = useCallback((id: string, isShared: boolean, authorName?: string) => {
    toggleShare(id, isShared, authorName);
    setTimeout(refreshCommunity, 500); // refresh community list after share
  }, [toggleShare, refreshCommunity]);

  // ── Builder ───────────────────────────────────────────────────────────
  const handleSave = useCallback((input: CustomTemplateInput) => {
    addCustom(input);
    setPrefilledCode("");
    setActiveView("library");
    setActiveCategory("custom");
  }, [addCustom]);

  const handleUpdate = useCallback((id: string, input: CustomTemplateInput) => {
    updateCustom(id, input);
    setActiveView("library");
    setEditingTemplate(null);
    setPrefilledCode("");
  }, [updateCustom]);

  const handleCancel = useCallback(() => {
    setActiveView("library");
    setEditingTemplate(null);
    setTestingTemplate(null);
    setPrefilledCode("");
  }, []);

  // ── Tester ────────────────────────────────────────────────────────────
  const handleSaveAsTemplate = useCallback((code: string) => {
    handleOpenBuilder(undefined, code);
  }, [handleOpenBuilder]);

  const handleRestoreHistory = useCallback((entry: HistoryEntry) => {
    setTestingTemplate({
      id:    entry.id,
      cat:   "meta",
      title: "Restored from history",
      desc:  "",
      code:  entry.prompt,
    });
    setActiveView("tester");
  }, []);

  // ── Export ────────────────────────────────────────────────────────────
  const handleExportFavorites = useCallback(() => {
    exportFavoritesAsMarkdown(favoriteTemplates);
  }, [favoriteTemplates]);

  const handleExportAll = useCallback(() => {
    exportAllAsMarkdown([...TEMPLATES, ...customTemplates]);
  }, [customTemplates]);

  // ── Auth ──────────────────────────────────────────────────────────────
  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  // Don't render until we know auth state (prevents flash)
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-base">
        <div className="font-code text-[12px] text-text-muted animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        query={query}
        onQueryChange={setQuery}
        favoriteCount={favCount}
        customCount={customCount}
        historyCount={history.count}
        communityCount={communityTemplates.length}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenBuilder={() => handleOpenBuilder()}
        onOpenTester={() => handleOpenTester()}
        onOpenHistory={handleOpenHistory}
        onExportFavorites={handleExportFavorites}
        onExportAll={handleExportAll}
        activeView={activeView}
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
        onSignOut={handleSignOut}
      />

      <div className="flex flex-col flex-1 min-h-screen lg:ml-[265px]">
        <TopBar
          activeCategory={activeCategory}
          resultCount={filtered.length}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          activeView={activeView}
        />

        <main className="flex-1">
          {activeView === "builder" && (
            <TemplateBuilder
              editingTemplate={editingTemplate}
              initialCode={prefilledCode}
              onSave={handleSave}
              onUpdate={handleUpdate}
              onToggleShare={handleToggleShare}
              onCancel={handleCancel}
              userEmail={user?.email}
            />
          )}

          {activeView === "tester" && (
            <PromptTester
              initialTemplate={testingTemplate}
              onSaveAsTemplate={handleSaveAsTemplate}
              onAddHistory={history.add}
            />
          )}

          {activeView === "history" && (
            <HistoryView
              entries={history.entries}
              onRestore={handleRestoreHistory}
              onDelete={history.remove}
              onClearAll={history.clearAll}
            />
          )}

          {activeView === "library" && (
            <div className="px-4 md:px-9 py-6 pb-16">
              {filtered.length === 0 ? (
                <EmptyState query={query} category={activeCategory} />
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5">
                  {filtered.map((template, index) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      index={index}
                      isFavorite={isFavorite(template.id)}
                      onToggleFavorite={toggle}
                      isCustom={isCustom(template.id)}
                      onEdit={activeCategory !== "community" ? handleOpenBuilder : undefined}
                      onDelete={activeCategory !== "community" ? removeCustom : undefined}
                      onTest={handleOpenTester}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Auth modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSignIn={signIn}
        onSignUp={signUp}
        onMagicLink={signInMagic}
      />
      {/* Sync error banner */}
      {templateSaveError && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm px-4 py-3
                        bg-red-500/10 border border-red-500/40 rounded-lg
                        text-[12px] text-red-300 leading-relaxed shadow-lg">
          <p className="font-medium mb-1">Sync warning</p>
          <p>{templateSaveError}</p>
        </div>
      )}
    </div>
  );
}
