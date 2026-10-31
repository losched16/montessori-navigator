-- Support access: lets super admins (e.g. Foundation staff helping a school)
-- manage a school's portal on its behalf.
--
-- Granting access from /admin/customers ("Manage this school") inserts a
-- normal school_staff admin row flagged is_support = true, so every existing
-- RLS policy and API check works unchanged. The flag keeps support admins out
-- of the school's seat / trial-cap counts and onboarding checklist, labels
-- them in the school's Admins list, and lets the admin area remove only the
-- rows it created.

alter table school_staff add column if not exists is_support boolean not null default false;

-- Only super admins with can_manage_schools may use support access. Granted
-- per person; initially just Tim Seldin.
alter table super_admins add column if not exists can_manage_schools boolean not null default false;
update super_admins set can_manage_schools = true
where user_id = (select id from auth.users where lower(email) = 'timseldin@montessori.org');
