-- ================================================
-- MIGRATION: Add Families, Invitations, and School Systems
-- Run this in your Supabase SQL editor AFTER the base schema
-- ================================================

-- ================================================
-- PHASE 1: FAMILIES & CO-PARENT INVITATIONS
-- ================================================

-- Families table (the household unit)
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT, -- optional, e.g. "The Smith Family"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family members junction (parents <-> families)
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'primary' CHECK (role IN ('primary', 'parent', 'guardian', 'caregiver')),
  permissions TEXT NOT NULL DEFAULT 'full' CHECK (permissions IN ('full', 'read_only')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, parent_id)
);

-- Invitations (unified for school_family and co_parent invites)
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('school_family', 'co_parent')),
  token TEXT UNIQUE NOT NULL,

  -- For school_family invites:
  school_id UUID, -- will reference schools(id) when Phase 2 is added

  -- For co_parent invites:
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES parents(id) ON DELETE SET NULL,

  -- Common fields:
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add family_id to children table
ALTER TABLE children ADD COLUMN family_id UUID REFERENCES families(id) ON DELETE CASCADE;

-- ================================================
-- DATA MIGRATION: Create families for existing parents
-- ================================================

-- For each existing parent, create a family and link them
DO $$
DECLARE
  p RECORD;
  new_family_id UUID;
BEGIN
  FOR p IN SELECT id, display_name FROM parents LOOP
    -- Create a family for this parent
    INSERT INTO families (name)
    VALUES (COALESCE(p.display_name, 'My Family') || '''s Family')
    RETURNING id INTO new_family_id;

    -- Link parent to family as primary
    INSERT INTO family_members (family_id, parent_id, role, permissions)
    VALUES (new_family_id, p.id, 'primary', 'full');

    -- Update all their children with the family_id
    UPDATE children SET family_id = new_family_id WHERE parent_id = p.id;
  END LOOP;
END $$;

-- Now make family_id NOT NULL (all existing children have been migrated)
ALTER TABLE children ALTER COLUMN family_id SET NOT NULL;

-- ================================================
-- HELPER FUNCTION: Get current user's family IDs
-- ================================================

CREATE OR REPLACE FUNCTION user_family_ids()
RETURNS SETOF UUID AS $$
  SELECT fm.family_id
  FROM family_members fm
  JOIN parents p ON p.id = fm.parent_id
  WHERE p.user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: Check if user has write permissions in a family
CREATE OR REPLACE FUNCTION user_writable_family_ids()
RETURNS SETOF UUID AS $$
  SELECT fm.family_id
  FROM family_members fm
  JOIN parents p ON p.id = fm.parent_id
  WHERE p.user_id = auth.uid() AND fm.permissions = 'full'
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ================================================
-- RLS: Enable on new tables
-- ================================================

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Families: accessible to members
CREATE POLICY "Family members can view their families"
  ON families FOR SELECT
  USING (id IN (SELECT user_family_ids()));

CREATE POLICY "Authenticated users can create families"
  ON families FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Family primary members can update family"
  ON families FOR UPDATE
  USING (id IN (
    SELECT fm.family_id FROM family_members fm
    JOIN parents p ON p.id = fm.parent_id
    WHERE p.user_id = auth.uid() AND fm.role = 'primary'
  ));

-- Family members: accessible to family
CREATE POLICY "Family members can view members"
  ON family_members FOR SELECT
  USING (family_id IN (SELECT user_family_ids()));

CREATE POLICY "Primary members can manage family members"
  ON family_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Primary members can update family members"
  ON family_members FOR UPDATE
  USING (family_id IN (
    SELECT fm.family_id FROM family_members fm
    JOIN parents p ON p.id = fm.parent_id
    WHERE p.user_id = auth.uid() AND fm.role = 'primary'
  ));

CREATE POLICY "Primary members can remove family members"
  ON family_members FOR DELETE
  USING (family_id IN (
    SELECT fm.family_id FROM family_members fm
    JOIN parents p ON p.id = fm.parent_id
    WHERE p.user_id = auth.uid() AND fm.role = 'primary'
  ));

-- Invitations: creator and recipient can see
CREATE POLICY "Users can view their invitations"
  ON invitations FOR SELECT
  USING (
    invited_by IN (SELECT id FROM parents WHERE user_id = auth.uid())
    OR email IN (SELECT email FROM parents WHERE user_id = auth.uid())
    OR family_id IN (SELECT user_family_ids())
  );

CREATE POLICY "Users can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their invitations"
  ON invitations FOR UPDATE
  USING (
    invited_by IN (SELECT id FROM parents WHERE user_id = auth.uid())
    OR accepted_by = auth.uid()
  );

-- ================================================
-- REWRITE EXISTING RLS POLICIES for family-based access
-- ================================================

-- Drop old children policies
DROP POLICY IF EXISTS "Parents can view own children" ON children;
DROP POLICY IF EXISTS "Parents can insert own children" ON children;
DROP POLICY IF EXISTS "Parents can update own children" ON children;
DROP POLICY IF EXISTS "Parents can delete own children" ON children;

-- New children policies (family-based)
CREATE POLICY "Family members can view children"
  ON children FOR SELECT
  USING (family_id IN (SELECT user_family_ids()));

CREATE POLICY "Family members can insert children"
  ON children FOR INSERT
  WITH CHECK (family_id IN (SELECT user_writable_family_ids()));

CREATE POLICY "Family members can update children"
  ON children FOR UPDATE
  USING (family_id IN (SELECT user_writable_family_ids()));

CREATE POLICY "Family members can delete children"
  ON children FOR DELETE
  USING (family_id IN (SELECT user_writable_family_ids()));

-- Drop and recreate child_development_levels policy
DROP POLICY IF EXISTS "Parents can manage child development levels" ON child_development_levels;
CREATE POLICY "Family members can manage child development levels"
  ON child_development_levels FOR SELECT
  USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_family_ids())));
CREATE POLICY "Family members can write child development levels"
  ON child_development_levels FOR INSERT
  WITH CHECK (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_writable_family_ids())));
CREATE POLICY "Family members can update child development levels"
  ON child_development_levels FOR UPDATE
  USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_writable_family_ids())));
CREATE POLICY "Family members can delete child development levels"
  ON child_development_levels FOR DELETE
  USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_writable_family_ids())));

-- Drop and recreate child_traits policy
DROP POLICY IF EXISTS "Parents can manage child traits" ON child_traits;
CREATE POLICY "Family members can manage child traits"
  ON child_traits FOR SELECT
  USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_family_ids())));
CREATE POLICY "Family members can write child traits"
  ON child_traits FOR INSERT
  WITH CHECK (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_writable_family_ids())));
CREATE POLICY "Family members can update child traits"
  ON child_traits FOR UPDATE
  USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_writable_family_ids())));
CREATE POLICY "Family members can delete child traits"
  ON child_traits FOR DELETE
  USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_writable_family_ids())));

-- Drop and recreate observations policy
DROP POLICY IF EXISTS "Parents can manage observations" ON observations;
CREATE POLICY "Family members can view observations"
  ON observations FOR SELECT
  USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_family_ids())));
CREATE POLICY "Family members can insert observations"
  ON observations FOR INSERT
  WITH CHECK (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_writable_family_ids())));
CREATE POLICY "Family members can update observations"
  ON observations FOR UPDATE
  USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_writable_family_ids())));
CREATE POLICY "Family members can delete observations"
  ON observations FOR DELETE
  USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_writable_family_ids())));

-- Drop and recreate milestones policy
DROP POLICY IF EXISTS "Parents can manage milestones" ON milestones;
CREATE POLICY "Family members can view milestones"
  ON milestones FOR SELECT
  USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_family_ids())));
CREATE POLICY "Family members can write milestones"
  ON milestones FOR INSERT
  WITH CHECK (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_writable_family_ids())));
CREATE POLICY "Family members can update milestones"
  ON milestones FOR UPDATE
  USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_writable_family_ids())));
CREATE POLICY "Family members can delete milestones"
  ON milestones FOR DELETE
  USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_writable_family_ids())));

-- Drop and recreate learning_plans policy
DROP POLICY IF EXISTS "Parents can manage learning plans" ON learning_plans;
CREATE POLICY "Family members can view learning plans"
  ON learning_plans FOR SELECT
  USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_family_ids())));
CREATE POLICY "Family members can insert learning plans"
  ON learning_plans FOR INSERT
  WITH CHECK (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_writable_family_ids())));
CREATE POLICY "Family members can update learning plans"
  ON learning_plans FOR UPDATE
  USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_writable_family_ids())));
CREATE POLICY "Family members can delete learning plans"
  ON learning_plans FOR DELETE
  USING (child_id IN (SELECT id FROM children WHERE family_id IN (SELECT user_writable_family_ids())));

-- Drop and recreate home_environment policy
DROP POLICY IF EXISTS "Parents can manage home environment" ON home_environment;
CREATE POLICY "Family members can view home environment"
  ON home_environment FOR SELECT
  USING (parent_id IN (
    SELECT fm2.parent_id FROM family_members fm2
    WHERE fm2.family_id IN (SELECT user_family_ids())
  ));
CREATE POLICY "Family members can insert home environment"
  ON home_environment FOR INSERT
  WITH CHECK (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));
CREATE POLICY "Family members can update home environment"
  ON home_environment FOR UPDATE
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));
CREATE POLICY "Family members can delete home environment"
  ON home_environment FOR DELETE
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

-- Drop and recreate school_evaluations policy
DROP POLICY IF EXISTS "Parents can manage school evaluations" ON school_evaluations;
CREATE POLICY "Family members can view school evaluations"
  ON school_evaluations FOR SELECT
  USING (parent_id IN (
    SELECT fm2.parent_id FROM family_members fm2
    WHERE fm2.family_id IN (SELECT user_family_ids())
  ));
CREATE POLICY "Family members can insert school evaluations"
  ON school_evaluations FOR INSERT
  WITH CHECK (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));
CREATE POLICY "Family members can update school evaluations"
  ON school_evaluations FOR UPDATE
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));
CREATE POLICY "Family members can delete school evaluations"
  ON school_evaluations FOR DELETE
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

-- Drop and recreate chat_threads policy
DROP POLICY IF EXISTS "Parents can manage chat threads" ON chat_threads;
CREATE POLICY "Family members can view chat threads"
  ON chat_threads FOR SELECT
  USING (parent_id IN (
    SELECT fm2.parent_id FROM family_members fm2
    WHERE fm2.family_id IN (SELECT user_family_ids())
  ));
CREATE POLICY "Users can insert own chat threads"
  ON chat_threads FOR INSERT
  WITH CHECK (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own chat threads"
  ON chat_threads FOR UPDATE
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own chat threads"
  ON chat_threads FOR DELETE
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

-- Drop and recreate chat_messages policy
DROP POLICY IF EXISTS "Parents can manage chat messages" ON chat_messages;
CREATE POLICY "Family members can view chat messages"
  ON chat_messages FOR SELECT
  USING (thread_id IN (
    SELECT id FROM chat_threads WHERE parent_id IN (
      SELECT fm2.parent_id FROM family_members fm2
      WHERE fm2.family_id IN (SELECT user_family_ids())
    )
  ));
CREATE POLICY "Users can insert chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (thread_id IN (
    SELECT id FROM chat_threads WHERE parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid())
  ));

-- Drop and recreate family_memory_summaries policy
DROP POLICY IF EXISTS "Parents can manage family memory" ON family_memory_summaries;
CREATE POLICY "Family members can view family memory"
  ON family_memory_summaries FOR SELECT
  USING (parent_id IN (
    SELECT fm2.parent_id FROM family_members fm2
    WHERE fm2.family_id IN (SELECT user_family_ids())
  ));
CREATE POLICY "Users can manage own family memory"
  ON family_memory_summaries FOR INSERT
  WITH CHECK (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own family memory"
  ON family_memory_summaries FOR UPDATE
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

-- Drop and recreate family_notes policy
DROP POLICY IF EXISTS "Parents can manage family notes" ON family_notes;
CREATE POLICY "Family members can view family notes"
  ON family_notes FOR SELECT
  USING (parent_id IN (
    SELECT fm2.parent_id FROM family_members fm2
    WHERE fm2.family_id IN (SELECT user_family_ids())
  ));
CREATE POLICY "Family members can insert family notes"
  ON family_notes FOR INSERT
  WITH CHECK (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));
CREATE POLICY "Family members can update family notes"
  ON family_notes FOR UPDATE
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));
CREATE POLICY "Family members can delete family notes"
  ON family_notes FOR DELETE
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

-- Drop and recreate parent_preferences policy
DROP POLICY IF EXISTS "Parents can manage own preferences" ON parent_preferences;
CREATE POLICY "Users can manage own preferences"
  ON parent_preferences FOR ALL
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

-- ================================================
-- NEW INDEXES
-- ================================================

CREATE INDEX idx_children_family_id ON children(family_id);
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_parent_id ON family_members(parent_id);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_family_id ON invitations(family_id);
CREATE INDEX idx_invitations_status ON invitations(status);

-- ================================================
-- PHASE 2: SCHOOLS (run separately when ready)
-- ================================================

-- Schools table
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  admin_user_id UUID REFERENCES auth.users NOT NULL,
  address TEXT,
  website TEXT,
  phone TEXT,
  credentials TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- School staff
CREATE TABLE school_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'staff', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, user_id)
);

-- School-family enrollment
CREATE TABLE school_families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(school_id, family_id)
);

-- Add foreign key on invitations.school_id now that schools table exists
ALTER TABLE invitations ADD CONSTRAINT invitations_school_id_fkey
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;

-- RLS for school tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_families ENABLE ROW LEVEL SECURITY;

-- Schools: staff can manage, public can view by slug (for invite pages)
CREATE POLICY "Staff can manage their school"
  ON schools FOR ALL
  USING (id IN (SELECT school_id FROM school_staff WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view schools by slug"
  ON schools FOR SELECT
  USING (true);

-- School staff: staff can view their colleagues
CREATE POLICY "Staff can view school staff"
  ON school_staff FOR SELECT
  USING (school_id IN (SELECT school_id FROM school_staff WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage school staff"
  ON school_staff FOR INSERT
  WITH CHECK (school_id IN (SELECT school_id FROM school_staff WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update school staff"
  ON school_staff FOR UPDATE
  USING (school_id IN (SELECT school_id FROM school_staff WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can remove school staff"
  ON school_staff FOR DELETE
  USING (school_id IN (SELECT school_id FROM school_staff WHERE user_id = auth.uid() AND role = 'admin'));

-- School families: staff sees enrollment, families see their own enrollment
CREATE POLICY "Staff can view school families"
  ON school_families FOR SELECT
  USING (school_id IN (SELECT school_id FROM school_staff WHERE user_id = auth.uid()));

CREATE POLICY "Families can view own enrollment"
  ON school_families FOR SELECT
  USING (family_id IN (SELECT user_family_ids()));

CREATE POLICY "School families can be created"
  ON school_families FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can update school families"
  ON school_families FOR UPDATE
  USING (school_id IN (SELECT school_id FROM school_staff WHERE user_id = auth.uid()));

-- School indexes
CREATE INDEX idx_schools_slug ON schools(slug);
CREATE INDEX idx_schools_admin ON schools(admin_user_id);
CREATE INDEX idx_school_staff_school_id ON school_staff(school_id);
CREATE INDEX idx_school_staff_user_id ON school_staff(user_id);
CREATE INDEX idx_school_families_school_id ON school_families(school_id);
CREATE INDEX idx_school_families_family_id ON school_families(family_id);
