-- Announcements: news, updates, messages and events pushed by super admins.
--
-- One table covers all four kinds so a single feed / notification bell can
-- show them together. Events use the extra starts_at / ends_at / location
-- columns. Audience works like resources: 'parent' shows in the family app
-- (/dashboard), 'school' on the school admin dashboard (/school), 'both' on
-- both.
--
-- announcement_reads tracks which items each user has seen, which drives the
-- unread badge on the bell and the dismissible pinned banner on Home.
--
-- Writes go through /api/admin/announcements (service role, super-admin
-- check). Readers query directly with the anon client under RLS below.

-- ── 1. announcements ────────────────────────────────────────────────────────
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('news', 'update', 'message', 'event')),
  title text not null check (char_length(title) between 1 and 200),
  body text not null default '',
  audience text not null default 'parent' check (audience in ('parent', 'school', 'both')),
  link_url text check (link_url is null or link_url ~* '^(https?://|/)'),
  link_label text,
  -- Event fields (required for kind = 'event', ignored otherwise)
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  is_pinned boolean not null default false,  -- show as a banner on Home until dismissed
  is_published boolean not null default false,
  published_at timestamptz,
  expires_at timestamptz,                    -- hide after this time (optional)
  emailed_at timestamptz,                    -- set when the email blast went out
  emailed_count integer,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcements_event_has_start check (kind <> 'event' or starts_at is not null),
  constraint announcements_event_end_after_start check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create index if not exists announcements_published_idx
  on announcements (published_at desc) where is_published = true;
create index if not exists announcements_events_idx
  on announcements (starts_at) where kind = 'event' and is_published = true;

drop trigger if exists announcements_set_updated_at on announcements;
create trigger announcements_set_updated_at
  before update on announcements
  for each row execute function set_updated_at();

alter table announcements enable row level security;

-- Signed-in users read published, unexpired items. Audience filtering happens
-- in app code (same approach as resources). Super admins see everything.
drop policy if exists "users read published announcements" on announcements;
create policy "users read published announcements" on announcements
  for select to authenticated
  using (
    (is_published = true and (expires_at is null or expires_at > now()))
    or is_super_admin()
  );

drop policy if exists "super admins write announcements" on announcements;
create policy "super admins write announcements" on announcements
  for all to authenticated
  using (is_super_admin()) with check (is_super_admin());

-- ── 2. announcement_reads ───────────────────────────────────────────────────
create table if not exists announcement_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  announcement_id uuid not null references announcements(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (user_id, announcement_id)
);

alter table announcement_reads enable row level security;

drop policy if exists "users read own announcement reads" on announcement_reads;
create policy "users read own announcement reads" on announcement_reads
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "users mark own announcements read" on announcement_reads;
create policy "users mark own announcements read" on announcement_reads
  for insert to authenticated
  with check (user_id = auth.uid());
