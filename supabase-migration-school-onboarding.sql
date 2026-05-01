-- School onboarding state.
--
-- Tracks the per-school welcome/onboarding journey. We store this as a JSON
-- blob (not separate columns) because the shape will evolve as we add steps
-- and signals — a JSONB column lets us iterate without per-step migrations.
--
-- Current shape:
--   {
--     "welcomed_at":      "2026-04-29T12:34:56Z",   -- admin clicked through welcome
--     "viewed_resources": ["slug-1", "slug-2"]      -- resources opened in /school/resources
--   }
--
-- Auto-detected items (profile customized, first invite sent, co-admin added,
-- parent role) are NOT stored here — they're computed from existing data so
-- they can never get out of sync.

alter table schools
  add column if not exists onboarding_state jsonb not null default '{}'::jsonb;
