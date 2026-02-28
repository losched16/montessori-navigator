-- Create child_skill_progress table for tracking curriculum skill completion per child
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

CREATE TABLE IF NOT EXISTS child_skill_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  skill_index INTEGER NOT NULL,
  skill_area TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'mastered')),
  date_started DATE,
  date_mastered DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(child_id, skill_index)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_child_skill_progress_child_area ON child_skill_progress(child_id, skill_area);
CREATE INDEX IF NOT EXISTS idx_child_skill_progress_child ON child_skill_progress(child_id);

-- Enable RLS
ALTER TABLE child_skill_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies: parents can only access their own children's data
CREATE POLICY "Parents can view their children's skill progress"
  ON child_skill_progress FOR SELECT
  USING (
    child_id IN (
      SELECT c.id FROM children c
      JOIN parents p ON c.parent_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert their children's skill progress"
  ON child_skill_progress FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT c.id FROM children c
      JOIN parents p ON c.parent_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update their children's skill progress"
  ON child_skill_progress FOR UPDATE
  USING (
    child_id IN (
      SELECT c.id FROM children c
      JOIN parents p ON c.parent_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can delete their children's skill progress"
  ON child_skill_progress FOR DELETE
  USING (
    child_id IN (
      SELECT c.id FROM children c
      JOIN parents p ON c.parent_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );
