-- Montessori Navigator Database Schema
-- Run this in your Supabase SQL editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- CORE USER TABLES
-- ================================================

-- Parents table (equivalent to Bench Coach's "coaches")
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  montessori_experience TEXT CHECK (montessori_experience IN ('new', 'familiar', 'experienced', 'trained')),
  education_context TEXT CHECK (education_context IN ('montessori_school', 'homeschool', 'hybrid', 'public_supplementing', 'exploring')),
  communication_style TEXT CHECK (communication_style IN ('direct', 'gentle', 'detailed', 'brief')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parent preferences (persistent, learned from interactions)
CREATE TABLE parent_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, key)
);

-- ================================================
-- CHILDREN & DEVELOPMENT
-- ================================================

-- Children (persistent identity)
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE,
  current_environment TEXT CHECK (current_environment IN ('montessori_school', 'homeschool', 'hybrid', 'public_school', 'preschool', 'not_yet_enrolled')),
  school_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Child developmental levels (equivalent to player skill ratings)
-- These track current assessed level in each Montessori curriculum area
CREATE TABLE child_development_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  area TEXT NOT NULL CHECK (area IN (
    'practical_life', 'sensorial', 'language', 'mathematics', 
    'cultural_studies', 'social_emotional', 'executive_function',
    'gross_motor', 'fine_motor', 'art_music'
  )),
  level INT CHECK (level BETWEEN 1 AND 5), -- 1=Emerging, 2=Developing, 3=Practicing, 4=Proficient, 5=Mastered
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(child_id, area)
);

-- Child traits (persistent personality/behavior notes, like Bench Coach player_traits)
CREATE TABLE child_traits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- OBSERVATION LOG (equivalent to player journal)
-- ================================================

CREATE TABLE observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN (
    'home_activity', 'school_observation', 'milestone_reached', 
    'challenge_noted', 'interest_spark', 'conference_notes', 'general'
  )),
  curriculum_area TEXT CHECK (curriculum_area IN (
    'practical_life', 'sensorial', 'language', 'mathematics',
    'cultural_studies', 'social_emotional', 'executive_function',
    'gross_motor', 'fine_motor', 'art_music', 'general'
  )),
  title TEXT,
  description TEXT NOT NULL,
  went_well TEXT,
  needs_support TEXT,
  next_steps TEXT,
  tags JSONB, -- flexible tagging: ["concentration", "independence", "social"]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- MILESTONES
-- ================================================

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  curriculum_area TEXT NOT NULL CHECK (curriculum_area IN (
    'practical_life', 'sensorial', 'language', 'mathematics',
    'cultural_studies', 'social_emotional', 'executive_function',
    'gross_motor', 'fine_motor', 'art_music'
  )),
  milestone_name TEXT NOT NULL,
  description TEXT,
  age_plane TEXT CHECK (age_plane IN ('0-3', '3-6', '6-9', '9-12', '12+')),
  achieved BOOLEAN DEFAULT FALSE,
  achieved_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- LEARNING PLANS (equivalent to practice plans)
-- ================================================

CREATE TABLE learning_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('daily', 'weekly', 'focus', 'catchup')),
  focus_areas JSONB, -- ["practical_life", "language"]
  duration_days INT DEFAULT 1,
  content JSONB, -- structured activity blocks (see anthropic.ts for format)
  constraints TEXT, -- "only 30 min today", "no messy activities", etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- ACTIVITY LIBRARY (equivalent to drill resources)
-- ================================================

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  curriculum_area TEXT NOT NULL CHECK (curriculum_area IN (
    'practical_life', 'sensorial', 'language', 'mathematics',
    'cultural_studies', 'social_emotional', 'executive_function',
    'gross_motor', 'fine_motor', 'art_music'
  )),
  age_plane TEXT CHECK (age_plane IN ('0-3', '3-6', '6-9', '9-12', '12+')),
  difficulty_level TEXT CHECK (difficulty_level IN ('introductory', 'developing', 'intermediate', 'advanced', 'extension')),
  description TEXT,
  direct_aim TEXT,
  indirect_aim TEXT,
  prerequisites TEXT, -- what child should know first
  presentation_steps JSONB, -- ["Step 1: ...", "Step 2: ..."]
  materials_needed JSONB, -- ["small pitcher", "tray", "sponge"]
  common_errors TEXT,
  extensions TEXT, -- what to do when child masters this
  video_url TEXT,
  video_source TEXT,
  diy_alternative TEXT,
  safety_notes TEXT,
  ai_notes TEXT, -- notes for the AI to reference
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- PREPARED ENVIRONMENT
-- ================================================

CREATE TABLE home_environment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL,
  room TEXT NOT NULL CHECK (room IN (
    'childs_room', 'kitchen', 'bathroom', 'living_learning', 'outdoor', 'other'
  )),
  setup_notes JSONB, -- flexible key-value for what they have set up
  materials_on_hand JSONB, -- ["pouring set", "dressing frames", "number rods"]
  last_rotation_date DATE,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, room)
);

-- ================================================
-- SCHOOL EVALUATION (new feature, no Bench Coach equivalent)
-- ================================================

CREATE TABLE school_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL,
  school_name TEXT NOT NULL,
  visit_date DATE,
  credentials TEXT, -- "AMI", "AMS", "MACTE", etc.
  age_range TEXT,
  observations JSONB, -- structured tour observations
  ai_debrief JSONB, -- AI analysis results
  comparison_score JSONB, -- scored criteria for comparison
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- CHAT SYSTEM (same pattern as Bench Coach)
-- ================================================

CREATE TABLE chat_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE SET NULL, -- optional: thread may be about a specific child
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  memory_suggestions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family memory summaries (rolling context, like team_memory_summaries)
CREATE TABLE family_memory_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- NOTES SYSTEM
-- ================================================

CREATE TABLE family_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES children(id) ON DELETE SET NULL, -- null = family-level note
  title TEXT,
  note TEXT NOT NULL,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_development_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_environment ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_memory_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_notes ENABLE ROW LEVEL SECURITY;

-- Parents policies
CREATE POLICY "Users can view own parent profile"
  ON parents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own parent profile"
  ON parents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own parent profile"
  ON parents FOR UPDATE
  USING (auth.uid() = user_id);

-- Parent preferences policies
CREATE POLICY "Parents can manage own preferences"
  ON parent_preferences FOR ALL
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

-- Children policies
CREATE POLICY "Parents can view own children"
  ON children FOR SELECT
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

CREATE POLICY "Parents can insert own children"
  ON children FOR INSERT
  WITH CHECK (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

CREATE POLICY "Parents can update own children"
  ON children FOR UPDATE
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

CREATE POLICY "Parents can delete own children"
  ON children FOR DELETE
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

-- Child development levels
CREATE POLICY "Parents can manage child development levels"
  ON child_development_levels FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid())));

-- Child traits
CREATE POLICY "Parents can manage child traits"
  ON child_traits FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid())));

-- Observations
CREATE POLICY "Parents can manage observations"
  ON observations FOR ALL
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

-- Milestones
CREATE POLICY "Parents can manage milestones"
  ON milestones FOR ALL
  USING (child_id IN (SELECT id FROM children WHERE parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid())));

-- Learning plans
CREATE POLICY "Parents can manage learning plans"
  ON learning_plans FOR ALL
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

-- Activities (public read, admin write - for now allow all read)
CREATE POLICY "Anyone can view activities"
  ON activities FOR SELECT
  USING (true);

-- Home environment
CREATE POLICY "Parents can manage home environment"
  ON home_environment FOR ALL
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

-- School evaluations
CREATE POLICY "Parents can manage school evaluations"
  ON school_evaluations FOR ALL
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

-- Chat threads
CREATE POLICY "Parents can manage chat threads"
  ON chat_threads FOR ALL
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

-- Chat messages
CREATE POLICY "Parents can manage chat messages"
  ON chat_messages FOR ALL
  USING (thread_id IN (SELECT id FROM chat_threads WHERE parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid())));

-- Family memory summaries
CREATE POLICY "Parents can manage family memory"
  ON family_memory_summaries FOR ALL
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

-- Family notes
CREATE POLICY "Parents can manage family notes"
  ON family_notes FOR ALL
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

-- ================================================
-- INDEXES
-- ================================================

CREATE INDEX idx_parents_user_id ON parents(user_id);
CREATE INDEX idx_children_parent_id ON children(parent_id);
CREATE INDEX idx_child_dev_levels_child_id ON child_development_levels(child_id);
CREATE INDEX idx_child_traits_child_id ON child_traits(child_id);
CREATE INDEX idx_observations_child_id ON observations(child_id);
CREATE INDEX idx_observations_parent_id ON observations(parent_id);
CREATE INDEX idx_observations_date ON observations(date);
CREATE INDEX idx_observations_type ON observations(type);
CREATE INDEX idx_milestones_child_id ON milestones(child_id);
CREATE INDEX idx_milestones_area ON milestones(curriculum_area);
CREATE INDEX idx_learning_plans_child_id ON learning_plans(child_id);
CREATE INDEX idx_learning_plans_parent_id ON learning_plans(parent_id);
CREATE INDEX idx_activities_area ON activities(curriculum_area);
CREATE INDEX idx_activities_age ON activities(age_plane);
CREATE INDEX idx_home_env_parent_id ON home_environment(parent_id);
CREATE INDEX idx_school_eval_parent_id ON school_evaluations(parent_id);
CREATE INDEX idx_chat_threads_parent_id ON chat_threads(parent_id);
CREATE INDEX idx_chat_threads_child_id ON chat_threads(child_id);
CREATE INDEX idx_chat_messages_thread_id ON chat_messages(thread_id);
CREATE INDEX idx_family_notes_parent_id ON family_notes(parent_id);
CREATE INDEX idx_family_notes_child_id ON family_notes(child_id);
