-- Memo app schema for Supabase
create extension if not exists pgcrypto;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0 and char_length(title) <= 120),
  content text not null default '' check (char_length(content) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
before update on public.notes
for each row
execute function public.set_updated_at();

alter table public.notes enable row level security;

-- For a personal memo app without auth, allow anon/authenticated CRUD.
-- If you add auth later, tighten these policies.
drop policy if exists "notes full access" on public.notes;
create policy "notes full access"
on public.notes
for all
to anon, authenticated
using (true)
with check (true);
