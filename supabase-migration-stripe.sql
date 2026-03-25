-- ================================================
-- MIGRATION: Add Stripe billing columns to schools
-- Run this in your Supabase SQL editor
-- ================================================

ALTER TABLE schools ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive'
  CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled'));
ALTER TABLE schools ADD COLUMN IF NOT EXISTS family_count INTEGER DEFAULT 0;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS billing_email TEXT;

CREATE INDEX IF NOT EXISTS idx_schools_stripe_customer ON schools(stripe_customer_id);
