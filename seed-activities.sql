-- Montessori Navigator Activity Library Seed Data
-- Run this in Supabase SQL Editor AFTER the main schema
-- ================================================

-- ================================================
-- PRACTICAL LIFE — Ages 0-3
-- ================================================

INSERT INTO activities (name, curriculum_area, age_plane, difficulty_level, description, direct_aim, indirect_aim, prerequisites, presentation_steps, materials_needed, common_errors, extensions, diy_alternative, safety_notes, ai_notes) VALUES

('Transferring with Hands', 'practical_life', '0-3', 'introductory',
 'Child transfers objects (large beans, pompoms, or wooden eggs) from one bowl to another using their hands.',
 'Coordination of hand movements, transferring objects',
 'Concentration, independence, order, fine motor preparation for later pouring work',
 'None — this is often a first practical life activity',
 '["Place two bowls side by side on a tray, objects in the left bowl", "Sit beside the child (not across)", "Slowly pick up one object with your dominant hand", "Place it deliberately in the empty bowl", "Repeat until all objects are transferred", "Pause. Then transfer them back", "Invite the child: Would you like to try?"]',
 '["Small tray", "Two matching bowls", "Large dried beans, pompoms, or wooden eggs (6-8 pieces)"]',
 'Rushing, using both hands at once, dropping objects off the tray. These are all normal — avoid correcting verbally. Simply model again another time.',
 'Progress to smaller objects, then to transferring with a spoon, then tongs, then tweezers.',
 'Use any two matching containers from your kitchen and large pasta shapes or cotton balls.',
 'Use objects large enough to not be a choking hazard for the child''s age.',
 'This is foundational. Many parents skip it as "too simple" but it builds concentration and the work cycle. Encourage parents to let the child repeat as many times as they want.'),

('Pouring Dry Materials', 'practical_life', '0-3', 'introductory',
 'Child pours dry materials (rice, lentils, or birdseed) from one small pitcher to another.',
 'Pouring control, wrist rotation',
 'Preparation for pouring liquids, concentration, independence at mealtimes',
 'Transferring with hands',
 '["Place two small pitchers on a tray, dry material in the left pitcher", "Lift the pitcher with your dominant hand, steady with the other", "Pour slowly into the second pitcher", "Set down carefully", "Pour back", "If any spills, show how to clean up with a small brush and dustpan", "Invite the child to try"]',
 '["Small tray with lip", "Two small pitchers (child-sized, with handles)", "Dry rice, lentils, or birdseed", "Small brush and dustpan for spills"]',
 'Pouring too fast, not centering over the receiving pitcher. Spills are expected and part of learning — always have the cleanup tools available.',
 'Progress to pouring water, then pouring water into multiple glasses, then pouring at snack time.',
 'Small cream pitchers or measuring cups work well. Any dry grain from your pantry.',
 'Supervise with very small grains if child still mouths objects.',
 'Parents often want to correct spills immediately. Coach them to let the child notice the spill and model cleanup calmly.'),

('Sponge Squeezing', 'practical_life', '0-3', 'introductory',
 'Child squeezes water from a sponge, transferring water between two bowls.',
 'Hand strength, squeezing control',
 'Preparation for cleaning activities, hand strength for writing, concentration',
 'Pouring dry materials',
 '["Place two bowls on a tray, water in the left bowl, sponge beside it", "Pick up the sponge with both hands", "Submerge in water, squeeze to absorb", "Lift sponge over empty bowl", "Squeeze slowly, watching water release", "Repeat until water is transferred", "Show how to wipe the tray dry when finished"]',
 '["Tray", "Two small bowls", "Natural sponge (child-sized)", "Small towel"]',
 'Squeezing over the tray instead of the bowl, not squeezing fully. Both are fine — the child is building hand strength.',
 'Add food coloring to make it visually engaging. Progress to washing a table, washing dishes, or watering plants.',
 'Any kitchen sponge cut to child size.',
 null,
 'Excellent for children who enjoy water play. This channels that interest into purposeful work.'),

('Dressing Frames — Velcro', 'practical_life', '0-3', 'introductory',
 'Child practices opening and closing velcro fasteners on a wooden dressing frame.',
 'Opening and closing velcro',
 'Independence in dressing, fine motor control, concentration, sequential thinking',
 'None — this is typically the first dressing frame',
 '["Place the frame on the table", "Open the flaps to show the velcro strips", "Starting from the top, slowly pull one side of velcro apart", "Open each strip top to bottom", "Open the flaps wide", "Close the flaps", "Press each velcro strip together, top to bottom", "Invite the child to try"]',
 '["Velcro dressing frame"]',
 'Pulling sideways instead of apart, skipping strips. Model top-to-bottom sequence consistently.',
 'Progress to snap frame, then large button frame, then zipper frame, then small button frame, then buckle frame, then bow tying.',
 'Make your own by attaching velcro strips to two pieces of fabric on a simple wooden frame or even a clipboard.',
 null,
 'The dressing frames follow a specific sequence from easiest to hardest. Velcro first, always. Parents sometimes jump to buttons — encourage patience with the sequence.'),

('Banana Slicing', 'practical_life', '0-3', 'developing',
 'Child peels and slices a banana using a child-safe knife or butter knife.',
 'Food preparation, knife skills, slicing motion',
 'Independence, concentration, practical contribution to family meals, fine motor control',
 'Pouring, basic hand coordination activities',
 '["Set up a cutting board, plate, child-safe knife, and a banana on a tray", "Show how to peel the banana from the bottom (pinch the tip)", "Peel each section slowly", "Place banana on cutting board", "Hold the knife with dominant hand, stabilize banana with other hand (fingers curled)", "Press down and forward in a sawing motion", "Place slices on plate", "Offer to share or eat"]',
 '["Small cutting board", "Child-safe knife or butter knife", "Banana", "Small plate", "Tray"]',
 'Mashing instead of slicing, uneven pieces. All normal. The process matters more than perfect slices.',
 'Progress to slicing soft fruits (strawberries, kiwi), then harder items (cucumber, cheese). Eventually full snack preparation.',
 'A butter knife works perfectly. No special tools needed.',
 'Always supervise knife use. Teach the curled-finger hand position for the stabilizing hand from the start.',
 'Food preparation is one of the most motivating practical life activities. Children who help prepare food are more likely to eat diverse foods.'),

('Table Washing', 'practical_life', '0-3', 'developing',
 'Child washes a small table following a complete sequence: prepare, wash, dry, clean up.',
 'Following a multi-step process, cleaning',
 'Concentration through a long work cycle, order, care of environment, gross motor coordination',
 'Sponge squeezing, basic pouring',
 '["Gather materials: bucket, soap, brush, sponge, towel, apron", "Put on apron", "Carry bucket to sink, fill with small amount of water", "Carry bucket to table (two hands)", "Dip brush in water, add soap", "Scrub table in circular motions, left to right, top to bottom", "Wring sponge and wipe soap away", "Dry with towel", "Empty bucket, clean and return all materials", "Remove apron"]',
 '["Small bucket", "Bar of soap or soap dish", "Scrub brush", "Sponge", "Drying towel", "Child-sized apron", "Small table or tray"]',
 'Wanting to skip steps, using too much water or soap. Gently redirect to the sequence. The process IS the work.',
 'Window washing, mirror washing, plant leaf washing, shoe polishing.',
 'Any small table, stool, or even a large tray can be the "table" to wash.',
 'Use a small amount of water to prevent floor flooding. Have a mop accessible for spills.',
 'This is a signature Montessori activity. It can occupy a child for 30-45 minutes. Parents are often amazed. Emphasize: never interrupt a child who is deeply engaged in this work.');

-- ================================================
-- PRACTICAL LIFE — Ages 3-6
-- ================================================

INSERT INTO activities (name, curriculum_area, age_plane, difficulty_level, description, direct_aim, indirect_aim, prerequisites, presentation_steps, materials_needed, common_errors, extensions, diy_alternative, safety_notes, ai_notes) VALUES

('Pouring Water into Multiple Glasses', 'practical_life', '3-6', 'introductory',
 'Child pours water from a pitcher evenly into multiple glasses, then pours all glasses back.',
 'Controlled pouring, estimating equal amounts',
 'Mathematical thinking (equal distribution), concentration, preparation for serving others',
 'Pouring dry materials, basic water pouring',
 '["Place a tray with a pitcher of colored water and 3-4 small glasses", "Pour slowly into the first glass, filling about halfway", "Move to the next glass, matching the level", "Continue until all glasses have equal amounts", "Check levels visually", "Pour each glass back into the pitcher", "Wipe any drips with a small sponge"]',
 '["Tray", "Small glass pitcher", "3-4 small glasses (clear so child can see levels)", "Small sponge", "Food coloring (optional, makes water visible)"]',
 'Overfilling first glass, pouring too fast. These self-correct through practice.',
 'Pouring for others at snack time, pouring from a thermos, serving water at family meals.',
 'Any small pitcher and glasses from your kitchen. Add a drop of food coloring so the child can see water levels clearly.',
 'Use a tray with a lip to contain spills. Glass is preferred over plastic — children handle real materials with more care.',
 'This naturally introduces concepts of equality and fairness. When a child says "that one has more," they are doing math.'),

('Flower Arranging', 'practical_life', '3-6', 'developing',
 'Child cuts, arranges, and cares for fresh flowers in a small vase.',
 'Flower cutting, arranging, care of environment',
 'Aesthetic sense, fine motor control, care of living things, sequential work',
 'Pouring water, basic scissor use',
 '["Gather materials on a tray: small vase, pitcher of water, scissors, flowers, newspaper/mat", "Spread newspaper on table", "Pour water into vase (about half)", "Pick up one flower, hold near the bottom", "Trim the stem at an angle with scissors", "Place in vase", "Repeat with remaining flowers, varying heights", "Arrange until satisfied", "Clean up: wipe water, fold newspaper, return materials", "Place vase in a chosen spot"]',
 '["Small vase", "Small pitcher", "Child-safe scissors (that actually cut)", "2-4 fresh flowers or garden cuttings", "Newspaper or small mat", "Small sponge"]',
 'Cutting stems too short, overcrowding the vase. Let the child discover what works aesthetically through experimentation.',
 'Arranging flowers for different rooms, choosing flowers from a garden, pressing flowers, drawing the arrangement.',
 'Wildflowers, herb cuttings, or even interesting leaves and branches work beautifully. The vase can be any small jar.',
 'Ensure scissors can actually cut stems — dull scissors are frustrating and dangerous. Supervise cutting.',
 'This is one of the most beautiful practical life activities. It builds aesthetic awareness and care for the environment. Children often want to make arrangements as gifts — encourage this.'),

('Sewing — Running Stitch', 'practical_life', '3-6', 'intermediate',
 'Child practices a basic running stitch on burlap or felt using a large blunt needle and yarn.',
 'Threading, sewing a running stitch in a line',
 'Fine motor control and pincer grip (direct preparation for writing), concentration, patience, bilateral coordination',
 'Lacing cards, basic threading activities',
 '["Thread a large blunt needle with yarn, knot the end", "Hold the fabric in one hand (or use an embroidery hoop)", "Push the needle down through the fabric from top", "Pull the yarn through until the knot stops it", "Push the needle up from below, a finger-width away", "Pull through", "Continue: down, up, down, up — creating a dotted line", "Show how to tie off at the end", "Invite the child"]',
 '["Burlap, felt, or loosely woven fabric (about 6x6 inches)", "Large blunt tapestry needle", "Thick yarn or embroidery thread", "Embroidery hoop (optional, helps hold fabric)", "Drawn line on fabric for guidance (optional)"]',
 'Pulling too tight (bunching fabric), inconsistent stitch length, needle going through same hole. All improve with practice.',
 'Sewing on buttons, cross-stitch, sewing a simple pouch, mending torn items.',
 'A large plastic needle and burlap from a craft store is inexpensive. Draw dots with marker to show where to stitch.',
 'Use blunt tapestry needles only. Supervise initial sessions. Store needles in a dedicated pincushion.',
 'Sewing is a powerful concentration builder and directly prepares the hand for writing. If a child resists writing but loves sewing, that is still preparation for writing.'),

('Hand Washing Sequence', 'practical_life', '3-6', 'introductory',
 'Child follows a complete hand washing sequence independently using a basin, soap, and towel.',
 'Independent hand washing with all steps',
 'Hygiene habits, sequential thinking, independence, care of self',
 'Basic pouring',
 '["Set up: basin of warm water, soap bar on dish, nail brush, hand towel, small pitcher for rinsing", "Roll up sleeves", "Wet hands in basin", "Pick up soap, rub between hands to create lather", "Replace soap on dish", "Rub palms together", "Wash backs of hands", "Wash between fingers", "Use nail brush on fingernails", "Rinse hands with pitcher water over basin", "Dry with towel, each finger individually", "Empty basin, wipe area, replace materials"]',
 '["Basin or large bowl", "Small pitcher for rinsing", "Bar soap on a dish", "Nail brush", "Hand towel", "Waterproof mat or tray", "Small apron"]',
 'Rushing through steps, playing in water instead of washing. The detailed sequence is the point — it builds order and thoroughness.',
 'Face washing, teeth brushing sequence, hair brushing routine, full self-care morning sequence.',
 'Any bowl and pitcher from your kitchen. Set up a dedicated hand washing station at child height.',
 'Check water temperature. Have a towel nearby for floor drips.',
 'This is a care of self activity that builds independence AND teaches hygiene thoroughly. The nail brush is an important detail many parents skip.');

-- ================================================
-- SENSORIAL — Ages 3-6
-- ================================================

INSERT INTO activities (name, curriculum_area, age_plane, difficulty_level, description, direct_aim, indirect_aim, prerequisites, presentation_steps, materials_needed, common_errors, extensions, diy_alternative, safety_notes, ai_notes) VALUES

('Color Tablet Matching (Box 1)', 'sensorial', '3-6', 'introductory',
 'Child matches pairs of color tablets — three pairs of primary colors (red, blue, yellow).',
 'Visual discrimination of primary colors, matching identical colors',
 'Vocabulary development (color names), visual perception, order, concentration',
 'None — this is typically the first sensorial color activity',
 '["Place the box of color tablets on a mat", "Remove all tablets randomly", "Pick up one tablet, hold by the edges (not the colored surface)", "Place it on the left side of the mat", "Look through remaining tablets for its match", "Place the match beside it", "Repeat for remaining pairs", "Name each color as you place them: This is red", "Invite the child to try"]',
 '["Color Box 1 (3 pairs: red, blue, yellow) OR DIY equivalent"]',
 'Grabbing the colored surface instead of edges, rushing through without looking carefully.',
 'Color Box 2 (11 color pairs), then Color Box 3 (grading shades from light to dark).',
 'Paint chips from a hardware store — get two identical chips each of red, blue, and yellow. Mount on cardboard squares.',
 null,
 'Always hold tablets by the white edges. This is a specific Montessori technique that isolates the visual sense and teaches care of materials.'),

('Pink Tower', 'sensorial', '3-6', 'introductory',
 'Child builds a tower of 10 pink cubes graded from largest (10cm) to smallest (1cm).',
 'Visual discrimination of size in three dimensions',
 'Mathematical concepts (decimal system — 10 units), concentration, order, coordination, preparation for geometry',
 'None — this is a foundational sensorial material',
 '["Carry each cube individually from shelf to mat (largest first)", "Spread cubes randomly on mat", "Find the largest cube, place it", "Find the next largest, center it on top", "Continue building, each cube centered on the one below", "When complete, observe the tower from different angles", "Disassemble one at a time, carrying each back to the shelf"]',
 '["Pink Tower (set of 10 graduated pink cubes) OR DIY equivalent"]',
 'Not centering cubes, skipping a size, placing out of order. If the tower falls, it provides natural feedback.',
 'Building with eyes closed, building horizontally, combining with Brown Stair, creating patterns.',
 'Make graduated cubes from wood blocks or even cardboard boxes painted pink. The graduation in size is what matters.',
 'The smallest cube is a choking hazard for toddlers. Use with 2.5+ year olds.',
 'This is one of the iconic Montessori materials. The child carrying each cube individually is part of the activity — it builds concentration and the work cycle. Parents often want to help carry. Don''t.'),

('Sound Cylinders', 'sensorial', '3-6', 'developing',
 'Child matches pairs of cylinders that make the same sound when shaken.',
 'Auditory discrimination — matching sounds',
 'Concentration, auditory perception, preparation for music and language (phonemic awareness)',
 'Color tablet matching (understanding the concept of pairing)',
 '["Place both boxes on a mat (red lid set and blue lid set)", "Pick up one red cylinder, shake it near your ear", "Listen carefully", "Pick up a blue cylinder, shake it near your ear", "Do they sound the same? No — set the blue one aside", "Try the next blue cylinder", "When you find the match, place them together", "Continue matching all pairs", "To verify: shake matched pairs to confirm they sound the same"]',
 '["Sound Cylinders (two sets of 6 cylinders with matching sounds) OR DIY equivalent"]',
 'Shaking too vigorously (all sound similar when shaken hard), not listening carefully. Model slow, gentle shaking.',
 'Grading cylinders from quietest to loudest. Blindfolded matching.',
 'Fill 12 identical small containers (film canisters, small jars) in matching pairs with: rice, beans, salt, coins, pebbles, sand. Mark the bottoms of pairs for control of error.',
 null,
 'This is an auditory isolation exercise. Do it in a quiet space. If the home is noisy, this activity won''t work well — suggest a quiet time of day.'),

('Fabric Matching', 'sensorial', '3-6', 'developing',
 'Child matches pairs of fabric swatches by touch, first with eyes open, then with eyes closed or blindfolded.',
 'Tactile discrimination — identifying textures by touch',
 'Vocabulary (rough, smooth, soft, scratchy, silky), sensory refinement, concentration',
 'Basic pairing activities',
 '["Lay out fabric swatches randomly on a mat", "Pick up one swatch, feel it with your fingertips", "Feel each remaining swatch to find the match", "Place matched pairs together", "Name the texture: This feels smooth, this feels rough", "Once mastered with eyes open, try with a blindfold"]',
 '["6-8 pairs of fabric swatches (about 4x4 inches each): silk, burlap, velvet, cotton, corduroy, denim, satin, wool"]',
 'Rushing through without really feeling, looking at fabric instead of focusing on touch.',
 'Grading fabrics from roughest to smoothest. Blindfolded matching. Fabric scavenger hunt around the house.',
 'Cut swatches from old clothes, fabric scraps, or buy a fabric sample pack from a craft store. Two identical pieces of each.',
 null,
 'The blindfold version is where real sensory refinement happens. Some children love it, others resist initially. Never force the blindfold — it can be a sleep mask and should always be the child''s choice.'),

('Binomial Cube', 'sensorial', '3-6', 'advanced',
 'Child assembles a cube composed of 8 wooden blocks that represent the binomial formula (a+b)³. At this age, it is purely a 3D puzzle.',
 'Visual discrimination of color, size, and shape in three dimensions. Assembly of a complex pattern.',
 'Indirect preparation for algebra (binomial theorem), spatial reasoning, logical thinking, concentration',
 'Pink Tower, Brown Stair, color tablets',
 '["Open the box, noting the painted pattern on the lid and two sides", "Remove the top layer carefully and place on mat", "Remove the bottom layer", "Rebuild the bottom layer using the painted side of the box as a guide", "Each face touching the side of the box must match the color painted there", "Rebuild the top layer matching the lid pattern", "Close the box", "Later: build outside the box using the lid as a reference"]',
 '["Binomial Cube"]',
 'Forcing pieces, not matching colors to the reference pattern. The painted box IS the control of error — guide the child to use it.',
 'Building outside the box with no reference. Exploring the algebraic concept (elementary age). Trinomial Cube.',
 'This material is difficult to DIY effectively. Consider purchasing or borrowing.',
 null,
 'At 3-6, this is ONLY a sensorial puzzle. Do not explain the algebra. The child is absorbing the pattern unconsciously and will connect it to mathematics years later. Parents who are math-oriented often want to explain — redirect them.');

-- ================================================
-- LANGUAGE — Ages 3-6
-- ================================================

INSERT INTO activities (name, curriculum_area, age_plane, difficulty_level, description, direct_aim, indirect_aim, prerequisites, presentation_steps, materials_needed, common_errors, extensions, diy_alternative, safety_notes, ai_notes) VALUES

('I Spy — Beginning Sounds', 'language', '3-6', 'introductory',
 'A phonemic awareness game where the adult says "I spy something that begins with /mmm/" and the child identifies the object.',
 'Identifying beginning sounds in words',
 'Phonemic awareness (foundation for reading), vocabulary building, listening skills',
 'None — this is often the first formal language activity',
 '["Place 3-4 objects on a mat (e.g., map, ball, cup, pen)", "I spy with my little eye something that begins with /mmm/ (say the SOUND, not the letter name)", "Wait for the child to look and identify: Map!", "Yes! Map begins with /mmm/", "Repeat with another sound", "Start with sounds that are very different (/m/, /s/, /b/) before similar ones"]',
 '["3-4 small objects with distinct beginning sounds", "A mat or tray"]',
 'Saying the letter NAME instead of the SOUND. Always use phonetic sounds: /mmm/ not "em", /sss/ not "ess". This is critical.',
 'More objects, similar beginning sounds, ending sounds, middle sounds, rhyming.',
 'Use any household objects. Change objects regularly to keep it fresh.',
 null,
 'THIS IS THE MOST IMPORTANT LANGUAGE NOTE: Always use letter SOUNDS, never letter NAMES. The child who learns /k/-/a/-/t/ can blend to read "cat." The child who learns "see-ay-tee" cannot. This is where many parents and even some schools go wrong.'),

('Sandpaper Letters', 'language', '3-6', 'developing',
 'Child traces sandpaper letters with their fingers while hearing the phonetic sound, learning letter shapes through touch and sound simultaneously.',
 'Learning letter shapes and their corresponding sounds through tactile and auditory channels',
 'Preparation for writing (muscle memory of letter formation), reading (sound-symbol association), concentration',
 'I Spy beginning sounds (child can identify beginning sounds)',
 '["Choose one letter the child knows the sound of from I Spy", "Place the sandpaper letter on the mat", "Trace the letter with your index and middle fingers, saying the sound: /mmm/", "Trace slowly, following the correct formation", "Say the sound each time you trace", "Trace 2-3 times", "Invite the child to trace while saying the sound", "Introduce 2-3 letters at a time using the Three Period Lesson"]',
 '["Sandpaper letters (lowercase letters on colored boards — consonants on one color, vowels on another)"]',
 'Tracing in the wrong direction, saying letter names instead of sounds. Gently guide the finger in the correct formation.',
 'Tracing in sand or salt tray, tracing on each other''s backs, forming letters with clay, progressing to the Moveable Alphabet.',
 'Cut letters from fine sandpaper and glue to cardboard squares. Use one color for consonants, another for vowels. Print a formation guide to ensure correct tracing direction.',
 null,
 'Introduce consonants and vowels on different colored backgrounds so the child unconsciously absorbs the two categories. This pays off massively when they reach the Moveable Alphabet and later grammar work.'),

('Moveable Alphabet — First Words', 'language', '3-6', 'intermediate',
 'Child builds words by selecting individual letter tiles and arranging them to spell out words phonetically.',
 'Encoding (spelling) words using known letter sounds',
 'Writing before reading (a Montessori principle), phonemic segmentation, left-to-right directionality, creative expression',
 'Sandpaper letters (knows most consonant and short vowel sounds), I Spy with all positions',
 '["Set up the Moveable Alphabet box and a mat", "Say a simple CVC word clearly: cat", "What sound do you hear first? /k/... find that letter", "Child finds c, places it on the mat", "What comes next? /aaa/... find that letter", "Child finds a, places it next to c", "What''s at the end? /t/... find that letter", "Child finds t", "Read it back together: c-a-t... cat!", "Encourage the child to build their own words"]',
 '["Moveable Alphabet (set of individual lowercase letters, multiple of each)", "Mat or rug", "Small objects or pictures for word building (optional)"]',
 'Wanting to spell correctly — at this stage, phonetic spelling is EXPECTED and correct. "sed" for "said" shows excellent phonemic awareness.',
 'Building phrases, sentences, labeling objects around the room, writing stories with the alphabet before pencil writing.',
 'Print and cut individual letters from cardstock. Make multiples of common letters (e, t, a, s, n, r). Use one color for consonants, another for vowels.',
 null,
 'CRITICAL: In Montessori, children WRITE (encode) before they READ (decode). This is counterintuitive to most parents. The Moveable Alphabet lets children write without needing pencil control. Accept ALL phonetic spellings — correcting spelling at this stage kills motivation and is developmentally inappropriate.'),

('Three Period Lesson', 'language', '3-6', 'introductory',
 'A Montessori vocabulary teaching technique used across all curriculum areas. Introduces new concepts in three stages: naming, recognition, recall.',
 'Learning new vocabulary through a structured, multi-sensory sequence',
 'Language enrichment, confidence, memory, classification skills',
 'None — this technique is used to teach vocabulary in ALL areas',
 '["Period 1 — Naming: Place 3 objects/cards. Point to each: This is a triangle. This is a square. This is a circle.", "Period 2 — Recognition: Show me the triangle. Where is the square? Point to the circle. (Mix up the order, make it playful)", "Period 2 continues until the child is confident", "Period 3 — Recall: Point to one: What is this? (Child names it)", "If the child struggles in Period 3, return to Period 2 — never correct in Period 3"]',
 '["Any 3 items you are teaching vocabulary for (objects, pictures, sandpaper letters, geography cards, etc.)"]',
 'Introducing too many items at once (stick to 3), moving to Period 3 too quickly, correcting errors in Period 3 (this damages confidence).',
 'Use with ANY new vocabulary: geometry shapes, continent names, parts of a flower, musical instruments, animal classifications.',
 'No special materials needed — this is a technique, not a material.',
 null,
 'This technique is used EVERYWHERE in Montessori. Parents should learn it well. The key insight: if a child fails Period 3, the adult made a mistake by moving too fast. Return to Period 2 without any comment about the error.');

-- ================================================
-- MATHEMATICS — Ages 3-6
-- ================================================

INSERT INTO activities (name, curriculum_area, age_plane, difficulty_level, description, direct_aim, indirect_aim, prerequisites, presentation_steps, materials_needed, common_errors, extensions, diy_alternative, safety_notes, ai_notes) VALUES

('Number Rods', 'mathematics', '3-6', 'introductory',
 'Child arranges 10 red-and-blue rods in order from 1 to 10, learning quantity through physical length.',
 'Understanding quantities 1-10 as continuous lengths, counting',
 'Number sense, one-to-one correspondence, ordering, preparation for addition',
 'Red Rods (sensorial), counting to 10 verbally',
 '["Carry rods one at a time to the mat (builds motor skills and patience)", "Arrange randomly", "Find the shortest rod: This is one", "Find the next: This is one, two (touch each section while counting)", "Continue building the stair, counting each rod''s sections", "Align left edges to create a stair pattern", "Count each rod in sequence"]',
 '["Number Rods (10 rods, alternating red and blue sections, 10cm to 100cm)"]',
 'Not touching each section while counting, counting by rote without connecting to quantity.',
 'Number cards with rods, addition with rods (combining rods to make 10), subtraction.',
 'Paint wooden dowels or even pool noodles in alternating colors, cut to graduated lengths: 10cm, 20cm, 30cm... 100cm.',
 'The longest rod is 1 meter — ensure adequate floor space.',
 'The physical weight and length of each rod gives quantity a PHYSICAL reality. The "5" rod is heavy and long. This concrete experience is what makes abstract math meaningful later.'),

('Spindle Boxes', 'mathematics', '3-6', 'developing',
 'Child places the correct number of spindles (0-9) into compartments labeled with numerals.',
 'Associating numerals with quantities, understanding zero as a quantity (empty)',
 'Counting with one-to-one correspondence, numeral recognition, introduction to zero',
 'Number Rods, numeral recognition 0-9',
 '["Point to compartment 0: This is zero. Zero means none. We put nothing here.", "Point to 1: This is one. Count one spindle and place it in", "Gather spindles for 2: Count one, two. Place them in, held together with a rubber band", "Continue through 9", "Verify: if spindles run out or are left over, something needs recounting", "The built-in control of error: exactly 45 spindles for compartments 0-9"]',
 '["Spindle box with compartments labeled 0-9", "45 spindles (wooden dowels)", "Small rubber bands (optional, for bundling)"]',
 'Skipping zero, miscounting larger quantities, not using rubber bands to group.',
 'Cards and Counters (next in sequence), odd/even exploration, addition with spindles.',
 'Use a muffin tin or egg carton labeled 0-9 with popsicle sticks, straws, or pencils as spindles.',
 null,
 'Zero is the KEY lesson here. Many children are fascinated by the concept of "nothing" being a number. This is a profound mathematical concept introduced at age 3-4 through an elegant material.'),

('Golden Bead Introduction', 'mathematics', '3-6', 'intermediate',
 'Child is introduced to the decimal system through golden bead materials: a unit bead, a ten-bar, a hundred-square, and a thousand-cube.',
 'Understanding place value: units, tens, hundreds, thousands as concrete quantities',
 'Decimal system comprehension, preparation for operations (addition, subtraction, multiplication, division)',
 'Counting to 10, Teen and Ten boards, basic numeral recognition',
 '["Present one golden bead: This is one unit", "Present a ten-bar: This is one ten. Count the beads: 1,2,3...10", "Present a hundred-square: This is one hundred. It is 10 tens (show ten-bars fitting along the edge)", "Present the thousand-cube: This is one thousand. It is 10 hundreds", "Let the child hold and feel each: the unit is tiny, the thousand is heavy", "Three Period Lesson: Show me one hundred. Where is one ten? What is this?"]',
 '["Golden bead material: unit beads, ten-bars, hundred-squares, thousand-cube", "A mat large enough to lay out materials"]',
 'Rushing to large numbers, not letting the child physically handle and feel the materials.',
 'Building numbers with golden beads and numeral cards, the Bank Game, golden bead addition, multiplication.',
 'Difficult to DIY precisely, but you can approximate: single beads, 10-bead chains made from craft beads, 10x10 bead grids. The physical weight difference between quantities is what matters.',
 'Small beads can be a choking hazard for younger siblings.',
 'The golden bead material gives children a PHYSICAL understanding of 1000 that most adults don''t have. A child who has held a thousand-cube understands place value in their body, not just their mind. This is the genius of Montessori math.');

-- ================================================
-- CULTURAL STUDIES — Ages 3-6
-- ================================================

INSERT INTO activities (name, curriculum_area, age_plane, difficulty_level, description, direct_aim, indirect_aim, prerequisites, presentation_steps, materials_needed, common_errors, extensions, diy_alternative, safety_notes, ai_notes) VALUES

('Continent Globe', 'cultural_studies', '3-6', 'introductory',
 'Child explores a globe where each continent is a different color and texture, with water represented by blue/smooth and land by sandpaper.',
 'Identifying land and water on Earth, introduction to continents',
 'Geographic awareness, sensorial exploration, vocabulary, global perspective',
 'None — this is typically the first geography material',
 '["Present the globe on a mat", "Feel the blue parts: This is water. It feels smooth.", "Feel the rough parts: This is land. It feels rough.", "Spin gently: There is more water than land on our Earth", "Point to each continent: This is Africa. This is South America...", "Use Three Period Lesson for 2-3 continents at a time", "Show where your family lives"]',
 '["Continent Globe (sandpaper/colored continents)"]',
 'Trying to teach all 7 continents at once. Start with your home continent and 1-2 others.',
 'Continent Puzzle Map, continent folders with pictures and animals, foods from different continents, music from around the world.',
 'Use a regular globe and add tactile elements: glue sandpaper or felt pieces on continents. Or use a beach ball globe.',
 null,
 'Geography in Montessori starts with the WHOLE (globe/Earth) and moves to parts (continents, then countries). This is opposite to conventional education which often starts local. The global perspective from age 3 builds a cosmically aware child.'),

('Parts of a Leaf', 'cultural_studies', '3-6', 'developing',
 'Child learns the parts of a leaf (blade, petiole, vein, margin) using a real leaf, a puzzle, and nomenclature cards.',
 'Identifying and naming parts of a leaf',
 'Botanical vocabulary, observation skills, classification, preparation for scientific thinking',
 'Three Period Lesson technique',
 '["Bring a real leaf and the leaf puzzle to the mat", "This is a leaf. Let''s look at its parts.", "Remove puzzle pieces one at a time, naming: This is the blade — it''s the wide flat part", "This is the petiole — the stem that connects to the branch", "These are the veins — they carry water, like roads for the leaf", "This is the margin — the edge of the leaf", "Reassemble the puzzle", "Match nomenclature cards to the real leaf", "Go outside and find the same parts on different leaves"]',
 '["Leaf puzzle (Montessori botany puzzle)", "Real leaves from outside", "Nomenclature cards (picture, label, definition for each part)", "Magnifying glass (optional)"]',
 'Memorizing without connecting to real leaves. Always pair the material with actual specimens from nature.',
 'Parts of a flower, parts of a tree, leaf shape classification, leaf rubbings, pressing leaves, growing plants from cuttings.',
 'Skip the puzzle — use a real leaf and label its parts with small paper arrows. Make your own nomenclature cards with photos.',
 'Check for allergies before handling plants. Wash hands after handling leaves.',
 'Botany is a gateway to outdoor observation. After this lesson, children start noticing leaf shapes everywhere. Encourage nature walks where the child identifies parts on different plants.'),

('Land and Water Forms', 'cultural_studies', '3-6', 'developing',
 'Child explores paired geographic concepts (island/lake, cape/bay, isthmus/strait) using clay models filled with water.',
 'Understanding geographic formations through tactile and visual experience',
 'Geography vocabulary, understanding paired concepts (positive/negative forms), sensorial geography',
 'Continent Globe, basic land/water concept',
 '["Present two trays with clay formed into an island shape and a lake shape", "Pour blue-tinted water into the island tray: Look — water all around, land in the middle. This is an island.", "Pour water into the lake tray: Look — land all around, water in the middle. This is a lake.", "Let the child feel and observe the relationship", "They are opposites! An island is land surrounded by water. A lake is water surrounded by land.", "Introduce one pair at a time using Three Period Lesson"]',
 '["Shallow trays (2)", "Modeling clay or plasticine", "Small pitcher of blue-tinted water", "Towel for cleanup", "Land/water form cards (pictures of real examples)"]',
 'Rushing to introduce all pairs at once. One pair at a time, thoroughly explored.',
 'Finding real examples on maps and globes, making all 6 pairs (island/lake, cape/bay, isthmus/strait, peninsula/gulf, archipelago/chain of lakes, system of lakes/group of islands), matching to photographs of real locations.',
 'Use aluminum foil trays or even muffin tin sections with playdough. Any waterproof container and moldable material works.',
 'Supervise water use. Have towels ready.',
 'The paired presentation (island/lake as opposites) is the genius of this material. Children grasp that geography has patterns and relationships. When they later see these forms on maps, they have a physical memory.');

-- ================================================
-- SOCIAL-EMOTIONAL — Ages 0-3 and 3-6
-- ================================================

INSERT INTO activities (name, curriculum_area, age_plane, difficulty_level, description, direct_aim, indirect_aim, prerequisites, presentation_steps, materials_needed, common_errors, extensions, diy_alternative, safety_notes, ai_notes) VALUES

('Grace and Courtesy — Greeting', 'social_emotional', '3-6', 'introductory',
 'Adult models and practices greeting others: making eye contact, saying good morning, shaking hands.',
 'Learning to greet others respectfully',
 'Social confidence, community building, cultural awareness, language development',
 'None',
 '["During circle time or a quiet moment with the child", "I want to show you how we greet someone", "Stand, face the child, make eye contact", "Smile and say: Good morning, [name]", "Extend your hand for a handshake", "Practice together: Now you try greeting me", "Role play: pretend to arrive at school, at a friend''s house, meeting a new person", "Practice variations: Good afternoon, Hello, Nice to meet you"]',
 '["No materials needed — this is a modeled practice"]',
 'Over-prompting in real situations ("Say hello! Shake hands!"). Model it yourself and let the child observe. Forced greetings create anxiety.',
 'Greeting in different languages, introducing yourself and a friend, welcoming a visitor to your home, phone greetings, writing greeting cards.',
 null,
 null,
 'Grace and courtesy lessons are MODELED, not forced. The biggest mistake is making a child perform. The adult demonstrates, the child absorbs, and eventually the child chooses to greet others because they''ve internalized the behavior. This can take months. Patience.'),

('Emotion Naming with Cards', 'social_emotional', '0-3', 'introductory',
 'Child looks at photograph cards of facial expressions and learns to name emotions: happy, sad, angry, surprised, scared.',
 'Identifying and naming basic emotions from facial expressions',
 'Emotional vocabulary, empathy development, self-awareness, social perception',
 'None — this can be an early activity',
 '["Sit with the child, present 3 emotion cards", "Point to happy face: This person looks happy. See the smile?", "Point to sad face: This person looks sad. See the tears?", "Use Three Period Lesson: Show me the happy person. Where is sad?", "Connect to the child''s experience: You looked happy when we went to the park today", "Over time, add more emotions: frustrated, worried, excited, calm"]',
 '["Photograph cards showing clear facial expressions (real photos, not cartoon)", "3-5 emotions to start"]',
 'Using cartoon faces instead of real photographs (harder to transfer to real life), introducing too many emotions at once.',
 'Emotion matching games, reading books and identifying characters'' emotions, drawing faces showing emotions, "How do you feel?" check-ins.',
 'Print photos of real faces showing emotions. Take photos of family members making different expressions — children love recognizing familiar faces.',
 null,
 'Use REAL photographs, not cartoons or emojis. The ability to read real human facial expressions is the skill being developed. Start with basic emotions that the child has experienced, then add more nuanced ones over time.'),

('Conflict Resolution Script', 'social_emotional', '3-6', 'developing',
 'Children learn a structured approach to resolving disagreements: I feel ___ when you ___ because ___. I would like ___.',
 'Learning to express feelings and needs during conflicts using words instead of actions',
 'Emotional regulation, empathy, language skills, peaceful community living',
 'Emotion naming, basic conversational skills',
 '["During a calm moment (NOT during a conflict), introduce the concept", "Sometimes when two people want the same thing, we can use our words to solve it", "Model with puppets or dolls: Puppet A takes a toy from Puppet B", "Puppet B says: I feel sad when you take my toy because I was using it. I would like to have a turn.", "Puppet A says: I hear that you feel sad. I will wait for my turn.", "Practice the script with the child using pretend scenarios", "When real conflicts arise, coach through the script gently"]',
 '["Optional: two puppets or dolls for role-playing", "Peace Rose or talking stick (object held by the speaker)", "Feelings poster for reference"]',
 'Expecting children to use the script perfectly during heightened emotions. During real conflicts, the adult coaches. The script becomes internalized over many months.',
 'Peace table setup, classroom peace rose ceremony, community meetings, writing apology letters.',
 'Any small object can be the "talking stick" — whoever holds it speaks, the other listens.',
 null,
 'This takes TIME to internalize. Parents should not expect a 4-year-old to use "I feel" statements independently after one lesson. The adult models this language for months before the child begins using it naturally. Coach during conflicts but never force the script.');

-- ================================================
-- EXECUTIVE FUNCTION
-- ================================================

INSERT INTO activities (name, curriculum_area, age_plane, difficulty_level, description, direct_aim, indirect_aim, prerequisites, presentation_steps, materials_needed, common_errors, extensions, diy_alternative, safety_notes, ai_notes) VALUES

('Waiting Game', 'executive_function', '3-6', 'introductory',
 'Child practices waiting for a short period before receiving something desired — building impulse control through a structured, respectful approach.',
 'Impulse control, delayed gratification',
 'Self-regulation, patience, trust in the environment, inner discipline',
 'None',
 '["This is not a punishment exercise — it is a playful practice", "During snack: I am going to put the crackers here. Let''s wait until the timer finishes, then we eat together.", "Use a sand timer (1-2 minutes to start)", "Sit together and watch the sand fall", "When the timer finishes: Now we can eat!", "Gradually increase wait time", "Always follow through — the reward must come"]',
 '["Sand timer (1 minute, then 2 minutes, then 5)", "A small desired item (snack, favorite activity)"]',
 'Making the child wait too long initially (start with 30 seconds), not following through with the reward, using this as punishment.',
 'Waiting for a turn in conversation, waiting for an activity to be available, planning a project across multiple days.',
 'A sand timer is ideal because it''s visual. A kitchen timer works too.',
 null,
 'This is about building the SKILL of waiting, not about making children comply. It must feel safe and predictable. The child learns: I can wait, and good things come when I do. If a parent uses "waiting" as punishment, it destroys the skill-building purpose.'),

('Sequencing Cards', 'executive_function', '3-6', 'developing',
 'Child arranges picture cards showing a process in the correct sequential order (e.g., seed → sprout → plant → flower).',
 'Understanding sequential order, planning',
 'Logical thinking, narrative skills, prediction, working memory',
 'Basic sorting activities',
 '["Present 3-4 cards face up, out of order", "What do you think happens first?", "Let the child arrange the sequence", "Read the sequence together: First the seed goes in the ground, then it sprouts, then it grows into a plant, then the flower blooms", "Mix up and try again", "Introduce new sequences: getting dressed, making a sandwich, life cycle of a butterfly"]',
 '["Sequencing card sets (3-4 cards per sequence)", "A mat or table space"]',
 'Adult giving away the answer too quickly. Let the child reason through the order even if they get it wrong initially.',
 'Longer sequences (6-8 cards), creating their own sequence cards by drawing or photographing, writing stories based on sequences.',
 'Take photos of your child doing a familiar activity step by step (brushing teeth, making a snack). Print and cut into individual cards. These personalized sequences are very engaging.',
 null,
 'Start with familiar daily routines the child knows (getting dressed, handwashing) before abstract sequences (plant growth, butterfly life cycle). Personal sequences build confidence before unfamiliar ones challenge thinking.'),

('Plan-Do-Review', 'executive_function', '3-6', 'intermediate',
 'Child plans what they will work on, executes their plan, then reflects on what happened — building metacognition and self-direction.',
 'Self-directed planning, execution, and reflection',
 'Metacognition, self-awareness, goal-setting, executive function development, independence',
 'Some experience with choosing work independently',
 '["At the start of a work period, ask: What would you like to work on today?", "Help the child choose 2-3 activities", "Optional: child draws or marks their plan on a simple planning board", "Child works through their chosen activities", "At the end, review together: What did you work on? What did you enjoy? What was hard?", "Did you finish your plan? That''s okay either way — tomorrow you can continue", "Over time, the child begins planning and reviewing independently"]',
 '["Simple planning board (whiteboard, paper with sections, or picture checklist)", "Activity cards or pictures the child can select from", "Optional: small mirror for reflection time"]',
 'Making the plan rigid — if the child changes direction during work, that is following their interest, which is valued. The plan is a starting point, not a contract.',
 'Written plans, multi-day project planning, setting weekly goals, sharing plan with a sibling or parent.',
 'A piece of paper divided into three sections: PLAN (draw what you''ll do), DO (leave blank during work), REVIEW (draw what happened).',
 null,
 'This is one of the most powerful executive function builders available. Homeschooling parents especially benefit from this structure. It gives the child ownership while maintaining gentle structure. The REVIEW phase is where metacognition develops — do not skip it.');

-- ================================================
-- ELEMENTARY — Ages 6-9
-- ================================================

INSERT INTO activities (name, curriculum_area, age_plane, difficulty_level, description, direct_aim, indirect_aim, prerequisites, presentation_steps, materials_needed, common_errors, extensions, diy_alternative, safety_notes, ai_notes) VALUES

('Timeline of Life', 'cultural_studies', '6-9', 'developing',
 'Child explores a long illustrated timeline showing the development of life on Earth, from single-celled organisms to modern humans.',
 'Understanding the history of life on Earth, major evolutionary milestones',
 'Cosmic perspective, sense of wonder, scientific thinking, understanding deep time, reading skills',
 'Great Lessons: The Coming of Life (second great lesson)',
 '["Unroll the Timeline of Life on a long surface (floor or hallway)", "Begin at the start: Here is where life first appeared — tiny organisms in the ocean", "Walk along the timeline together, noting major developments", "Let the child discover: Look how long it took before any animals lived on land!", "Point out the scale: Dinosaurs are here, and humans are just at the very end", "Let the child spend time with sections that interest them", "Follow up with research on any period that captures their imagination"]',
 '["Timeline of Life (long illustrated scroll)", "Books about prehistoric life", "Research materials"]',
 'Trying to teach every period in one sitting. Let the child''s interest guide which periods to explore deeply.',
 'Research projects on specific periods, making their own timeline, fossil exploration, comparing extinction events, writing stories set in different periods.',
 'Print a free Timeline of Life (several Montessori resources offer downloadable versions). Even a hand-drawn simplified version on a long paper roll works.',
 null,
 'This is part of Montessori''s Cosmic Education. The purpose is not to memorize dates but to give the child a sense of wonder at the story of life and their place in it. When a child says "I can''t believe humans have only been here for this tiny bit!" — that is the lesson landing.'),

('Stamp Game — Addition', 'mathematics', '6-9', 'developing',
 'Child performs multi-digit addition using small tiles "stamped" with 1, 10, 100, or 1000, representing the decimal categories.',
 'Multi-digit addition with exchanging (carrying)',
 'Abstract mathematical thinking, understanding place value operations, preparation for pencil-and-paper algorithms',
 'Golden Bead addition, numeral recognition to 9999',
 '["Write an addition problem on paper: e.g., 3,425 + 2,387", "Using the stamp tiles, lay out the first number: 3 thousands, 4 hundreds, 2 tens, 5 units", "Below it, lay out the second number: 2 thousands, 3 hundreds, 8 tens, 7 units", "Start with units: Count all unit stamps together: 5+7=12", "Exchange: 10 unit stamps become 1 ten stamp, 2 units remain", "Continue with tens: 2+8+1(exchanged)=11 tens. Exchange 10 tens for 1 hundred", "Continue with hundreds and thousands", "Write the answer: 5,812"]',
 '["Stamp Game set (tiles stamped with 1, 10, 100, 1000 in different colors)", "Pencil and paper for recording", "Small cups for sorting stamps (optional)"]',
 'Forgetting to include the exchanged stamp in the next category, losing track during exchange.',
 'Subtraction with stamp game, multiplication with stamp game, division with stamp game, transitioning to pencil algorithms.',
 'Make stamp tiles from cardboard: cut small squares, write the values, color-code by place value (green=units, blue=tens, red=hundreds, green=thousands — following Montessori color convention).',
 null,
 'The Stamp Game is the critical bridge between concrete golden beads and abstract pencil math. The stamps are more abstract than beads (a small "1000" tile vs. a heavy cube) but still manipulable. Children who skip this step often struggle with algorithms because they don''t understand what "carrying" actually means.'),

('Research Project — Animal Classification', 'cultural_studies', '6-9', 'intermediate',
 'Child selects an animal group (mammals, reptiles, birds, amphibians, fish, insects) and creates a research booklet with illustrations.',
 'Research skills, classification understanding, information synthesis',
 'Writing practice, scientific thinking, organization, artistic expression, independence in learning',
 'Basic writing skills, animal kingdom introduction, familiarity with library/reference materials',
 '["Present the five vertebrate groups and invertebrates", "Invite the child to choose one group that interests them", "Guide them to research sources: books, approved websites, encyclopedias", "Help them create an outline: What defines this group? What are examples? Where do they live? What do they eat?", "Child creates a research booklet: cover page, written sections, illustrations or diagrams", "Child presents their findings to family or a peer"]',
 '["Reference books or approved research sources", "Booklet paper (folded and stapled)", "Colored pencils for illustrations", "Animal classification chart for reference"]',
 'Adult doing the research for the child, choosing the topic for the child, correcting writing during the creative phase (edit later).',
 'Comparative studies (how is a reptile different from an amphibian?), food chain projects, habitat dioramas, endangered species awareness projects.',
 'Fold printer paper into a booklet. Use library books and age-appropriate websites for research.',
 null,
 'Elementary Montessori is driven by the child''s INTERESTS within a framework. The adult presents the big picture (animal classification) and the child chooses where to dive deep. This is "following the child" at the elementary level. The final presentation builds communication skills and pride in their work.');

-- ================================================
-- ADOLESCENT — Ages 12+
-- ================================================

INSERT INTO activities (name, curriculum_area, age_plane, difficulty_level, description, direct_aim, indirect_aim, prerequisites, presentation_steps, materials_needed, common_errors, extensions, diy_alternative, safety_notes, ai_notes) VALUES

('Micro-Economy Project', 'practical_life', '12+', 'advanced',
 'Adolescent plans, creates, and sells a product or service, managing a small business from idea to execution.',
 'Understanding economics through direct experience: production, pricing, marketing, accounting, customer service',
 'Mathematical application (budgeting, profit/loss), writing (business plan, marketing), social skills (selling, negotiating), independence, self-confidence, contribution to community',
 'Basic math operations, writing skills, some social confidence',
 '["Discuss the concept: You are going to create a real small business", "Brainstorm products/services: baked goods, plant starts, tutoring, handmade items, lawn care", "Write a simple business plan: What will you sell? Who will buy it? What will it cost to make? What will you charge?", "Calculate startup costs and set a budget", "Create the product or prepare the service", "Market it: flyers, word of mouth, social media with parent approval", "Execute sales", "Track income and expenses", "Reflect: What worked? What would you change? What did you learn?"]',
 '["Notebook for business planning", "Calculator or spreadsheet", "Materials specific to their chosen product/service", "Cash box or payment method", "Marketing materials"]',
 'Adult taking over planning or execution, choosing the product for the adolescent, bailing them out of financial mistakes (learning from failure is the point).',
 'Scaling the business, partnering with another adolescent, donating a portion to charity, presenting results to a group, mentoring a younger child in a simple version.',
 'No special materials needed beyond what the chosen product/service requires.',
 'Ensure appropriate adult oversight for any sales involving food safety, interaction with strangers, or online presence.',
 'This is Montessori Erdkinder (adolescent program) in action. Maria Montessori believed adolescents need to feel economically useful. Even a small project that earns $20 gives an adolescent a sense of genuine contribution and capability that no classroom exercise can replicate.');

-- ================================================
-- FINE MOTOR — Ages 0-3
-- ================================================

INSERT INTO activities (name, curriculum_area, age_plane, difficulty_level, description, direct_aim, indirect_aim, prerequisites, presentation_steps, materials_needed, common_errors, extensions, diy_alternative, safety_notes, ai_notes) VALUES

('Threading Large Beads', 'fine_motor', '0-3', 'introductory',
 'Child threads large wooden beads onto a thick lace or string with a stiff end.',
 'Hand-eye coordination, bilateral coordination (one hand holds the string, the other holds the bead)',
 'Pincer grip strengthening, concentration, patience, preparation for sewing and writing',
 'None — this is an early fine motor activity',
 '["Present the tray with beads and lace", "Pick up the lace with your dominant hand", "Pick up a bead with the other hand", "Guide the stiff end of the lace through the bead hole, slowly", "Pull through", "Repeat with the next bead", "When finished, hold up the string of beads", "To reset, slide beads off one at a time"]',
 '["Large wooden beads with big holes (at least 2cm)", "Thick lace or cord with a stiff end (tape a tip or use a shoelace)", "Small tray or basket"]',
 'Beads too small, lace too floppy. Start with the largest beads and stiffest lace possible, then reduce size over time.',
 'Smaller beads, pattern making (red-blue-red-blue), threading onto a vertical dowel, lacing cards.',
 'Rigatoni pasta works as beginner beads — the holes are large. Use a shoelace as the string.',
 'Beads under 3cm can be choking hazards. Supervise and use appropriately sized beads for the child''s age.',
 'This is a precursor to sewing, which is a precursor to writing. The hand is being prepared indirectly. Parents who want their child to "write" should invest in activities like this first.'),

('Playdough Rolling and Cutting', 'fine_motor', '0-3', 'introductory',
 'Child rolls playdough into balls and snakes, then cuts with a child-safe cutter or butter knife.',
 'Hand strength, rolling motions, cutting coordination',
 'Fine motor development, bilateral coordination, creative expression, preparation for food preparation',
 'None',
 '["Place playdough and tools on a mat or tray", "Take a piece of dough and roll it between your palms to make a ball", "Place the ball on the mat and press flat", "Take another piece and roll a snake: roll back and forth on the mat with flat hands", "Use the knife to cut the snake into pieces", "Invite the child to try each motion"]',
 '["Playdough (homemade or purchased)", "Small rolling pin (optional)", "Butter knife or playdough cutter", "Mat or tray", "Cookie cutters (optional)"]',
 'Adult making things FOR the child instead of letting the child explore. The process is the activity, not the product.',
 'Making specific shapes, cutting with scissors (in dough first), stamping with objects, making letters in dough.',
 'Homemade playdough: 1 cup flour, 1/2 cup salt, 1 tbsp oil, 1/2 cup warm water, food coloring. Lasts weeks in an airtight container.',
 'Ensure playdough is non-toxic. Supervise children who still mouth objects.',
 'Playdough is excellent for hand strength needed for writing. Children who struggle with pencil grip often benefit from more playdough time, not more pencil practice.');

-- ================================================
-- GROSS MOTOR — Ages 0-3
-- ================================================

INSERT INTO activities (name, curriculum_area, age_plane, difficulty_level, description, direct_aim, indirect_aim, prerequisites, presentation_steps, materials_needed, common_errors, extensions, diy_alternative, safety_notes, ai_notes) VALUES

('Walking on the Line', 'gross_motor', '3-6', 'introductory',
 'Child walks carefully along a line (ellipse) taped on the floor, placing one foot directly in front of the other.',
 'Balance, controlled movement, body awareness',
 'Concentration, self-regulation, grace of movement, preparation for carrying materials carefully',
 'Independent walking (stable)',
 '["Create an ellipse on the floor with tape (about 3 meters long)", "Stand at a point on the line", "Place one foot directly on the line, heel touching the toe of the other foot", "Walk slowly, arms at sides or extended for balance", "Eyes on the line ahead", "Walk the full ellipse", "Invite the child to try", "Play calm music during walking on the line"]',
 '["Masking tape or painter''s tape in an ellipse shape on the floor", "Optional: calm music", "Optional: a bell or flag to carry while walking"]',
 'Walking too fast, stepping off the line. These are self-correcting — the child can see when they step off. Never scold for stepping off.',
 'Carry a bell without ringing it, carry a glass of water without spilling, carry a flag, walk backwards on the line, walk with a book on head.',
 'Painter''s tape on any floor surface. The ellipse should be large enough for smooth walking, not sharp turns.',
 'Ensure the walking area is clear of obstacles.',
 'This looks simple but is deeply calming and centering. It is used in Montessori classrooms as a transition activity and for self-regulation. Children who are dysregulated often benefit from 5 minutes of walking on the line. Parents can use this at home when energy is high and focus is low.');
