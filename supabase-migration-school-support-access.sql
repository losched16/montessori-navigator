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
