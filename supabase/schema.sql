create extension if not exists pgcrypto;

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  started_at timestamptz unique,
  role text,
  name text,
  task1_result jsonb,
  task2_result jsonb,
  task3_result jsonb,
  rating_viewer integer,
  rating_energy integer,
  rating_solar integer,
  rating_iaq integer,
  rating_faults integer,
  rating_scenarios integer,
  rating_forecast integer,
  rating_roles integer,
  most_useful text,
  needs_work text,
  overall_rating integer,
  what_worked text,
  what_needed text,
  would_use text,
  other_comments text,
  ai_summary text,
  email text
);

alter table public.survey_responses enable row level security;

create policy "No direct public access"
on public.survey_responses
for all
to public
using (false)
with check (false);
