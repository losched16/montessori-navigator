// ================================================
// PROGRAMMATIC SEO CONTENT DATABASE
// All structured content for auto-generated pages
// ================================================

// ── ACTIVITY PAGES: "Montessori activities for [age]" ──

export interface ActivityPageData {
  slug: string
  age: string
  ageLabel: string
  metaTitle: string
  metaDescription: string
  heroTitle: string
  intro: string
  agePlane: string
  agePlaneDescription: string
  sensitivePeriods: string[]
  categories: Array<{
    area: string
    areaLabel: string
    description: string
    activities: Array<{
      name: string
      description: string
      materials: string[]
      presentation: string[]
      whyItMatters: string
      diyTip?: string
    }>
  }>
  environmentTips: string[]
  commonMistakes: string[]
  relatedAges: string[]
}

export const ACTIVITY_PAGES: ActivityPageData[] = [
  {
    slug: '6-months',
    age: '6 months',
    ageLabel: '6-Month-Olds',
    metaTitle: 'Montessori Activities for 6 Month Olds — Developmental Guide',
    metaDescription: 'Age-appropriate Montessori activities for your 6 month old. Sensory exploration, movement support, and language development grounded in Montessori pedagogy.',
    heroTitle: 'Montessori Activities for 6-Month-Olds',
    intro: 'At six months, your baby is in the midst of the unconscious absorbent mind — taking in everything from their environment without effort. They are developing hand-eye coordination, beginning to sit, and showing intense interest in faces, voices, and objects they can grasp. The goal is not to "teach" but to prepare a rich environment that invites exploration.',
    agePlane: '0-3',
    agePlaneDescription: 'Your baby is in the First Plane of Development (0-6), specifically the unconscious absorbent mind phase. They absorb language, movement patterns, and sensory information from their environment without conscious effort.',
    sensitivePeriods: ['Movement (gross and fine motor)', 'Language (listening and early babbling)', 'Sensory exploration'],
    categories: [
      {
        area: 'sensorial', areaLabel: 'Sensory Exploration',
        description: 'At this age, every experience is sensory. Your baby is building neural pathways through touch, sight, sound, taste, and smell.',
        activities: [
          { name: 'Treasure Basket', description: 'A low basket filled with 8-10 natural, real-world objects of different textures, weights, and temperatures for the baby to explore freely.', materials: ['Low basket', 'Natural objects: wooden spoon, metal whisk, silk scarf, pine cone, smooth stone, leather wallet, rubber ball, wooden ring'], presentation: ['Place basket within baby\'s reach while they are seated or on tummy', 'Let them choose what to explore', 'Do not direct or hand them objects', 'Replace items weekly to maintain interest'], whyItMatters: 'The treasure basket gives your baby agency — they choose what to explore. This is the earliest form of the Montessori principle of free choice within a prepared environment.', diyTip: 'Walk through your kitchen and gather objects with different properties. Avoid plastic — babies need real textures, weights, and temperatures.' },
          { name: 'High-Contrast Cards', description: 'Simple black-and-white geometric patterns or real images placed at the baby\'s eye level.', materials: ['High contrast cards or printed images', 'A way to display them at baby\'s level'], presentation: ['Place cards 8-12 inches from baby\'s face', 'Change cards every few days', 'Observe which patterns hold attention longest'], whyItMatters: 'At 6 months, visual acuity is developing rapidly. High-contrast images support visual discrimination — the same skill that will later help them distinguish between letters.', diyTip: 'Print simple geometric shapes in black on white paper. Tape them to the wall at floor level.' },
        ]
      },
      {
        area: 'gross_motor', areaLabel: 'Movement',
        description: 'Your baby is working toward sitting independently and may be rolling, pivoting, or starting to creep. Every movement builds strength and coordination.',
        activities: [
          { name: 'Floor Time on Movement Mat', description: 'Uninterrupted time on a firm surface with a few objects placed just out of reach to encourage reaching, rolling, and pivoting.', materials: ['Firm mat or blanket on floor', '2-3 interesting objects'], presentation: ['Place baby on their back or tummy on the mat', 'Position 1-2 objects slightly beyond easy reach', 'Sit nearby but do not help them reach the objects', 'Let them work at it — the effort IS the development'], whyItMatters: 'Every time a baby stretches, rolls, or pivots to reach something, they are building core strength, spatial awareness, and determination. The struggle is productive.', diyTip: 'A folded blanket on a clean floor works perfectly. No special equipment needed.' },
          { name: 'Pull-to-Sit Practice', description: 'Offering your fingers for the baby to grasp and pull themselves toward sitting, building core strength.', materials: ['Just your hands'], presentation: ['While baby is on their back, offer your index fingers', 'Let THEM grip and pull — do not pull them up', 'They control the pace and effort', 'Celebrate the effort, not the result'], whyItMatters: 'This respects the baby\'s initiative. They are strengthening their core while experiencing agency — they decide when and how hard to pull.' },
        ]
      },
      {
        area: 'language', areaLabel: 'Language',
        description: 'Your baby is absorbing the sounds, rhythms, and patterns of your language. They understand far more than they can produce.',
        activities: [
          { name: 'Narrating Daily Life', description: 'Describing what you are doing as you do it, using precise vocabulary and a natural conversational tone.', materials: ['No materials needed'], presentation: ['As you prepare food: "I\'m slicing the banana. The knife is sharp. The banana is soft and yellow."', 'As you dress them: "Now I\'m putting your left arm through the sleeve. This is your blue shirt."', 'Use real words — not baby talk. "Dog" not "doggy." "Water" not "wa-wa."'], whyItMatters: 'The language a baby hears in the first year builds the foundation for everything that follows. Children who hear rich, precise vocabulary in context develop larger vocabularies and stronger reading skills years later.', diyTip: 'It can feel strange to narrate to someone who can\'t respond. Do it anyway. They are absorbing every word.' },
        ]
      }
    ],
    environmentTips: [
      'A floor bed or low mattress allows free movement',
      'A mirror mounted horizontally at floor level supports self-awareness',
      'A low shelf with 3-4 objects rotated weekly prevents overwhelm',
      'Natural light and uncluttered space support concentration',
    ],
    commonMistakes: [
      'Too many toys out at once — less is more at every age',
      'Containers that restrict movement (bouncers, walkers, jumpers) — these delay motor development',
      'Background TV or music — silence allows the baby to focus on real sounds',
      'Rushing to help — give them time to struggle productively',
    ],
    relatedAges: ['3-months', '9-months', '12-months'],
  },
  {
    slug: '1-year',
    age: '1 year',
    ageLabel: '1-Year-Olds',
    metaTitle: 'Montessori Activities for 1 Year Olds — Practical Guide',
    metaDescription: 'Practical Montessori activities for your 1 year old. Independence, movement, language explosion, and sensory exploration activities grounded in Montessori principles.',
    heroTitle: 'Montessori Activities for 1-Year-Olds',
    intro: 'At twelve months, your child is on the verge of — or has just achieved — independent walking. This changes everything. They can now go where they want, reach what they want, and explore with both hands free. The sensitive period for order is intensifying, language is exploding, and they are desperate to do things independently. This is the age where practical life truly begins.',
    agePlane: '0-3',
    agePlaneDescription: 'Still in the unconscious absorbent mind, but transitioning toward conscious choice. Your child is beginning to show will and preference.',
    sensitivePeriods: ['Order (intensifying)', 'Language (vocabulary explosion)', 'Movement (walking, climbing)', 'Small objects'],
    categories: [
      {
        area: 'practical_life', areaLabel: 'Practical Life',
        description: 'At one, your child wants to participate in real life. Every household task is a learning opportunity.',
        activities: [
          { name: 'Transferring with Hands', description: 'Moving objects from one bowl to another using hands only. This is the first practical life activity in the Montessori sequence.', materials: ['Two small bowls', 'Large objects: wooden eggs, walnuts, or large pom-poms'], presentation: ['Place two bowls side by side on a tray', 'Slowly pick up one object at a time from the left bowl', 'Place it carefully in the right bowl', 'When finished, pause — then transfer back', 'Place the tray on a low shelf for the child to access independently'], whyItMatters: 'This builds concentration, hand-eye coordination, and the work cycle (choose → work → complete → return). It looks simple to adults, but for a one-year-old, it is profound, purposeful work.' },
          { name: 'Drinking from an Open Cup', description: 'Offering a small glass or cup (not a sippy cup) with a tiny amount of water at meals.', materials: ['Small glass or cup (shot glass size)', 'Towel for spills', 'Small pitcher if ready'], presentation: ['Fill cup with only 1-2 tablespoons of water', 'Demonstrate bringing the cup to your mouth slowly', 'Offer the cup', 'When they spill — and they will — hand them the towel to wipe', 'Refill. Repeat.'], whyItMatters: 'Sippy cups teach sucking. Open cups teach sipping, which develops different oral muscles and teaches cause-and-effect. More importantly, using a real cup says: "I trust you with real things."', diyTip: 'A small shot glass works perfectly as a first cup. The small size limits spill volume.' },
        ]
      },
      {
        area: 'language', areaLabel: 'Language',
        description: 'Between 12-18 months, most children experience a vocabulary explosion. They may go from 2 words to 50 in a matter of weeks.',
        activities: [
          { name: 'Object Naming Basket', description: 'A basket of real objects from a category (fruit, animals, vehicles) that you name precisely using the Three Period Lesson.', materials: ['Basket', '4-6 real objects or realistic miniatures from one category'], presentation: ['Sit with child. Take out one object at a time.', 'Period 1 (naming): "This is a horse." Hold it, let them hold it.', 'Period 2 (recognition): "Can you show me the horse?" (with 2-3 objects out)', 'Period 3 (recall): "What is this?" (only when they are clearly ready)', 'If they get Period 2 wrong, just name it again cheerfully. Never correct.'], whyItMatters: 'The Three Period Lesson is used EVERYWHERE in Montessori. Mastering it as a parent gives you a tool that works for teaching anything — colors, letters, geography, botany. The child learns precise vocabulary while handling real objects.' },
        ]
      },
      {
        area: 'sensorial', areaLabel: 'Sensory & Motor',
        description: 'Your one-year-old is refining grasp patterns and is fascinated by how things work.',
        activities: [
          { name: 'Ball Drop Box', description: 'A box with a hole on top and a tray that catches the ball. The child drops the ball in, watches it disappear, then finds it in the tray.', materials: ['Object permanence box or DIY version', 'Ball that fits through the hole'], presentation: ['Place box in front of child', 'Slowly demonstrate: pick up ball, drop through hole', 'Show them checking the tray', 'Let them try', 'They may repeat this 20+ times — that repetition is the work'], whyItMatters: 'This builds object permanence (things exist even when I can\'t see them), cause-and-effect understanding, and fine motor control. The repetition is not boredom — it is the child cementing a concept.', diyTip: 'Cut a hole in a shoebox lid. Use a tennis ball. Tape the lid on. Works perfectly.' },
        ]
      }
    ],
    environmentTips: [
      'Low hooks for their coat and bag by the front door',
      'A step stool in the bathroom for handwashing',
      'A low shelf in the kitchen with their cup, plate, and snack',
      'Shoes stored at their level so they can choose and attempt to put on',
    ],
    commonMistakes: [
      'Saying "no" constantly — instead, prepare the environment so you don\'t need to',
      'Carrying them when they can walk — walk WITH them even when it\'s slow',
      'Completing tasks for them — let them struggle with the zipper, the cup, the spoon',
      'Overstimulating the environment — 3-4 activities on a shelf is enough',
    ],
    relatedAges: ['6-months', '18-months', '2-years'],
  },
  {
    slug: '2-years',
    age: '2 years',
    ageLabel: '2-Year-Olds',
    metaTitle: 'Montessori Activities for 2 Year Olds — Home Guide',
    metaDescription: 'Montessori activities for 2 year olds at home. Practical life, sensory work, language enrichment, and independence-building activities with step-by-step guidance.',
    heroTitle: 'Montessori Activities for 2-Year-Olds',
    intro: 'Two is not "terrible" — it is extraordinary. Your child is at the peak of the sensitive period for order, their language is becoming conversational, and they are fiercely driven toward independence. The "No!" you hear is not defiance — it is the birth of will. Your job is to channel this incredible energy into purposeful work.',
    agePlane: '0-3',
    agePlaneDescription: 'Transitioning from unconscious to conscious absorbent mind. Your child is developing will, making choices, and beginning to concentrate intentionally.',
    sensitivePeriods: ['Order (PEAK)', 'Language (sentences emerging)', 'Movement (refining)', 'Small objects', 'Social behavior (beginning)'],
    categories: [
      {
        area: 'practical_life', areaLabel: 'Practical Life',
        description: 'Practical life IS the curriculum at age two. Everything else builds on it.',
        activities: [
          { name: 'Pouring Dry Materials', description: 'Pouring rice, lentils, or beans from one small pitcher to another. The precursor to water pouring.', materials: ['Two small pitchers or cups', 'Tray to contain spills', 'Dry rice or lentils', 'Small broom and dustpan nearby'], presentation: ['Place tray with both pitchers at child\'s table', 'Pick up the full pitcher with dominant hand', 'Other hand steadies the empty pitcher', 'Pour slowly, watching the stream', 'Set down. Pause. Pour back.', 'If spilled: pick up broom, sweep into dustpan (this is part of the activity, not a mistake)'], whyItMatters: 'Pouring builds concentration, bilateral coordination, and the foundation for every science experiment, cooking activity, and math measurement they will ever do. The sequence matters: dry before water, two vessels before multiple.' },
          { name: 'Sponge Squeezing', description: 'Transferring water from one bowl to another using a sponge. Builds hand strength needed for writing.', materials: ['Two bowls', 'Small sponge', 'Tray', 'Towel'], presentation: ['Place both bowls on tray, one with small amount of water', 'Dip sponge in water bowl', 'Squeeze into empty bowl', 'Let child repeat', 'When water transfers, they can squeeze it back'], whyItMatters: 'The squeezing motion builds the exact hand muscles needed for pencil grip years later. Children who skip practical life work often struggle with handwriting — not because they lack letter knowledge, but because their hands aren\'t strong enough.' },
          { name: 'Helping Prepare Food', description: 'Real food preparation tasks: washing vegetables, tearing lettuce, spreading butter, mashing banana.', materials: ['Child-sized cutting board', 'Butter knife or child-safe knife', 'Bowl', 'Real food'], presentation: ['Set up the workspace first — everything ready', '"Today we\'re making a snack. First we wash the apple."', 'Demonstrate each step slowly, then let them do it', 'Accept imperfection — a lumpy banana spread is a triumph'], whyItMatters: 'Cooking involves sequencing, fine motor control, math (measuring), science (transformations), and results the child can eat. It is the ultimate practical life activity.' },
        ]
      },
      {
        area: 'language', areaLabel: 'Language',
        description: 'Your two-year-old may have 50-200 words and is beginning to combine them into phrases and short sentences.',
        activities: [
          { name: 'Classified Card Matching', description: 'Matching real objects to photographs of those objects, then naming them.', materials: ['3-5 real objects from a category', 'Photographs of those same objects'], presentation: ['Lay out photographs in a row', 'Name each object as you place the real item on its photo', '"This is a horse. This is a cow. This is a pig."', 'Mix up objects, let child match them back', 'Later: use cards only, without objects'], whyItMatters: 'This bridges the concrete (real object) to the abstract (2D representation) — the same cognitive leap that will later allow them to understand that a written word represents a spoken word represents an idea.' },
          { name: 'Singing and Rhyming', description: 'Singing songs with repetitive structures, fingerplays, and rhyming games throughout the day.', materials: ['No materials needed'], presentation: ['Sing the same songs consistently — repetition is the point', 'Use fingerplays (Itsy Bitsy Spider, Open Shut Them)', 'Pause before a familiar word and let them fill it in', '"Twinkle twinkle little ___"'], whyItMatters: 'Rhyming develops phonemic awareness — the ability to hear individual sounds in words. This is the single strongest predictor of later reading success. Children who can rhyme at 3 are dramatically more likely to read fluently at 6.' },
        ]
      }
    ],
    environmentTips: [
      'A defined workspace: small table and chair at the right height',
      'A shelf with 6-8 activities, changed weekly based on interest',
      'A dressing area with mirror, hooks, and accessible clothing',
      'Everything labeled (even before they can read — they absorb the print)',
    ],
    commonMistakes: [
      'Fighting the need for order — if they insist on a routine, honor it',
      'Treating "No" as disrespect — it is the healthy emergence of will',
      'Too many choices — 2 options is enough ("red shirt or blue shirt?")',
      'Skipping practical life because it\'s "messy" — the mess is the learning',
    ],
    relatedAges: ['18-months', '3-years', '4-years'],
  },
  {
    slug: '3-years',
    age: '3 years',
    ageLabel: '3-Year-Olds',
    metaTitle: 'Montessori Activities for 3 Year Olds — Complete Guide',
    metaDescription: 'Complete Montessori activity guide for 3 year olds. Practical life, sensorial, early language, and math readiness activities with presentation steps and materials lists.',
    heroTitle: 'Montessori Activities for 3-Year-Olds',
    intro: 'Three is the golden age of Montessori. Your child has entered the conscious absorbent mind — they now choose their work with intention, concentrate with surprising depth, and are driven by every sensitive period at once. This is when the full Montessori curriculum opens up: practical life deepens, sensorial work begins in earnest, language moves toward writing and reading, and mathematical concepts start to take root.',
    agePlane: '3-6',
    agePlaneDescription: 'The conscious absorbent mind. Your child is now intentional in their learning. They choose work, concentrate deeply, and can sustain focus for surprising periods when the work matches their developmental need.',
    sensitivePeriods: ['Language (letter sounds, early writing)', 'Refinement of senses (PEAK)', 'Order (still present)', 'Social behavior (grace and courtesy)', 'Movement (fine motor refinement)'],
    categories: [
      {
        area: 'practical_life', areaLabel: 'Practical Life',
        description: 'At three, practical life becomes more complex and sequential. Multi-step activities build executive function.',
        activities: [
          { name: 'Water Pouring (Multiple Glasses)', description: 'Pouring water from a pitcher into 2-3 small glasses evenly. Builds control, estimation, and care.', materials: ['Small pitcher', '2-3 small glasses', 'Tray', 'Sponge for drips'], presentation: ['Fill pitcher halfway', 'Pour a little into each glass, moving left to right', 'Go back and even them out', 'The child learns to estimate and adjust', 'Spills are cleaned with the sponge — this is part of the work'], whyItMatters: 'Pouring into multiple vessels requires estimation (proto-math), sequential planning (executive function), and fine motor control. When a child masters this, they are ready for increasingly complex practical life work.' },
          { name: 'Table Washing', description: 'A complete multi-step sequence: prepare materials, wet table, apply soap, scrub, rinse, dry, return materials.', materials: ['Bucket', 'Soap', 'Scrub brush', 'Drying cloth', 'Apron', 'Floor towel'], presentation: ['This has 12+ steps — demonstrate the full sequence slowly', 'The child will not get it right the first time (or the tenth)', 'The PROCESS is the point, not a clean table', 'This activity typically takes 20-30 minutes and produces deep satisfaction'], whyItMatters: 'Table washing is one of the great Montessori practical life works. It requires planning, sequencing, physical coordination, and sustained effort. Children who master complex practical life sequences show stronger executive function in elementary school.' },
        ]
      },
      {
        area: 'sensorial', areaLabel: 'Sensorial',
        description: 'The sensorial materials give your child a systematic way to classify the world through their senses.',
        activities: [
          { name: 'Color Tablet Matching (Box 1)', description: 'Matching pairs of primary color tablets — red, blue, and yellow.', materials: ['Color Tablets Box 1 (or DIY paint chips in pairs)'], presentation: ['Lay out one set of three colors in a row', 'Pick up a tablet from the second set', '"I\'m looking for the one that matches."', 'Place it next to its match', 'Invite the child to try with the remaining two'], whyItMatters: 'Color matching seems simple but it builds visual discrimination — the ability to perceive fine differences. This same skill lets a child later distinguish between b and d, or between + and ×.' , diyTip: 'Get two of each paint sample card from a hardware store. Cut them to uniform size. Glue to cardboard. You have Color Tablets Box 1 for free.' },
          { name: 'Pink Tower', description: 'Ten pink cubes graded from 1cm to 10cm, stacked from largest to smallest.', materials: ['Pink Tower (or DIY graduated blocks)'], presentation: ['Carry each cube individually to the rug (this builds care and attention)', 'Build the tower slowly, selecting the largest each time', 'Step back and admire', 'Invite the child to try', 'When they build it "wrong," say nothing — the tower falling IS the control of error'], whyItMatters: 'The Pink Tower teaches visual discrimination of size in three dimensions. It also introduces concepts used in mathematics: the progression from 1 to 10, the cube as a geometric form, and the relationship between numbers (the 2-cube is 8x smaller than the 1-cube in volume). The child doesn\'t know this yet. Their hands know.', diyTip: 'Cut wooden blocks in graduated sizes. They don\'t need to be pink — the precision of the graduation matters more than the color.' },
        ]
      },
      {
        area: 'language', areaLabel: 'Language',
        description: 'At three, the sensitive period for language is at its most powerful. Letter sounds, vocabulary enrichment, and early writing preparation all begin.',
        activities: [
          { name: 'I Spy — Beginning Sounds', description: 'A sound game that develops phonemic awareness — the ability to hear individual sounds in words.', materials: ['3 objects with different beginning sounds (e.g., ball, mouse, key)'], presentation: ['"I spy with my little eye something that begins with /bbb/" (the SOUND, not the letter name)', 'Child identifies the ball', 'Start with 3 objects with very different sounds', 'Later: ending sounds, then middle sounds', 'CRITICAL: Use sounds, NEVER letter names. /mmm/ not "em"'], whyItMatters: 'This is THE most important pre-reading activity in Montessori. A child who can hear individual sounds in words can later blend those sounds to read and segment them to write. I Spy is the bridge from spoken language to written language.', diyTip: 'You need zero materials. Play I Spy anywhere: in the car, at the store, at the dinner table. "I spy something that starts with /sss/."' },
          { name: 'Sandpaper Letters', description: 'Letters cut from sandpaper and mounted on boards. The child traces the letter while saying its sound, creating a tactile-auditory-visual association.', materials: ['Sandpaper Letters (or DIY: cut letters from sandpaper, glue to cardboard)'], presentation: ['Introduce 2-3 letters at a time using the Three Period Lesson', 'Trace the letter with two fingers while saying the SOUND', 'The child traces and says the sound', 'Choose letters that make words together (m, a, t → mat)'], whyItMatters: 'Sandpaper Letters engage three senses simultaneously: touch (tracing), sight (seeing the shape), and hearing (saying the sound). This multi-sensory approach means the child is writing the letter with their muscles before they ever hold a pencil. When they do pick up a pencil, the letter shapes are already in their hands.' },
        ]
      }
    ],
    environmentTips: [
      'A dedicated work shelf with 8-10 activities, organized left to right, top to bottom',
      'A defined rug for floor work — rolling and unrolling the rug is itself a practical life exercise',
      'A reading nook with books displayed cover-forward (not spine-out)',
      'Art supplies accessible: paper, crayons, scissors, glue on a tray',
    ],
    commonMistakes: [
      'Teaching letter NAMES instead of SOUNDS — this actually delays reading',
      'Skipping practical life because "they\'re ready for academics" — practical life IS the foundation',
      'Interrupting concentration to offer help, snacks, or praise',
      'Expecting perfect results — the process is everything at this age',
    ],
    relatedAges: ['2-years', '4-years', '5-years'],
  },
  {
    slug: '4-years', age: '4 years', ageLabel: '4-Year-Olds',
    metaTitle: 'Montessori Activities for 4 Year Olds — Learning Guide',
    metaDescription: 'Montessori activities for 4 year olds at home. Writing preparation, math readiness, sensorial refinement, and practical life mastery with detailed guidance.',
    heroTitle: 'Montessori Activities for 4-Year-Olds',
    intro: 'Four is when everything comes together. Your child may be on the verge of the explosion into writing — or already there. Mathematical thinking is emerging naturally from sensorial work. Concentration deepens dramatically. The child who was learning to pour water at two is now washing dishes independently. Trust the progression.',
    agePlane: '3-6', agePlaneDescription: 'Deep in the conscious absorbent mind with increasingly long concentration spans and growing abstraction ability.',
    sensitivePeriods: ['Writing (PEAK)', 'Reading (emerging)', 'Math (emerging)', 'Refinement of senses', 'Social behavior'],
    categories: [
      { area: 'language', areaLabel: 'Language & Writing', description: 'If your child knows letter sounds, they may be ready to write — meaning encode their own thoughts using the Moveable Alphabet.',
        activities: [
          { name: 'Moveable Alphabet — First Words', description: 'Using loose letter tiles to build words phonetically. Writing before pencil writing.', materials: ['Moveable Alphabet (or DIY letter tiles, magnetic letters)'], presentation: ['"Let\'s write! What word would you like to make?"', 'Help them sound it out: "cat — what\'s the first sound? /k/. Find the c."', '"What comes next? /aaa/. Find the a."', '"Last sound? /t/. Find the t."', '"You wrote CAT!" (genuine delight)'], whyItMatters: 'In Montessori, children WRITE before they READ. This seems backwards but it\'s developmentally sound: encoding (expressing YOUR thoughts in symbols) is easier than decoding (interpreting SOMEONE ELSE\'s symbols). A child who writes "sed" for "said" is showing excellent phonemic awareness — celebrate it.', diyTip: 'Magnetic letters on a cookie sheet work perfectly. Or print letters on card stock and cut them out. The child just needs moveable letters they can arrange.' },
        ]
      },
      { area: 'mathematics', areaLabel: 'Mathematics', description: 'Math begins with concrete materials that the child can hold, count, and manipulate.',
        activities: [
          { name: 'Golden Bead Introduction', description: 'Physical materials representing units (single beads), tens (bead bars of 10), hundreds (bead squares of 100), and thousands (bead cubes of 1000).', materials: ['Golden bead material or equivalent (beads, bead bars, bead squares, bead cube)'], presentation: ['Place one unit bead in their hand: "This is one unit."', 'Place the ten-bar: "This is one ten. Can you count the beads?"', 'Place the hundred-square: "This is one hundred." (Let them feel the weight)', 'Place the thousand-cube: "This is one thousand." (Their eyes will widen)', 'Let them hold each, compare weights, count beads on the ten-bar'], whyItMatters: 'A child who has HELD a thousand-cube understands place value in their body, not just their mind. This physical understanding means they will never be confused by carrying in addition or borrowing in subtraction — they\'ve felt what it means to exchange ten units for one ten.' },
        ]
      }
    ],
    environmentTips: ['A writing area with pencils, paper, and Moveable Alphabet always accessible', 'Math materials on a dedicated shelf', 'A calendar at child height that you reference daily', 'Increasingly complex practical life: sewing, polishing, flower arranging'],
    commonMistakes: ['Pushing pencil writing before the hand is ready — let them use the Moveable Alphabet', 'Correcting phonetic spelling — "sed" for "said" is CORRECT phonemic awareness', 'Drilling math facts instead of letting them discover through materials', 'Interrupting the 3-hour work cycle for scheduled activities'],
    relatedAges: ['3-years', '5-years', '6-years'],
  },
  {
    slug: '5-years', age: '5 years', ageLabel: '5-Year-Olds',
    metaTitle: 'Montessori Activities for 5 Year Olds — Advanced Guide',
    metaDescription: 'Advanced Montessori activities for 5 year olds. Reading explosion, mathematical operations, cultural studies, and independent work cycle mastery.',
    heroTitle: 'Montessori Activities for 5-Year-Olds',
    intro: 'Five is the year of the explosion — into reading, into mathematical operations, into research and cultural curiosity. If the foundation has been laid through practical life, sensorial, and early language work, five-year-olds often seem to learn in quantum leaps. They may go from sounding out CVC words to reading short books in a matter of weeks. Trust the preparation.',
    agePlane: '3-6', agePlaneDescription: 'At the peak of the 3-6 curriculum with long concentration spans and increasing abstraction.',
    sensitivePeriods: ['Reading (PEAK)', 'Math (PEAK)', 'Social behavior', 'Cultural curiosity'],
    categories: [
      { area: 'language', areaLabel: 'Reading & Writing', description: 'After months of encoding with the Moveable Alphabet, your child may spontaneously discover they can decode — read.',
        activities: [
          { name: 'Phonetic Reading Cards', description: 'Cards with simple CVC words (cat, dog, pen, sun) for the child to decode independently.', materials: ['CVC word cards', 'Matching objects or pictures optional'], presentation: ['Place 3-4 cards face down', 'Child turns one over and sounds it out: /c/ /a/ /t/ → "cat!"', 'If they\'re matching to objects: read the card, find the object', 'Progress to short phrases, then simple sentences'], whyItMatters: 'The moment a child realizes they can read is one of the most profound moments in Montessori education. It happens not because someone taught them to read, but because all the preceding work — I Spy, Sandpaper Letters, Moveable Alphabet — prepared them. They decoded on their own.' },
        ]
      },
      { area: 'mathematics', areaLabel: 'Mathematical Operations', description: 'With the Golden Beads mastered, five-year-olds can perform all four operations with concrete materials.',
        activities: [
          { name: 'Golden Bead Addition', description: 'Two children each bring a quantity of golden beads, combine them, and find the result — they have performed addition with 4-digit numbers.', materials: ['Golden bead materials', 'Number cards', 'Two rugs'], presentation: ['Each person takes a number card (e.g., 2,435 and 1,352)', 'Each collects the correct quantity of beads on their rug', 'They bring their beads together', 'Count the combined quantity', 'If any category exceeds 9, exchange 10 units for 1 ten (etc.)', 'Find the answer with number cards'], whyItMatters: 'A five-year-old doing 4-digit addition with carrying is remarkable by conventional standards. But with golden beads it\'s natural — they can SEE and HOLD the quantities. The abstraction (written algorithms) comes later, built on physical understanding.' },
        ]
      }
    ],
    environmentTips: ['Books everywhere — accessible, diverse, inviting', 'A research area where questions can be explored', 'Writing materials that invite composition, not just copying', 'Cultural materials: globe, maps, nature specimens'],
    commonMistakes: ['Rushing to workbooks and worksheets — the materials ARE the curriculum', 'Stopping practical life because they\'re "past that" — practical life continues through elementary', 'Pushing comprehension questions after reading — let the joy of decoding be enough for now', 'Comparing reading timelines between children — the range of normal is enormous'],
    relatedAges: ['4-years', '6-years', '7-years'],
  },
]

// ── TOPIC PAGES: "Montessori guide to [topic]" ──

export interface TopicPageData {
  slug: string
  topic: string
  metaTitle: string
  metaDescription: string
  heroTitle: string
  intro: string
  montessoriView: string
  commonApproach: string
  sections: Array<{ heading: string; content: string }>
  ageSpecificTips: Array<{ ageRange: string; tip: string }>
  scripts?: Array<{ situation: string; say: string; why: string }>
  relatedTopics: string[]
}

export const TOPIC_PAGES: TopicPageData[] = [
  {
    slug: 'discipline', topic: 'Discipline',
    metaTitle: 'Montessori Discipline — A Complete Guide for Parents',
    metaDescription: 'How Montessori handles discipline without punishment, time-outs, or rewards. Practical scripts, real examples, and the philosophy behind positive guidance.',
    heroTitle: 'The Montessori Approach to Discipline',
    intro: 'Montessori discipline is often misunderstood — either as "no rules" or as "overly permissive." Neither is true. Montessori discipline is about building internal self-regulation through a prepared environment, clear and consistent limits, and respectful guidance. The goal is not obedient children but self-disciplined ones.',
    montessoriView: 'Discipline is not something done TO a child. It is something that develops WITHIN a child through consistent boundaries, natural consequences, and an environment that supports good choices. External rewards and punishments create dependence on external control. Montessori builds the internal kind.',
    commonApproach: 'Conventional discipline relies on time-outs, reward charts, counting to three, and imposed consequences. While these can produce short-term compliance, they don\'t develop internal self-regulation. A child who behaves because they fear punishment or desire a sticker has not learned self-discipline.',
    sections: [
      { heading: 'Prevention Through Environment', content: '90% of behavioral issues are environment problems, not child problems. If a child keeps throwing food, ask: Are they not hungry? Is the meal too long? Are they seeking attention? Before addressing behavior, always ask: "What is the environment telling the child to do?"' },
      { heading: 'Clear, Consistent Limits', content: 'State limits positively: "Chairs are for sitting" instead of "Don\'t stand on the chair." Follow through every single time — inconsistency creates testing behavior. Limits should be few, clear, and non-negotiable.' },
      { heading: 'Natural and Logical Consequences', content: 'Natural consequence: Child refuses coat → child feels cold (when safe). Logical consequence: Child throws food → meal is over. The test for a good consequence: Is it connected to the behavior? Is it respectful? Would I do this to a friend? If any answer is no, it\'s punishment.' },
      { heading: 'Modeling Over Lecturing', content: 'Children learn behavior by watching adults, not by being told. If you want a child to speak calmly, speak calmly — especially when frustrated. Grace and courtesy lessons are formal modeling opportunities where you demonstrate exact words and actions.' },
    ],
    ageSpecificTips: [
      { ageRange: '0-3', tip: 'At this age, discipline is almost entirely about the environment. Child-proof, provide safe options, and redirect. They are not yet capable of understanding rules — they understand routines and limits enforced through gentle physical guidance.' },
      { ageRange: '3-6', tip: 'Children can now understand simple rules and their reasons. Grace and courtesy lessons become powerful. Offer two-choice options. Follow through immediately and consistently. The prepared environment still does most of the work.' },
      { ageRange: '6-12', tip: 'The elementary child develops a strong sense of justice. Involve them in creating family agreements. Natural consequences become more effective. They can reflect on their behavior — ask "What happened?" before "What should happen."' },
      { ageRange: '12+', tip: 'Adolescents need collaborative agreements, not imposed rules. Respect their growing autonomy while maintaining safety boundaries. When they make mistakes, process alongside them rather than punishing.' },
    ],
    scripts: [
      { situation: 'Child hits', say: '"I won\'t let you hit. Hitting hurts. I can see you\'re feeling very angry. You can stomp your feet, squeeze this ball, or tell me with words."', why: 'Stops the behavior, validates the emotion, redirects the impulse.' },
      { situation: 'Child refuses to clean up', say: '"I see you\'re still working. I\'ll set a timer for two more minutes, then materials go back on the shelf. Would you like to do it yourself or together?"', why: 'Acknowledges, gives advance notice, offers limited choice.' },
      { situation: 'Tantrum / meltdown', say: '"I\'m here. You\'re safe. I\'ll wait with you." (After it passes: "That was big. What happened?")', why: 'Stay present, don\'t reason during the meltdown, connect before correcting.' },
    ],
    relatedTopics: ['tantrums', 'screen-time', 'independence'],
  },
  {
    slug: 'tantrums', topic: 'Tantrums',
    metaTitle: 'Montessori Guide to Tantrums — Understanding & Responding',
    metaDescription: 'How to handle tantrums the Montessori way. Understand why they happen, what to do during a meltdown, and how to prevent them through environment and routine.',
    heroTitle: 'Understanding Tantrums Through a Montessori Lens',
    intro: 'Tantrums are not misbehavior. They are a communication from a child whose emotions have overwhelmed their still-developing ability to regulate. In Montessori, we don\'t try to stop tantrums — we try to understand them, support the child through them, and address the underlying need.',
    montessoriView: 'A tantrum is information. It tells you that something in the environment, routine, or expectation has exceeded the child\'s capacity. The child is not "being bad" — they are having a hard time. Your calm presence is the most powerful intervention.',
    commonApproach: 'Conventional advice often includes ignoring tantrums, using time-outs, or distracting the child. While distraction can work for minor frustrations, ignoring or isolating a child during a genuine emotional crisis teaches them that big feelings are unacceptable and must be handled alone.',
    sections: [
      { heading: 'Why Tantrums Happen', content: 'Common triggers include: disrupted routine (sensitive period for order), hunger or fatigue, too many transitions, overstimulation, loss of autonomy ("you MUST do this"), and unmet need for connection. Most tantrums have a predictable trigger that can be prevented.' },
      { heading: 'During the Tantrum', content: 'Stay calm. Stay present. Say less, not more. The reasoning brain is offline during a meltdown — logic, explanations, and questions will not work. Your job is to be a calm anchor. "I\'m here. You\'re safe." That\'s enough.' },
      { heading: 'After the Storm', content: 'When the child is calm again — and not before — connect first: "That was really big. You were so upset." Then, if appropriate, gently explore: "What happened?" This builds emotional vocabulary and self-awareness.' },
      { heading: 'Prevention', content: 'Consistent routine, adequate sleep, advance notice of transitions, limited choices, prepared environment, and regular connection time prevent the majority of tantrums. A well-rested child in a predictable environment with appropriate autonomy rarely melts down.' },
    ],
    ageSpecificTips: [
      { ageRange: '1-2', tip: 'Tantrums at this age are often about the sensitive period for order. Something is "wrong" in their world. Before dismissing it, consider: what changed? Even something as small as a different cup can trigger a meltdown. This is real, not manipulation.' },
      { ageRange: '2-3', tip: 'The birth of will creates a surge of "NO!" This is healthy development, not defiance. Offer two acceptable choices. Don\'t ask questions that have a "yes or no" answer unless you can accept "no."' },
      { ageRange: '3-5', tip: 'Tantrums may shift from physical to emotional. Help them name their feelings. Create a calm-down space (not a punishment space) with sensory tools: stress ball, soft fabric, breathing cards.' },
    ],
    relatedTopics: ['discipline', 'screen-time', 'picky-eating'],
  },
  {
    slug: 'screen-time', topic: 'Screen Time',
    metaTitle: 'Montessori & Screen Time — A Balanced Guide for Parents',
    metaDescription: 'The Montessori perspective on screen time for children. Practical guidelines by age, how to reduce screens without battles, and why hands-on experience matters.',
    heroTitle: 'Screen Time: The Montessori Perspective',
    intro: 'This is one of the most asked-about topics in modern Montessori parenting. The short answer: Montessori favors real-world, hands-on, sensorial experience — especially in the first six years. But the goal is not guilt. It\'s understanding why it matters and finding what\'s realistic for your family.',
    montessoriView: 'During the first plane of development (0-6), the child constructs their understanding of the world through ALL their senses and through movement. Screens provide only 2 of 5 senses (visual and auditory) and require no movement. Every minute on a screen is a minute not spent in the three-dimensional world where development happens.',
    commonApproach: 'Many parents use screens as a management tool — and for good reason. Modern life is exhausting. The goal isn\'t to make parents feel guilty about screen use, but to understand the trade-off and find sustainable alternatives.',
    sections: [
      { heading: 'Under 2', content: 'Zero screen time except video calling with family. The research is clear and Montessori aligns with AAP recommendations. At this age, the child needs real faces, real voices, real objects, and real movement.' },
      { heading: 'Ages 2-6', content: 'Minimal and intentional. If you use screens, choose slow-paced, real-world content over fast-paced animation. But the real question is: what could replace 30 minutes of screen time? Often the answer is practical life — cooking together, cleaning together, gardening.' },
      { heading: 'Ages 6-12', content: 'Screens can be tools for research and creation — not passive consumption. Agree on boundaries collaboratively. The child should be able to articulate WHAT they are using the screen for.' },
      { heading: 'Reducing Without Battles', content: 'Give advance notice ("5 more minutes"). Offer a concrete alternative ("Screen goes off now. Would you like to help me make a snack or go outside?"). Be matter-of-fact. Don\'t negotiate. The transition is hardest the first week, then becomes routine.' },
    ],
    ageSpecificTips: [
      { ageRange: '0-2', tip: 'Replace screen time with: treasure basket exploration, floor time, narrated walks, water play, kitchen involvement (washing vegetables, tearing lettuce).' },
      { ageRange: '2-4', tip: 'Replace with: practical life activities (sweeping, pouring, food prep), sensory bins, read-alouds, outdoor exploration, and art.' },
      { ageRange: '4-6', tip: 'Replace with: Moveable Alphabet, art projects, building, cooking, gardening, and free outdoor play.' },
      { ageRange: '6+', tip: 'Shift from no-screens to intentional-screens. "What are you creating?" is a better question than "How long have you been on?"' },
    ],
    relatedTopics: ['discipline', 'independence', 'prepared-environment'],
  },
  {
    slug: 'independence', topic: 'Independence',
    metaTitle: 'Building Independence in Children — Montessori Guide',
    metaDescription: 'How to foster independence in children using Montessori principles. Age-by-age guide to self-care, chores, decision-making, and the prepared environment.',
    heroTitle: 'Building Independence: The Heart of Montessori',
    intro: '"Help me do it myself" — this is the child\'s constant, unspoken request. Independence is not about leaving children to fend for themselves. It is about preparing the environment so they CAN do things for themselves, and then stepping back to let them.',
    montessoriView: 'Every unnecessary act of help is an obstacle to development. When we tie a shoe the child could tie, pour a drink the child could pour, or make a decision the child could make, we are telling them: "I don\'t trust you to do this." Independence builds confidence, competence, and self-worth.',
    commonApproach: 'Modern parenting often over-helps out of love, efficiency, or anxiety. It\'s faster to put on the child\'s shoes. It\'s cleaner to pour the milk yourself. But each act of over-helping delays the child\'s development of competence.',
    sections: [
      { heading: 'The Prepared Environment', content: 'Independence starts with the environment, not with the child. If their clothes are too high to reach, they can\'t dress independently. If their cups are in an adult cabinet, they can\'t get their own water. The question is always: "What can I change in the environment so the child doesn\'t need me for this?"' },
      { heading: 'Observation Before Intervention', content: 'Before helping, wait. Count to 10 internally. Most of the time, the child figures it out. If they ask for help, help the minimum amount: "Would you like me to start the zipper for you?" not "Let me do it."' },
      { heading: 'Tolerate Imperfection', content: 'A two-year-old\'s poured water will include spills. A three-year-old\'s made bed will be lumpy. A four-year-old\'s sliced banana will be uneven. This is success, not failure. The doing matters more than the result.' },
    ],
    ageSpecificTips: [
      { ageRange: '0-18 months', tip: 'Floor bed, accessible toys, open cup, feeding self with hands then spoon, removing socks/shoes.' },
      { ageRange: '18mo-3y', tip: 'Dressing with help, hand washing, tooth brushing, putting away toys, pouring, simple food prep.' },
      { ageRange: '3-6', tip: 'Full dressing, complete hygiene routine, food preparation, setting table, cleaning up messes, choosing activities.' },
      { ageRange: '6-12', tip: 'Making meals, doing laundry, managing schedule, homework independently, contributing to household.' },
      { ageRange: '12+', tip: 'Budget management, cooking for the family, scheduling own appointments, traveling independently, mentoring younger children.' },
    ],
    relatedTopics: ['discipline', 'prepared-environment', 'screen-time'],
  },
]

// ── COMPARISON PAGES: "Montessori vs [alternative]" ──

export interface ComparePageData {
  slug: string
  versus: string
  metaTitle: string
  metaDescription: string
  heroTitle: string
  intro: string
  dimensions: Array<{ dimension: string; montessori: string; other: string }>
  bestFor: { montessori: string[]; other: string[] }
  relatedComparisons: string[]
}

export const COMPARE_PAGES: ComparePageData[] = [
  {
    slug: 'waldorf', versus: 'Waldorf',
    metaTitle: 'Montessori vs Waldorf — Key Differences Explained',
    metaDescription: 'An honest comparison of Montessori and Waldorf education. Curriculum, philosophy, role of the teacher, approach to fantasy, and which might suit your child.',
    heroTitle: 'Montessori vs. Waldorf',
    intro: 'Montessori and Waldorf are both child-centered approaches that share a deep respect for childhood. They are more alike than different — especially compared to conventional schooling. But they diverge on several key points that matter when choosing the right fit for your family.',
    dimensions: [
      { dimension: 'View of the child', montessori: 'The child is a self-constructing individual who develops through interaction with a prepared environment. Each child follows their own developmental timeline.', other: 'The child develops through imitation, imagination, and rhythm. Development follows a universal pattern tied to seven-year cycles.' },
      { dimension: 'Role of fantasy', montessori: 'Distinguishes between the child\'s own imagination (encouraged) and adult-imposed fantasy (questioned for under-6). Prefers real-world experiences as the foundation for understanding.', other: 'Fantasy, fairy tales, and storytelling are central to the curriculum, especially in early years. Imagination is seen as the primary learning tool.' },
      { dimension: 'Materials', montessori: 'Specific, scientifically designed materials with built-in control of error. The child learns through hands-on manipulation of precise materials.', other: 'Natural, open-ended materials: silk scarves, wooden blocks, beeswax, wool. The materials invite imaginative play rather than specific skill development.' },
      { dimension: 'Reading & academics', montessori: 'Follows the child — if a 4-year-old is interested in letters, they learn to write and read. Academics emerge organically from sensitive periods.', other: 'Formal academics are deliberately delayed until age 7. Early years focus on play, movement, and social development.' },
      { dimension: 'Teacher role', montessori: 'A guide who observes and prepares the environment. Gives individual or small-group presentations. Steps back when the child can work independently.', other: 'A beloved authority figure who leads the class through rhythm, story, and shared activities. More teacher-directed, especially in early years.' },
      { dimension: 'Structure', montessori: 'Children choose their own work within a prepared environment. The 3-hour uninterrupted work cycle is sacred.', other: 'The day follows a predictable rhythm of activities led by the teacher. Less individual choice, more communal experience.' },
    ],
    bestFor: {
      montessori: ['Children who are self-directed and enjoy choosing their own work', 'Families who value early academic readiness that follows the child\'s interest', 'Parents who want concrete, measurable developmental tracking', 'Children who thrive with independence and hands-on materials'],
      other: ['Children who thrive with rhythm, routine, and teacher-led activities', 'Families who value a slower, less academic early childhood', 'Parents who want a strong emphasis on arts, music, and storytelling', 'Children who are highly imaginative and social'],
    },
    relatedComparisons: ['reggio-emilia', 'traditional', 'homeschool'],
  },
  {
    slug: 'reggio-emilia', versus: 'Reggio Emilia',
    metaTitle: 'Montessori vs Reggio Emilia — Comparison Guide',
    metaDescription: 'Comparing Montessori and Reggio Emilia approaches to early childhood education. Project-based vs materials-based, environment design, and teacher roles.',
    heroTitle: 'Montessori vs. Reggio Emilia',
    intro: 'Both Montessori and Reggio Emilia see the child as competent, curious, and capable. Both value beautiful environments and respect the child\'s interests. The differences lie in structure: Montessori provides a specific curriculum and materials sequence, while Reggio follows emergent projects driven by children\'s questions.',
    dimensions: [
      { dimension: 'Curriculum', montessori: 'A defined scope and sequence with specific materials presented in a developmental order. The path is clear; the child\'s pace is their own.', other: 'Emergent curriculum based on children\'s interests. Projects can last days or weeks, evolving as questions deepen.' },
      { dimension: 'Environment', montessori: 'The prepared environment with specific materials on low shelves, each with a defined purpose. Order and beauty are paramount.', other: 'The environment as "third teacher." Spaces are designed to provoke wonder, with natural materials, mirrors, light tables, and documentation of children\'s thinking.' },
      { dimension: 'Documentation', montessori: 'Observation records, development tracking, and portfolio assessment. Teachers observe individual children\'s work with specific materials.', other: 'Extensive documentation of children\'s thinking through photographs, transcribed conversations, and displayed work. Documentation is itself a teaching tool.' },
      { dimension: 'Teacher role', montessori: 'Guide who presents materials, observes, and prepares the environment for individual children.', other: 'Co-researcher who explores questions alongside children, documents their thinking, and plans provocations based on observed interests.' },
      { dimension: 'Individual vs. group', montessori: 'Primarily individual work, with some small-group and partner activities. Each child follows their own path through the materials.', other: 'Strong emphasis on group projects and collaborative exploration. The social dynamic is central to learning.' },
    ],
    bestFor: {
      montessori: ['Families wanting a clear, proven curriculum progression', 'Children who benefit from structure and individual work', 'Homeschooling families who want a defined scope and sequence', 'Parents who value independence and self-correction'],
      other: ['Families who value collaborative, project-based learning', 'Children who thrive in group exploration', 'Parents who value artistic expression and documentation', 'Families near a strong Reggio-inspired program'],
    },
    relatedComparisons: ['waldorf', 'traditional', 'homeschool'],
  },
  {
    slug: 'traditional', versus: 'Traditional School',
    metaTitle: 'Montessori vs Traditional School — What Parents Need to Know',
    metaDescription: 'How Montessori differs from traditional schooling. Classroom structure, testing, homework, social development, and academic outcomes compared.',
    heroTitle: 'Montessori vs. Traditional Schooling',
    intro: 'The differences between Montessori and traditional schooling run deeper than materials or classroom layout. They reflect fundamentally different views of how children learn, what motivates them, and what the purpose of education is.',
    dimensions: [
      { dimension: 'Learning model', montessori: 'Child chooses work from a prepared environment. Learning is self-paced and individualized. The teacher observes and guides.', other: 'Teacher-directed instruction to the whole class. Learning follows a standardized pace. Students receive the same lesson at the same time.' },
      { dimension: 'Motivation', montessori: 'Intrinsic. The work itself is the reward. No grades, stickers, or competitive ranking. Children work because the activity meets a developmental need.', other: 'Often extrinsic. Grades, test scores, honor rolls, and rewards. Children work to earn approval or avoid consequences.' },
      { dimension: 'Mixed ages', montessori: '3-year age groupings (3-6, 6-9, 9-12). Older children mentor younger ones. Younger children aspire to older children\'s work.', other: 'Single-age classrooms. Children interact primarily with same-age peers.' },
      { dimension: 'Assessment', montessori: 'Observation-based. Teachers track each child\'s progress through the curriculum materials. No standardized tests in early years.', other: 'Test-based. Regular standardized assessments, quizzes, and graded assignments.' },
      { dimension: 'Homework', montessori: 'Generally none in early years. When present in elementary, it is purposeful and self-directed (often research).', other: 'Regular homework beginning in kindergarten or first grade.' },
      { dimension: 'Movement', montessori: 'Children move freely throughout the classroom. They choose where to work — floor, table, standing.', other: 'Children are typically seated at desks for most of the day with scheduled movement breaks.' },
    ],
    bestFor: {
      montessori: ['Families who value independence, self-motivation, and intrinsic learning', 'Children who need to move while learning', 'Families who question conventional grading and testing', 'Children who benefit from self-paced learning'],
      other: ['Families who value standardized assessment and clear benchmarks', 'Children who thrive with teacher-directed structure', 'Families in areas without quality Montessori options', 'Children who are motivated by external recognition'],
    },
    relatedComparisons: ['waldorf', 'reggio-emilia', 'homeschool'],
  },
]

// ── Helper: Get all slugs for static generation ──

export function getAllActivitySlugs(): string[] {
  return ACTIVITY_PAGES.map(p => p.slug)
}

export function getAllTopicSlugs(): string[] {
  return TOPIC_PAGES.map(p => p.slug)
}

export function getAllCompareSlugs(): string[] {
  return COMPARE_PAGES.map(p => p.slug)
}
