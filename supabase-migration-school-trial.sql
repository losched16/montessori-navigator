-- ================================================
-- MIGRATION: Allow 'trialing' status on schools
-- Schools now get a 14-day free trial. Run in Supabase SQL editor.
-- ================================================

ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_subscription_status_check;

ALTER TABLE schools
  ADD CONSTRAINT schools_subscription_status_check
  CHECK (subscription_status IN ('inactive', 'trialing', 'active', 'past_due', 'canceled'));

-- Track trial end date on schools (parallel to parents.trial_ends_at)
ALTER TABLE schools ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;
