// ─── Core domain types ────────────────────────────────────────────────────

export interface Category {
  id: string;
  label: string;
  color: string;          // accent hex — used for badge, stripe, dot
}

export interface Template {
  id: string;
  cat: string;            // matches Category.id
  title: string;
  desc: string;           // 1–2 sentence description shown on card
  code: string;           // the copyable prompt template text
  tip?: string;           // optional "when to use" guidance (HTML allowed)
}

// ─── UI state types ───────────────────────────────────────────────────────

export type ActiveCategory = string;   // 'all' | 'favorites' | Category.id

export interface FilterState {
  category: ActiveCategory;
  query: string;
}
