-- PromptForge — Add Community Sharing
-- Run this in Supabase SQL Editor AFTER the original schema.sql

-- Add shared column to custom_templates
alter table public.custom_templates
  add column if not exists is_shared boolean not null default false;

-- Add display name so shared templates show who made them
alter table public.custom_templates
  add column if not exists author_name text;

-- Allow anyone (including logged-out users) to READ shared templates
-- They still cannot modify templates that aren't theirs (existing policy covers that)
create policy "custom_templates: anyone can read shared"
  on public.custom_templates for select
  using (is_shared = true OR auth.uid() = user_id);

-- Drop the old all-purpose policy and replace with granular ones
-- (select is now handled above)
drop policy if exists "custom_templates: users own their rows" on public.custom_templates;

create policy "custom_templates: users can insert their own"
  on public.custom_templates for insert
  with check (auth.uid() = user_id);

create policy "custom_templates: users can update their own"
  on public.custom_templates for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "custom_templates: users can delete their own"
  on public.custom_templates for delete
  using (auth.uid() = user_id);
