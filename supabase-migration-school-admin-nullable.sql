-- ================================================
-- MIGRATION: Allow schools.admin_user_id to be NULL
--
-- The Stripe webhook creates the school row BEFORE the admin user
-- signs up, so admin_user_id is set later by /api/school/claim. The
-- previous schema marked the column NOT NULL with an FK to auth.users,
-- which forced the webhook to insert a fake all-zeros UUID — a value
-- that doesn't exist in auth.users, so the FK rejected the insert and
-- the webhook silently failed. Result: school admins got stuck in a
-- "Setting up your subscription" loop because the school row was never
-- created.
--
-- Run in Supabase SQL editor.
-- ================================================

ALTER TABLE schools ALTER COLUMN admin_user_id DROP NOT NULL;

-- Defensive cleanup: if any existing rows used the placeholder UUID, null it
-- so the next claim can populate it cleanly.
UPDATE schools
SET admin_user_id = NULL
WHERE admin_user_id = '00000000-0000-0000-0000-000000000000';
