import type { Category } from "@/types";

export const CATEGORIES: Category[] = [
  { id: "anatomy",   label: "Anatomy",           color: "#e5993a" },
  { id: "sequence",  label: "Sequence",           color: "#5b9cf6" },
  { id: "selection", label: "Selection",          color: "#f87171" },
  { id: "iteration", label: "Iteration",          color: "#4ecba5" },
  { id: "role",      label: "Role + Context",     color: "#a78bfa" },
  { id: "format",    label: "Output Format",      color: "#6ee7b7" },
  { id: "fewshot",   label: "Few-Shot",           color: "#f9a8d4" },
  { id: "cot",       label: "Chain of Thought",   color: "#fcd34d" },
  { id: "negative",  label: "Negative Prompting", color: "#f87171" },
  { id: "meta",      label: "Meta-Prompting",     color: "#94a3b8" },
  { id: "devflow",   label: "Dev Workflow",        color: "#38bdf8" },
  { id: "client",    label: "Client Work",         color: "#fb923c" },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getCategoryLabel(id: string): string {
  return getCategoryById(id)?.label ?? id;
}

export function getCategoryColor(id: string): string {
  return getCategoryById(id)?.color ?? "#94a3b8";
}
