-- ================================================
-- MIGRATION: Add Stripe billing columns to parents
-- Run in Supabase SQL editor
-- ================================================

ALTER TABLE parents ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive'
  CHECK (subscription_status IN ('inactive','trialing','active','past_due','canceled'));
ALTER TABLE parents ADD COLUMN IF NOT EXISTS subscription_plan TEXT
  CHECK (subscription_plan IN ('individual_monthly','individual_annual') OR subscription_plan IS NULL);
ALTER TABLE parents ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_parents_stripe_customer ON parents(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_parents_subscription_status ON parents(subscription_status);

-- Grandfather all existing parents into 'active' status so subscription gating
-- doesn't lock out current users at the moment we ship.
-- New signups will default to 'inactive' and must go through the trial flow.
UPDATE parents SET subscription_status = 'active'
  WHERE subscription_status = 'inactive' OR subscription_status IS NULL;
