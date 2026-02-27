-- Montessori Navigator Milestone Seed Data
-- Run in Supabase SQL Editor AFTER the main schema
-- These are reference milestones — parents check them off as children achieve them
-- ================================================

-- Note: child_id is required but these are TEMPLATE milestones
-- We'll insert them per-child via the app. This file creates a 
-- milestone_templates table for reference, then the app copies 
-- relevant ones to each child based on age plane.

-- ================================================
-- CREATE MILESTONE TEMPLATES TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS milestone_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  curriculum_area TEXT NOT NULL,
  age_plane TEXT NOT NULL CHECK (age_plane IN ('0-3', '3-6', '6-9', '9-12', '12+')),
  milestone_name TEXT NOT NULL,
  description TEXT,
  typical_age_range TEXT,
  sort_order INT DEFAULT 0,
  category TEXT -- sub-grouping within curriculum area
);

-- ================================================
-- PRACTICAL LIFE — 0-3
-- ================================================

INSERT INTO milestone_templates (curriculum_area, age_plane, milestone_name, description, typical_age_range, sort_order, category) VALUES
('practical_life', '0-3', 'Drinks from an open cup', 'Holds and drinks from a small open cup with minimal spilling', '8-14 months', 1, 'care_of_self'),
('practical_life', '0-3', 'Feeds self with spoon', 'Brings spoon to mouth independently, even if messy', '10-16 months', 2, 'care_of_self'),
('practical_life', '0-3', 'Removes shoes independently', 'Takes off velcro or slip-on shoes without help', '12-18 months', 3, 'dressing'),
('practical_life', '0-3', 'Puts on shoes with help', 'Attempts to put shoes on correct feet with minimal guidance', '18-24 months', 4, 'dressing'),
('practical_life', '0-3', 'Washes hands with guidance', 'Follows basic hand washing steps with verbal or physical cues', '14-20 months', 5, 'care_of_self'),
('practical_life', '0-3', 'Transfers objects hand to hand', 'Moves objects from one bowl to another using hands', '12-18 months', 6, 'fine_motor_prep'),
('practical_life', '0-3', 'Pours dry materials', 'Pours rice or beans from one container to another with some control', '18-24 months', 7, 'pouring'),
('practical_life', '0-3', 'Uses a sponge to wipe', 'Squeezes and wipes a surface with a sponge', '18-24 months', 8, 'care_of_environment'),
('practical_life', '0-3', 'Helps set the table', 'Places napkins, plates, or cups in approximate positions', '20-30 months', 9, 'care_of_environment'),
('practical_life', '0-3', 'Opens and closes containers', 'Manages lids on jars, boxes, and simple containers', '14-20 months', 10, 'fine_motor_prep'),
('practical_life', '0-3', 'Puts toys back on shelf', 'Returns materials to their place after use (with reminding)', '18-30 months', 11, 'order'),
('practical_life', '0-3', 'Uses velcro fastenings', 'Opens and closes velcro on clothing or dressing frames', '18-24 months', 12, 'dressing'),
('practical_life', '0-3', 'Pulls up pants independently', 'Manages elastic waistbands after toileting', '24-36 months', 13, 'dressing'),
('practical_life', '0-3', 'Carries a tray with objects', 'Transports a small tray without dropping contents', '20-30 months', 14, 'coordination');

-- ================================================
-- PRACTICAL LIFE — 3-6
-- ================================================

INSERT INTO milestone_templates (curriculum_area, age_plane, milestone_name, description, typical_age_range, sort_order, category) VALUES
('practical_life', '3-6', 'Pours water without spilling', 'Pours water from pitcher to glass with control', '3-4 years', 1, 'pouring'),
('practical_life', '3-6', 'Buttons and unbuttons', 'Manages buttons on clothing or dressing frames', '3-4 years', 2, 'dressing'),
('practical_life', '3-6', 'Uses scissors to cut on a line', 'Cuts paper along a straight or curved line', '3.5-5 years', 3, 'fine_motor'),
('practical_life', '3-6', 'Ties a basic knot', 'Completes the first step of tying (before bow)', '4-5 years', 4, 'dressing'),
('practical_life', '3-6', 'Ties a bow', 'Ties shoes or a ribbon into a bow independently', '5-6 years', 5, 'dressing'),
('practical_life', '3-6', 'Prepares a simple snack', 'Slices banana, spreads butter, or assembles a simple snack independently', '3.5-5 years', 6, 'food_prep'),
('practical_life', '3-6', 'Washes hands independently', 'Completes full hand washing sequence without prompting', '3-4 years', 7, 'care_of_self'),
('practical_life', '3-6', 'Sweeps with dustpan', 'Sweeps crumbs or spills into a dustpan effectively', '3.5-5 years', 8, 'care_of_environment'),
('practical_life', '3-6', 'Completes a table washing sequence', 'Follows multi-step process: wet, soap, scrub, rinse, dry', '4-5 years', 9, 'care_of_environment'),
('practical_life', '3-6', 'Sews a running stitch', 'Threads a needle and completes a basic running stitch', '4.5-6 years', 10, 'fine_motor'),
('practical_life', '3-6', 'Uses a zipper independently', 'Zips and unzips jackets including the starting mechanism', '3.5-5 years', 11, 'dressing'),
('practical_life', '3-6', 'Arranges flowers in a vase', 'Cuts stems, fills vase, and creates an arrangement', '4-6 years', 12, 'care_of_environment'),
('practical_life', '3-6', 'Polishes shoes or metal', 'Follows a complete polishing sequence', '4.5-6 years', 13, 'care_of_environment'),
('practical_life', '3-6', 'Folds cloth napkins', 'Folds fabric into halves and quarters neatly', '3.5-5 years', 14, 'order');

-- ================================================
-- SENSORIAL — 3-6
-- ================================================

INSERT INTO milestone_templates (curriculum_area, age_plane, milestone_name, description, typical_age_range, sort_order, category) VALUES
('sensorial', '3-6', 'Matches primary colors', 'Correctly pairs red, blue, and yellow color tablets', '2.5-3.5 years', 1, 'visual'),
('sensorial', '3-6', 'Matches 11 color pairs', 'Matches all color tablets in Box 2', '3-4 years', 2, 'visual'),
('sensorial', '3-6', 'Grades colors light to dark', 'Arranges color shades in correct gradient (Color Box 3)', '4-5 years', 3, 'visual'),
('sensorial', '3-6', 'Builds Pink Tower correctly', 'Stacks all 10 cubes in correct size order', '2.5-4 years', 4, 'visual'),
('sensorial', '3-6', 'Builds Brown Stair', 'Arranges all 10 prisms in correct order', '3-4 years', 5, 'visual'),
('sensorial', '3-6', 'Completes Cylinder Blocks', 'Places all cylinders correctly in at least one block', '2.5-4 years', 6, 'visual'),
('sensorial', '3-6', 'Matches sound cylinders', 'Pairs matching sounds from two sets', '3.5-5 years', 7, 'auditory'),
('sensorial', '3-6', 'Matches fabrics by touch', 'Pairs fabric swatches using tactile sense only', '3.5-5 years', 8, 'tactile'),
('sensorial', '3-6', 'Sorts rough and smooth', 'Distinguishes and grades textures from roughest to smoothest', '3-4 years', 9, 'tactile'),
('sensorial', '3-6', 'Completes Binomial Cube', 'Assembles the binomial cube inside the box using color guides', '4-5.5 years', 10, 'visual'),
('sensorial', '3-6', 'Identifies geometric solids', 'Names sphere, cube, cylinder, cone, and pyramid by touch and sight', '3.5-5 years', 11, 'stereognostic'),
('sensorial', '3-6', 'Matches geometric shapes', 'Pairs geometric cabinet shapes to cards', '3-5 years', 12, 'visual'),
('sensorial', '3-6', 'Discriminates weights', 'Orders baric tablets from lightest to heaviest', '4-5.5 years', 13, 'baric'),
('sensorial', '3-6', 'Discriminates temperatures', 'Orders thermic bottles from coldest to warmest', '4-5.5 years', 14, 'thermic');

-- ================================================
-- LANGUAGE — 3-6
-- ================================================

INSERT INTO milestone_templates (curriculum_area, age_plane, milestone_name, description, typical_age_range, sort_order, category) VALUES
('language', '3-6', 'Identifies beginning sounds', 'Correctly identifies the first sound in spoken words (I Spy)', '3-4 years', 1, 'phonemic_awareness'),
('language', '3-6', 'Identifies ending sounds', 'Correctly identifies the last sound in spoken words', '3.5-4.5 years', 2, 'phonemic_awareness'),
('language', '3-6', 'Traces sandpaper letters', 'Traces letter shapes while saying sounds for 10+ letters', '3-4 years', 3, 'writing_prep'),
('language', '3-6', 'Knows all letter sounds', 'Associates correct phonetic sound with all 26 sandpaper letters', '3.5-5 years', 4, 'writing_prep'),
('language', '3-6', 'Builds CVC words with Moveable Alphabet', 'Spells simple consonant-vowel-consonant words phonetically', '3.5-5 years', 5, 'writing'),
('language', '3-6', 'Writes first name', 'Writes their own name legibly (even if imperfect)', '4-5 years', 6, 'writing'),
('language', '3-6', 'Writes words with pencil', 'Transfers from Moveable Alphabet to pencil writing', '4.5-5.5 years', 7, 'writing'),
('language', '3-6', 'Reads phonetic words', 'Decodes and reads simple CVC words independently', '4-5.5 years', 8, 'reading'),
('language', '3-6', 'Reads phonetic sentences', 'Reads simple sentences composed of phonetic words', '4.5-6 years', 9, 'reading'),
('language', '3-6', 'Reads sight words', 'Recognizes common non-phonetic words (the, is, was, said)', '5-6 years', 10, 'reading'),
('language', '3-6', 'Reads short books independently', 'Reads simple early readers with comprehension', '5-6.5 years', 11, 'reading'),
('language', '3-6', 'Identifies parts of speech (noun/verb)', 'Understands that words have functions — naming words and action words', '5-6 years', 12, 'grammar'),
('language', '3-6', 'Retells a story in sequence', 'Recounts a story with beginning, middle, and end', '4-5.5 years', 13, 'comprehension'),
('language', '3-6', 'Uses complete sentences', 'Speaks in grammatically complete sentences of 5+ words', '3-4 years', 14, 'oral_language');

-- ================================================
-- MATHEMATICS — 3-6
-- ================================================

INSERT INTO milestone_templates (curriculum_area, age_plane, milestone_name, description, typical_age_range, sort_order, category) VALUES
('mathematics', '3-6', 'Counts to 10 with objects', 'Counts objects 1-10 with one-to-one correspondence', '3-4 years', 1, 'counting'),
('mathematics', '3-6', 'Recognizes numerals 0-9', 'Identifies and names written numerals', '3-4 years', 2, 'numeral_recognition'),
('mathematics', '3-6', 'Understands zero', 'Comprehends that zero means "none" (Spindle Boxes)', '3-4 years', 3, 'number_concepts'),
('mathematics', '3-6', 'Associates numerals with quantity', 'Matches numeral cards to correct quantities (Cards and Counters)', '3.5-4.5 years', 4, 'number_concepts'),
('mathematics', '3-6', 'Counts to 100 (verbal)', 'Can count by rote to 100', '4-5 years', 5, 'counting'),
('mathematics', '3-6', 'Understands teens (11-19)', 'Composes and reads teen numbers with Ten Board', '4-5 years', 6, 'decimal_system'),
('mathematics', '3-6', 'Understands tens (10-90)', 'Composes and reads tens with Ten Board', '4-5.5 years', 7, 'decimal_system'),
('mathematics', '3-6', 'Identifies units, tens, hundreds, thousands', 'Names and distinguishes golden bead categories', '4-5 years', 8, 'decimal_system'),
('mathematics', '3-6', 'Adds with golden beads', 'Performs addition combining quantities and numerals', '4.5-5.5 years', 9, 'operations'),
('mathematics', '3-6', 'Subtracts with golden beads', 'Performs subtraction (take away) with beads', '4.5-6 years', 10, 'operations'),
('mathematics', '3-6', 'Adds with Stamp Game', 'Performs multi-digit addition with exchanging using stamps', '5-6 years', 11, 'operations'),
('mathematics', '3-6', 'Counts by skip counting', 'Counts by 2s, 5s, or 10s using bead chains', '4.5-6 years', 12, 'counting'),
('mathematics', '3-6', 'Understands odd and even', 'Sorts numbers into odd and even categories', '4-5 years', 13, 'number_concepts'),
('mathematics', '3-6', 'Recognizes basic shapes', 'Names circle, square, triangle, rectangle', '3-4 years', 14, 'geometry');

-- ================================================
-- CULTURAL STUDIES — 3-6
-- ================================================

INSERT INTO milestone_templates (curriculum_area, age_plane, milestone_name, description, typical_age_range, sort_order, category) VALUES
('cultural_studies', '3-6', 'Identifies land and water on globe', 'Understands that blue is water and rough/colored parts are land', '3-4 years', 1, 'geography'),
('cultural_studies', '3-6', 'Names all 7 continents', 'Can identify and name each continent', '3.5-5 years', 2, 'geography'),
('cultural_studies', '3-6', 'Completes continent puzzle map', 'Places all continents correctly in the puzzle', '3.5-5 years', 3, 'geography'),
('cultural_studies', '3-6', 'Identifies land and water forms', 'Knows at least 3 pairs (island/lake, cape/bay, etc.)', '4-5.5 years', 4, 'geography'),
('cultural_studies', '3-6', 'Names parts of a leaf', 'Identifies blade, petiole, and veins', '3.5-5 years', 5, 'botany'),
('cultural_studies', '3-6', 'Names parts of a flower', 'Identifies petals, stem, pistil, stamen', '4-5.5 years', 6, 'botany'),
('cultural_studies', '3-6', 'Classifies living and non-living', 'Sorts objects/pictures into living and non-living categories', '3.5-5 years', 7, 'science'),
('cultural_studies', '3-6', 'Identifies basic animal groups', 'Knows mammals, birds, fish, reptiles, insects', '4-5.5 years', 8, 'zoology'),
('cultural_studies', '3-6', 'Cares for a classroom/home plant', 'Waters and tends to a plant as a regular responsibility', '3-5 years', 9, 'botany'),
('cultural_studies', '3-6', 'Understands day and night cycle', 'Explains why we have day and night (Earth rotation)', '4.5-6 years', 10, 'science'),
('cultural_studies', '3-6', 'Identifies seasons and their characteristics', 'Names the four seasons and describes weather/nature changes', '4-5 years', 11, 'science'),
('cultural_studies', '3-6', 'Knows home address and country', 'Can state where they live in geographic context', '4-5 years', 12, 'geography');

-- ================================================
-- SOCIAL-EMOTIONAL — 0-3 and 3-6
-- ================================================

INSERT INTO milestone_templates (curriculum_area, age_plane, milestone_name, description, typical_age_range, sort_order, category) VALUES
('social_emotional', '0-3', 'Shows interest in other children', 'Watches, approaches, or attempts to interact with peers', '12-18 months', 1, 'social'),
('social_emotional', '0-3', 'Engages in parallel play', 'Plays alongside other children with similar materials', '18-30 months', 2, 'social'),
('social_emotional', '0-3', 'Expresses basic emotions verbally', 'Uses words like happy, sad, mad instead of only crying or hitting', '24-36 months', 3, 'emotional'),
('social_emotional', '0-3', 'Separates from caregiver', 'Transitions to a new environment without prolonged distress', '18-36 months', 4, 'emotional'),
('social_emotional', '0-3', 'Shows empathy toward others', 'Offers comfort when someone is upset (patting, bringing a toy)', '20-30 months', 5, 'emotional'),

('social_emotional', '3-6', 'Takes turns in activities', 'Waits for a turn without adult prompting most of the time', '3-4 years', 1, 'social'),
('social_emotional', '3-6', 'Resolves conflicts with words', 'Uses "I feel" statements or asks for help instead of physical response', '4-6 years', 2, 'conflict_resolution'),
('social_emotional', '3-6', 'Shows grace and courtesy in greetings', 'Greets adults and children politely without prompting', '3.5-5 years', 3, 'grace_courtesy'),
('social_emotional', '3-6', 'Waits without interrupting', 'Waits for an adult to finish speaking before talking', '4-6 years', 4, 'grace_courtesy'),
('social_emotional', '3-6', 'Helps younger children', 'Voluntarily assists a younger child with a task', '4-6 years', 5, 'social'),
('social_emotional', '3-6', 'Expresses needs appropriately', 'Asks for help, states needs, or advocates for self calmly', '3.5-5 years', 6, 'emotional'),
('social_emotional', '3-6', 'Manages frustration', 'Uses a calming strategy (breathing, walking away, asking for help) when frustrated', '4-6 years', 7, 'emotional'),
('social_emotional', '3-6', 'Shows pride in completed work', 'Demonstrates satisfaction with their own effort (not seeking external praise)', '3.5-5 years', 8, 'emotional'),
('social_emotional', '3-6', 'Apologizes genuinely', 'Says sorry and shows understanding of impact on others', '4-6 years', 9, 'conflict_resolution'),
('social_emotional', '3-6', 'Follows classroom/home agreements', 'Adheres to established rules and expectations with minimal reminding', '4-6 years', 10, 'self_regulation');

-- ================================================
-- EXECUTIVE FUNCTION — 3-6
-- ================================================

INSERT INTO milestone_templates (curriculum_area, age_plane, milestone_name, description, typical_age_range, sort_order, category) VALUES
('executive_function', '3-6', 'Completes a work cycle', 'Chooses an activity, works on it, and puts it away without wandering', '3-4 years', 1, 'task_completion'),
('executive_function', '3-6', 'Follows a 3-step sequence', 'Completes three sequential instructions without reminding', '3-4 years', 2, 'sequencing'),
('executive_function', '3-6', 'Sustains focus for 10+ minutes', 'Remains engaged with a single activity for an extended period', '3-5 years', 3, 'concentration'),
('executive_function', '3-6', 'Sustains focus for 20+ minutes', 'Deep concentration on a chosen activity without interruption', '4-6 years', 4, 'concentration'),
('executive_function', '3-6', 'Plans and executes a simple project', 'Decides what to do, gathers materials, completes the task', '4-6 years', 5, 'planning'),
('executive_function', '3-6', 'Waits for a desired item or activity', 'Delays gratification for a short period without distress', '3-5 years', 6, 'impulse_control'),
('executive_function', '3-6', 'Adapts when plans change', 'Manages transitions or unexpected changes without meltdown', '4-6 years', 7, 'flexibility'),
('executive_function', '3-6', 'Organizes materials independently', 'Returns items to correct places and keeps workspace tidy during work', '3.5-5 years', 8, 'organization'),
('executive_function', '3-6', 'Self-corrects errors', 'Notices own mistakes and adjusts without adult intervention', '4-6 years', 9, 'self_monitoring'),
('executive_function', '3-6', 'Remembers and follows daily routine', 'Knows the sequence of daily activities without constant reminders', '4-5 years', 10, 'working_memory');

-- ================================================
-- GROSS MOTOR & FINE MOTOR — 0-3
-- ================================================

INSERT INTO milestone_templates (curriculum_area, age_plane, milestone_name, description, typical_age_range, sort_order, category) VALUES
('gross_motor', '0-3', 'Walks independently', 'Takes steps and walks without holding onto furniture or hands', '9-16 months', 1, 'locomotion'),
('gross_motor', '0-3', 'Climbs stairs with railing', 'Goes up stairs holding a railing, one step at a time', '18-24 months', 2, 'locomotion'),
('gross_motor', '0-3', 'Runs with coordination', 'Runs without frequently falling', '18-30 months', 3, 'locomotion'),
('gross_motor', '0-3', 'Jumps with both feet', 'Leaves the ground with both feet simultaneously', '24-36 months', 4, 'locomotion'),
('gross_motor', '0-3', 'Kicks a ball forward', 'Kicks a ball intentionally in a forward direction', '18-30 months', 5, 'coordination'),
('gross_motor', '0-3', 'Walks on a line', 'Follows a line on the floor with controlled steps', '24-36 months', 6, 'balance'),

('fine_motor', '0-3', 'Uses pincer grasp', 'Picks up small objects with thumb and forefinger', '8-12 months', 1, 'grasp'),
('fine_motor', '0-3', 'Stacks 3+ blocks', 'Builds a tower of at least 3 blocks', '12-18 months', 2, 'coordination'),
('fine_motor', '0-3', 'Turns pages of a book', 'Turns pages one at a time (board book or paper)', '12-24 months', 3, 'coordination'),
('fine_motor', '0-3', 'Makes marks with crayons', 'Scribbles intentionally on paper', '12-18 months', 4, 'pre_writing'),
('fine_motor', '0-3', 'Threads large beads', 'Strings beads onto a thick lace', '18-30 months', 5, 'coordination'),
('fine_motor', '0-3', 'Uses playdough with purpose', 'Rolls, squeezes, and manipulates dough intentionally', '18-30 months', 6, 'hand_strength');

-- ================================================
-- ELEMENTARY MILESTONES — 6-9
-- ================================================

INSERT INTO milestone_templates (curriculum_area, age_plane, milestone_name, description, typical_age_range, sort_order, category) VALUES
('language', '6-9', 'Reads chapter books independently', 'Reads multi-chapter books with comprehension and enjoyment', '6-8 years', 1, 'reading'),
('language', '6-9', 'Writes multi-paragraph compositions', 'Composes organized writing with introduction, body, and conclusion', '7-9 years', 2, 'writing'),
('language', '6-9', 'Identifies all parts of speech', 'Names and uses nouns, verbs, adjectives, adverbs, prepositions, etc.', '6-8 years', 3, 'grammar'),
('language', '6-9', 'Conducts independent research', 'Gathers information from multiple sources and synthesizes findings', '7-9 years', 4, 'research'),
('language', '6-9', 'Spells phonetically and conventionally', 'Moves beyond phonetic spelling to conventional spelling for common words', '6-8 years', 5, 'writing'),

('mathematics', '6-9', 'Memorizes addition facts', 'Recalls single-digit addition facts automatically', '6-7 years', 1, 'operations'),
('mathematics', '6-9', 'Memorizes multiplication facts', 'Recalls multiplication tables through 12', '7-9 years', 2, 'operations'),
('mathematics', '6-9', 'Performs long division', 'Completes multi-digit division with stamp game then abstractly', '7-9 years', 3, 'operations'),
('mathematics', '6-9', 'Understands fractions concretely', 'Uses fraction materials to add, subtract, and compare fractions', '7-9 years', 4, 'fractions'),
('mathematics', '6-9', 'Tells time on analog clock', 'Reads hours, half hours, and minutes on an analog clock', '6-8 years', 5, 'measurement'),
('mathematics', '6-9', 'Understands place value to millions', 'Can read, write, and compose numbers into the millions', '7-9 years', 6, 'decimal_system'),

('cultural_studies', '6-9', 'Creates a timeline project', 'Researches and presents a historical or scientific timeline', '7-9 years', 1, 'history'),
('cultural_studies', '6-9', 'Identifies countries on a map', 'Locates major countries on continent puzzle maps', '6-8 years', 2, 'geography'),
('cultural_studies', '6-9', 'Completes a research booklet', 'Independently researches and writes about a topic of interest', '7-9 years', 3, 'research'),
('cultural_studies', '6-9', 'Understands basic ecology', 'Explains food chains, habitats, and interdependence of living things', '7-9 years', 4, 'science'),

('social_emotional', '6-9', 'Collaborates on group projects', 'Works cooperatively with peers toward a shared goal', '6-8 years', 1, 'social'),
('social_emotional', '6-9', 'Resolves peer conflicts independently', 'Mediates disagreements without adult intervention most of the time', '7-9 years', 2, 'conflict_resolution'),
('social_emotional', '6-9', 'Shows responsibility for community', 'Takes on classroom/home responsibilities without being asked', '6-9 years', 3, 'responsibility');

-- ================================================
-- ADOLESCENT MILESTONES — 12+
-- ================================================

INSERT INTO milestone_templates (curriculum_area, age_plane, milestone_name, description, typical_age_range, sort_order, category) VALUES
('practical_life', '12+', 'Manages a personal budget', 'Tracks income and expenses, makes financial decisions', '12-15 years', 1, 'life_skills'),
('practical_life', '12+', 'Cooks a complete meal independently', 'Plans, shops for, and prepares a full meal for the family', '12-15 years', 2, 'life_skills'),
('practical_life', '12+', 'Completes a micro-economy project', 'Creates and manages a small business or service project', '12-16 years', 3, 'life_skills'),
('social_emotional', '12+', 'Demonstrates civic awareness', 'Understands community issues and participates in civic activities', '12-16 years', 1, 'social'),
('social_emotional', '12+', 'Mentors younger children', 'Voluntarily teaches or guides younger children in activities', '12-16 years', 2, 'social'),
('executive_function', '12+', 'Manages long-term projects independently', 'Plans, executes, and completes multi-week projects without adult management', '12-16 years', 1, 'planning'),
('executive_function', '12+', 'Self-advocates in educational settings', 'Communicates needs, asks questions, and seeks help proactively', '12-16 years', 2, 'self_advocacy');

-- ================================================
-- Create index for fast lookups
-- ================================================

CREATE INDEX idx_milestone_templates_age ON milestone_templates(age_plane);
CREATE INDEX idx_milestone_templates_area ON milestone_templates(curriculum_area);

-- ================================================
-- FUNCTION: Copy relevant milestones to a child
-- Call this when creating a child or when they transition age planes
-- ================================================

CREATE OR REPLACE FUNCTION copy_milestones_for_child(
  p_child_id UUID,
  p_age_plane TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO milestones (child_id, curriculum_area, milestone_name, description, age_plane, achieved, achieved_date)
  SELECT 
    p_child_id,
    mt.curriculum_area,
    mt.milestone_name,
    mt.description,
    mt.age_plane,
    false,
    null
  FROM milestone_templates mt
  WHERE mt.age_plane = p_age_plane
  AND NOT EXISTS (
    SELECT 1 FROM milestones m 
    WHERE m.child_id = p_child_id 
    AND m.milestone_name = mt.milestone_name
  )
  ORDER BY mt.curriculum_area, mt.sort_order;
END;
$$ LANGUAGE plpgsql;
