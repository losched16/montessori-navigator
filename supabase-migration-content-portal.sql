-- Content portal: super-admin role + unified resources table.
--
-- Goal: let the founder + partners add content (playbooks, workbooks, articles,
-- newsletters) without code changes. Single resources table covers both
-- school-facing and parent-facing content, keyed by an audience field.
--
-- After running this migration:
--   1. clint@getaims.co is bootstrapped as the first super_admin
--   2. The 2 existing PDFs (in public/resources/) are seeded as DB rows
--   3. A 'resources' storage bucket is created for new uploads
--
-- See lib/super-admin.ts and lib/resources.ts for the application code that
-- reads from these tables.

-- ────────────────────────────────────────────────────────────────────────
-- 1. super_admins table
-- ────────────────────────────────────────────────────────────────────────
create table if not exists super_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'super_admin' check (role in ('super_admin', 'editor')),
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table super_admins enable row level security;

-- Super admins can see who else is a super admin
drop policy if exists "super admins can read super_admins" on super_admins;
create policy "super admins can read super_admins" on super_admins
  for select using (
    exists (select 1 from super_admins sa where sa.user_id = auth.uid())
  );

-- Helper function: is the current user a super admin? Used in RLS policies
-- below so they don't have to repeat the existence check.
create or replace function is_super_admin() returns boolean
  language sql stable security definer
  as $$ select exists (select 1 from super_admins where user_id = auth.uid()) $$;

-- ────────────────────────────────────────────────────────────────────────
-- 2. resources table (unified content)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  type text not null check (type in (
    'playbook', 'workbook', 'template', 'guide', 'article', 'newsletter'
  )),
  audience text not null check (audience in ('school', 'parent', 'both')),
  -- File reference: either a path inside the public/ folder (e.g.
  -- "/resources/foo.pdf") OR a Supabase Storage path within the
  -- 'resources' bucket (e.g. "playbooks/foo.pdf"). Application code
  -- detects which based on whether it starts with "/".
  pdf_path text,
  cover_path text,
  highlights jsonb not null default '[]'::jsonb,
  is_published boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resources_audience_published_idx
  on resources(audience, is_published) where is_published = true;

alter table resources enable row level security;

-- Anyone (even logged-out) can read PUBLISHED resources. Drafts are super-
-- admin-only. We use audience-aware queries in the app code rather than RLS
-- because the app needs to filter by audience anyway.
drop policy if exists "anyone reads published resources" on resources;
create policy "anyone reads published resources" on resources
  for select using (is_published = true or is_super_admin());

drop policy if exists "super admins write resources" on resources;
create policy "super admins write resources" on resources
  for all using (is_super_admin()) with check (is_super_admin());

-- ────────────────────────────────────────────────────────────────────────
-- 3. updated_at trigger
-- ────────────────────────────────────────────────────────────────────────
create or replace function set_updated_at() returns trigger
  language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists resources_set_updated_at on resources;
create trigger resources_set_updated_at
  before update on resources
  for each row execute function set_updated_at();

-- ────────────────────────────────────────────────────────────────────────
-- 4. Storage bucket for new uploads
-- ────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('resources', 'resources', true)
on conflict (id) do nothing;

-- Public read access (resources are public content)
drop policy if exists "Public reads on resources bucket" on storage.objects;
create policy "Public reads on resources bucket" on storage.objects
  for select using (bucket_id = 'resources');

-- Only super admins can upload / overwrite / delete
drop policy if exists "Super admins write resources bucket" on storage.objects;
create policy "Super admins write resources bucket" on storage.objects
  for all using (bucket_id = 'resources' and is_super_admin())
  with check (bucket_id = 'resources' and is_super_admin());

-- ────────────────────────────────────────────────────────────────────────
-- 5. Bootstrap: grant clint@getaims.co super_admin
-- ────────────────────────────────────────────────────────────────────────
-- Only insert if the user already exists in auth.users (they should — they're
-- the founder). If you need to add other emails, add lines below.
insert into super_admins (user_id, role, granted_by)
select id, 'super_admin', id
from auth.users
where lower(email) = 'clint@getaims.co'
on conflict (user_id) do nothing;

-- ────────────────────────────────────────────────────────────────────────
-- 6. Seed existing PDFs as DB rows so /school/resources keeps working
-- ────────────────────────────────────────────────────────────────────────
insert into resources (slug, title, description, type, audience, pdf_path, highlights, is_published, published_at)
values
  (
    'new-family-onboarding-playbook',
    'New Family Onboarding Playbook',
    'A complete playbook showing what a great new-family onboarding looks like at a Montessori school — from acceptance through their first month. Use it as a model for your own.',
    'playbook',
    'school',
    '/resources/new-family-onboarding-playbook.pdf',
    '["Acceptance-to-first-day timeline","Welcome packet templates","First-month family touchpoints","Example school in action"]'::jsonb,
    true,
    now()
  ),
  (
    'family-onboarding-workbook',
    'Family Onboarding Workbook',
    'A fillable customization workbook to design your own new-family onboarding flow. Pairs with the playbook above — work through it as a leadership team to build your school''s version.',
    'workbook',
    'school',
    '/resources/family-onboarding-workbook.pdf',
    '["Step-by-step customization prompts","Pulls in your school''s voice and rhythms","Ready to use with your admin team"]'::jsonb,
    true,
    now()
  )
on conflict (slug) do nothing;
