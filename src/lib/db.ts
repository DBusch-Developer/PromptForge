import { supabase } from "@/lib/supabase";
import type { Template } from "@/types";
import type { HistoryEntry } from "@/hooks/useHistory";

// ─── Type helpers ─────────────────────────────────────────────────────────

// Supabase stores `desc` as `description` (desc is a reserved SQL word)
function templateToRow(userId: string, t: Template) {
  return {
    id:          t.id,
    user_id:     userId,
    title:       t.title,
    cat:         t.cat,
    description: t.desc,
    code:        t.code,
    tip:         t.tip ?? null,
    is_shared:   t.isShared ?? false,
    author_name: t.authorName ?? null,
  };
}

function rowToTemplate(row: Record<string, unknown>): Template {
  return {
    id:         row.id          as string,
    cat:        row.cat         as string,
    title:      row.title       as string,
    desc:       row.description as string,
    code:       row.code        as string,
    tip:        row.tip         as string | undefined,
    isShared:   row.is_shared   as boolean | undefined,
    authorName: row.author_name as string | undefined,
  };
}

// ─── Custom Templates ─────────────────────────────────────────────────────

export async function dbGetSharedTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from("custom_templates")
    .select("*")
    .eq("is_shared", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToTemplate);
}

export async function dbSetShared(
  userId: string,
  templateId: string,
  isShared: boolean,
  authorName?: string
): Promise<void> {
  const { error } = await supabase
    .from("custom_templates")
    .update({ is_shared: isShared, author_name: authorName ?? null })
    .eq("id", templateId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function dbGetCustomTemplates(userId: string): Promise<Template[]> {
  const { data, error } = await supabase
    .from("custom_templates")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToTemplate);
}

export async function dbAddCustomTemplate(
  userId: string,
  template: Template
): Promise<void> {
  const { error } = await supabase
    .from("custom_templates")
    .insert(templateToRow(userId, template));
  if (error) throw error;
}

export async function dbUpdateCustomTemplate(
  userId: string,
  template: Template
): Promise<void> {
  const { error } = await supabase
    .from("custom_templates")
    .update(templateToRow(userId, template))
    .eq("id", template.id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function dbRemoveCustomTemplate(
  userId: string,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("custom_templates")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function dbBulkInsertCustomTemplates(
  userId: string,
  templates: Template[]
): Promise<void> {
  if (templates.length === 0) return;
  const { error } = await supabase
    .from("custom_templates")
    .insert(templates.map((t) => templateToRow(userId, t)));
  if (error) throw error;
}

// ─── Favorites ────────────────────────────────────────────────────────────

export async function dbGetFavorites(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("template_id")
    .eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map((r) => r.template_id as string);
}

export async function dbAddFavorite(
  userId: string,
  templateId: string
): Promise<void> {
  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, template_id: templateId });
  // Ignore duplicate errors (already favorited)
  if (error && !error.message.includes("duplicate")) throw error;
}

export async function dbRemoveFavorite(
  userId: string,
  templateId: string
): Promise<void> {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("template_id", templateId);
  if (error) throw error;
}

export async function dbBulkInsertFavorites(
  userId: string,
  templateIds: string[]
): Promise<void> {
  if (templateIds.length === 0) return;
  const { error } = await supabase
    .from("favorites")
    .insert(templateIds.map((id) => ({ user_id: userId, template_id: id })));
  if (error && !error.message.includes("duplicate")) throw error;
}

// ─── Prompt History ───────────────────────────────────────────────────────

export async function dbGetHistory(
  userId: string,
  limit = 100
): Promise<HistoryEntry[]> {
  const { data, error } = await supabase
    .from("prompt_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((r) => ({
    id:            r.id            as string,
    prompt:        r.prompt        as string,
    response:      r.response      as string,
    model:         r.model         as string,
    modelLabel:    r.model_label   as string,
    mode:          r.mode          as "run" | "improve",
    timestamp:     new Date(r.created_at as string).getTime(),
    durationMs:    r.duration_ms   as number,
    charCount:     r.char_count    as number,
    templateId:    r.template_id   as string | undefined,
    templateTitle: r.template_title as string | undefined,
  }));
}

export async function dbAddHistoryEntry(
  userId: string,
  entry: HistoryEntry
): Promise<void> {
  const { error } = await supabase.from("prompt_history").insert({
    id:             entry.id,
    user_id:        userId,
    prompt:         entry.prompt,
    response:       entry.response,
    model:          entry.model,
    model_label:    entry.modelLabel,
    mode:           entry.mode,
    duration_ms:    entry.durationMs,
    char_count:     entry.charCount,
    template_id:    entry.templateId ?? null,
    template_title: entry.templateTitle ?? null,
  });
  if (error) throw error;
}

export async function dbRemoveHistoryEntry(
  userId: string,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("prompt_history")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function dbClearHistory(userId: string): Promise<void> {
  const { error } = await supabase
    .from("prompt_history")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
}

export async function dbBulkInsertHistory(
  userId: string,
  entries: HistoryEntry[]
): Promise<void> {
  if (entries.length === 0) return;
  const { error } = await supabase.from("prompt_history").insert(
    entries.map((e) => ({
      id:             e.id,
      user_id:        userId,
      prompt:         e.prompt,
      response:       e.response,
      model:          e.model,
      model_label:    e.modelLabel,
      mode:           e.mode,
      duration_ms:    e.durationMs,
      char_count:     e.charCount,
      template_id:    e.templateId ?? null,
      template_title: e.templateTitle ?? null,
    }))
  );
  if (error) throw error;
}
