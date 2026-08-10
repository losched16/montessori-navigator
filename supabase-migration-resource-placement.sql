-- Resource placement: Resources section vs the parent article Library.
--
--   in_resources  show in the Resources section (/school|dashboard/resources).
--                 Defaults true so existing resources are unaffected.
--   in_library    also show in the parent article Library (/dashboard/library),
--                 merged with the imported Foundation articles. Defaults false.
--
-- Content can be in either or both. A library-only article sets
-- in_resources=false, in_library=true.

alter table resources add column if not exists in_resources boolean not null default true;
alter table resources add column if not exists in_library boolean not null default false;
