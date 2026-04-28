-- ================================================
-- MIGRATION: Fix RLS infinite recursion on school tables
--
-- The school_staff policies query school_staff from within themselves,
-- which Postgres rejects as infinite recursion. The schools and
-- school_families policies do the same. The fix is the same pattern
-- already used for families: SECURITY DEFINER helper functions that
-- bypass RLS for the recursive lookup.
--
-- Run in Supabase SQL editor.
-- ================================================

-- Helpers: return the schools the current user belongs to.
CREATE OR REPLACE FUNCTION user_school_ids()
RETURNS SETOF UUID AS $$
  SELECT school_id FROM school_staff WHERE user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION user_admin_school_ids()
RETURNS SETOF UUID AS $$
  SELECT school_id FROM school_staff WHERE user_id = auth.uid() AND role = 'admin'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ================================================
-- school_staff
-- ================================================

DROP POLICY IF EXISTS "Staff can view school staff" ON school_staff;
DROP POLICY IF EXISTS "Admins can manage school staff" ON school_staff;
DROP POLICY IF EXISTS "Admins can update school staff" ON school_staff;
DROP POLICY IF EXISTS "Admins can remove school staff" ON school_staff;

CREATE POLICY "Staff can view school staff"
  ON school_staff FOR SELECT
  USING (school_id IN (SELECT user_school_ids()));

CREATE POLICY "Admins can manage school staff"
  ON school_staff FOR INSERT
  WITH CHECK (school_id IN (SELECT user_admin_school_ids()));

CREATE POLICY "Admins can update school staff"
  ON school_staff FOR UPDATE
  USING (school_id IN (SELECT user_admin_school_ids()));

CREATE POLICY "Admins can remove school staff"
  ON school_staff FOR DELETE
  USING (school_id IN (SELECT user_admin_school_ids()));

-- ================================================
-- schools
-- ================================================

DROP POLICY IF EXISTS "Staff can manage their school" ON schools;

CREATE POLICY "Staff can manage their school"
  ON schools FOR ALL
  USING (id IN (SELECT user_school_ids()));

-- ================================================
-- school_families
-- ================================================

DROP POLICY IF EXISTS "Staff can view school families" ON school_families;
DROP POLICY IF EXISTS "Staff can update school families" ON school_families;

CREATE POLICY "Staff can view school families"
  ON school_families FOR SELECT
  USING (school_id IN (SELECT user_school_ids()));

CREATE POLICY "Staff can update school families"
  ON school_families FOR UPDATE
  USING (school_id IN (SELECT user_school_ids()));
