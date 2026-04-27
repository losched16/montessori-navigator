-- ================================================
-- MIGRATION: Allow school_staff type in invitations
-- Adds support for inviting other admins to a school account.
-- Run in Supabase SQL editor.
-- ================================================

ALTER TABLE invitations DROP CONSTRAINT IF EXISTS invitations_type_check;

ALTER TABLE invitations
  ADD CONSTRAINT invitations_type_check
  CHECK (type IN ('school_family', 'co_parent', 'school_staff'));
