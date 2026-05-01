-- PromptForge — Supabase Schema
-- Paste this entire file into the Supabase SQL Editor and run it.
-- Dashboard → SQL Editor → New query → paste → Run

-- ─── Tables ───────────────────────────────────────────────────────────────

create table if not exists public.custom_templates (
  id           text        primary key,
  user_id      uuid        references auth.users(id) on delete cascade not null,
  title        text        not null,
  cat          text        not null,
  description  text        not null,
  code         text        not null,
  tip          text,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

create table if not exists public.favorites (
  user_id      uuid        references auth.users(id) on delete cascade not null,
  template_id  text        not null,
  created_at   timestamptz default now() not null,
  primary key (user_id, template_id)
);

create table if not exists public.prompt_history (
  id             text        primary key,
  user_id        uuid        references auth.users(id) on delete cascade not null,
  prompt         text        not null,
  response       text        not null,
  model          text        not null,
  model_label    text        not null,
  mode           text        not null check (mode in ('run', 'improve')),
  duration_ms    integer     not null default 0,
  char_count     integer     not null default 0,
  template_id    text,
  template_title text,
  created_at     timestamptz default now() not null
);

-- ─── Indexes ───────────────────────────────────────────────────────────────

create index if not exists custom_templates_user_id_idx on public.custom_templates(user_id);
create index if not exists favorites_user_id_idx        on public.favorites(user_id);
create index if not exists prompt_history_user_id_idx   on public.prompt_history(user_id, created_at desc);

-- ─── Row Level Security ────────────────────────────────────────────────────
-- Users can only read/write their own rows. Even if someone
-- gets the anon key, they cannot access another user's data.

alter table public.custom_templates enable row level security;
alter table public.favorites        enable row level security;
alter table public.prompt_history   enable row level security;

-- Custom templates
create policy "custom_templates: users own their rows"
  on public.custom_templates for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Favorites
create policy "favorites: users own their rows"
  on public.favorites for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Prompt history
create policy "prompt_history: users own their rows"
  on public.prompt_history for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Auto-update updated_at ────────────────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger custom_templates_updated_at
  before update on public.custom_templates
  for each row execute function public.handle_updated_at();
