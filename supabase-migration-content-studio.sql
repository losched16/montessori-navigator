-- ============================================================================
-- Content Studio — private content intake for super admins (Tim & team)
-- ============================================================================
--
-- Run in the Supabase SQL Editor. Safe to re-run.
--
-- Depends on supabase-migration-content-portal.sql (already applied), which
-- created:
--   * super_admins + is_super_admin()  — the platform's internal-user role
--   * set_updated_at()                 — shared updated_at trigger function
--
-- Access model: ONLY super admins can read or create submissions. Regular
-- parents and school staff get nothing, even when signed in. Status changes
-- come from the content pipeline using the service role, so there is no
-- UPDATE or DELETE policy — users can't mark their own work "published".

do $$
begin
  if not exists (select 1 from pg_proc where proname = 'is_super_admin')
     or not exists (select 1 from pg_proc where proname = 'set_updated_at') then
    raise exception 'Run supabase-migration-content-portal.sql first (needs is_super_admin() and set_updated_at()).';
  end if;
end $$;

-- ── 1. Enums (guarded: CREATE TYPE has no IF NOT EXISTS) ─────────────────────
do $$ begin
  create type content_submission_type as enum ('article', 'video', 'idea');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_submission_status as enum (
    'submitted', 'processing', 'ready_for_review', 'approved',
    'scheduled', 'published', 'failed'
  );
exception when duplicate_object then null; end $$;

-- ── 2. Table ─────────────────────────────────────────────────────────────────
create table if not exists content_submissions (
  id uuid primary key default gen_random_uuid(),
  submission_type content_submission_type not null,
  title text not null check (char_length(title) between 1 and 240),
  notes text,
  source_text text,
  source_url text check (source_url is null or source_url ~* '^https?://'),
  file_path text,                 -- object path in the content-intake bucket
  file_name text,                 -- original filename, for display
  file_size bigint,
  status content_submission_status not null default 'submitted',
  error_message text,
  pipeline_notified_at timestamptz, -- set when the n8n webhook accepted it
  -- set null (not cascade) so removing a user never deletes content history
  submitted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_submissions_has_source
    check (source_text is not null or source_url is not null or file_path is not null)
);

create index if not exists content_submissions_created_at_idx on content_submissions (created_at desc);
create index if not exists content_submissions_status_idx on content_submissions (status);
create index if not exists content_submissions_submitted_by_idx on content_submissions (submitted_by);

drop trigger if exists content_submissions_set_updated_at on content_submissions;
create trigger content_submissions_set_updated_at
  before update on content_submissions
  for each row execute function set_updated_at();

-- ── 3. RLS — super admins only ───────────────────────────────────────────────
alter table content_submissions enable row level security;

drop policy if exists "super admins read content submissions" on content_submissions;
create policy "super admins read content submissions" on content_submissions
  for select to authenticated
  using (is_super_admin());

drop policy if exists "super admins create own content submissions" on content_submissions;
create policy "super admins create own content submissions" on content_submissions
  for insert to authenticated
  with check (is_super_admin() and submitted_by = auth.uid() and status = 'submitted');

-- ── 4. Private storage bucket ────────────────────────────────────────────────
-- 250 MB per file. NOTE: the project-wide upload limit (Storage → Settings)
-- must also be >= 250 MB or larger files are rejected before this applies.
insert into storage.buckets (id, name, public, file_size_limit)
values ('content-intake', 'content-intake', false, 262144000)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

-- The app uploads via short-lived signed upload URLs issued by the server
-- after a super-admin check, so these policies are defense in depth: a super
-- admin may only write into their own folder, and only super admins can read.
drop policy if exists "Super admins upload content intake files" on storage.objects;
create policy "Super admins upload content intake files" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'content-intake'
    and is_super_admin()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Super admins read content intake files" on storage.objects;
create policy "Super admins read content intake files" on storage.objects
  for select to authenticated
  using (bucket_id = 'content-intake' and is_super_admin());
