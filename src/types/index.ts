// ─── Core domain types ────────────────────────────────────────────────────

export interface Category {
  id: string;
  label: string;
  color: string;          // accent hex — used for badge, stripe, dot
}

export interface Template {
  id: string;
  cat: string;
  title: string;
  desc: string;
  code: string;
  tip?: string;
  isShared?: boolean;
  authorName?: string;
}

// ─── UI state types ───────────────────────────────────────────────────────

export type ActiveCategory = string;   // 'all' | 'favorites' | Category.id

export interface FilterState {
  category: ActiveCategory;
  query: string;
}
