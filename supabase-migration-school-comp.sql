-- Comped schools + state identification.
--
-- Adds fields so super admins can set up free ("comped") schools from /admin
-- and identify them unambiguously (many US schools share a name).
--
--   state       two-letter US state, so "Sunrise Montessori, FL" is distinct
--               from "Sunrise Montessori, CA"
--   is_comped   true = free/sponsored (no Stripe), stored as subscription_status
--               'active' so it's treated as paid everywhere
--   comp_note   free-text paper trail ("MFC founding member, prepaid 2 yrs")
--
-- Comped schools use the same seat model as paid schools: family_count seats
-- plus a 20-staff buffer (see lib/school-invite-limits.ts).

alter table schools add column if not exists state text;
alter table schools add column if not exists is_comped boolean not null default false;
alter table schools add column if not exists comp_note text;
