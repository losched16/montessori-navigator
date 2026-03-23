// Monthly Development Guide
// Comprehensive month-by-month developmental milestones and Montessori activities
// for children from birth to 36 months, grounded in brain myelination research
// and Maria Montessori's observations of the developing child.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Activity {
  name: string
  description: string
  icon: string // emoji
  category: 'sensory' | 'motor' | 'language' | 'practical_life' | 'cognitive'
}

export interface MonthlyGuide {
  id: string // e.g. 'month-1', 'month-6', 'months-15-18'
  monthNumber: number // 1-14 for individual months, 15 for 15-18, 18 for 18-24, 24 for 24-36
  monthLabel: string // "1 Month", "15-18 Months"
  ageRange: string // "Birth to 1 Month", "15 to 18 Months"
  tagline: string // Short inspirational tagline
  brainDevelopment: string // Summary of brain myelination waves happening
  bodyDevelopment: string // Summary of physical/body development
  grossMotor: {
    shouldBeAbleTo: string[]
    probablyAbleTo: string[]
    mayEvenBeAbleTo: string[]
  }
  handDevelopment: string[] // Key hand development milestones
  communication: string[] // Communication and vocalization milestones
  socialEmotional: string[] // Social-emotional development points
  activities: Activity[] // Recommended activities
  sensoryDevelopment: string[] // Vision, hearing, touch, vestibular development
  reflexes: string[] // Which reflexes are present/disappearing
  touchAndBonding: string[] // Practical touch, bonding, and caregiving tips
  communicationTips: string[] // Practical tips for encouraging communication
  independenceGains: string[] // What independence looks like at this stage
  environmentTips: string[] // Home environment preparation tips
  watchFor: string[] // Things to observe/celebrate (not red flags)
}

// ---------------------------------------------------------------------------
// Monthly Guide Data
// ---------------------------------------------------------------------------

export const MONTHLY_GUIDES: MonthlyGuide[] = [
  // =========================================================================
  // MONTH 1
  // =========================================================================
  {
    id: 'month-1',
    monthNumber: 1,
    monthLabel: '1 Month',
    ageRange: 'Birth to 1 Month',
    tagline: 'Welcome to the world — every sensation is brand new',
    brainDevelopment:
      'The second wave of myelination begins at birth. The Cerebellum (balance and coordination), Occipital lobe (vision), Parietal lobe (touch and spatial awareness), and Wernicke\'s area (language comprehension) are all actively myelinating. Your newborn\'s brain is building the foundational wiring for processing the world.',
    bodyDevelopment:
      'Your baby can control their eyes as the nerve fibers connecting to the eyes myelinate. The body remains in the characteristic newborn curled-up position, a natural carry-over from the womb. Reflexes such as rooting, sucking, grasping, and the Moro reflex are all present and serve as the foundation for later voluntary movements.',
    grossMotor: {
      shouldBeAbleTo: [
        'Maintain the curled-up newborn position when placed on back',
        'Turn head side to side briefly when placed on stomach',
        'Move arms and legs in uncoordinated, reflexive patterns',
      ],
      probablyAbleTo: [
        'Lift head momentarily during tummy time',
        'Turn toward a familiar voice or sound',
      ],
      mayEvenBeAbleTo: [
        'Hold head up briefly at 45 degrees during tummy time',
        'Focus on a face held 8 to 12 inches away',
      ],
    },
    handDevelopment: [
      'Hand closing is entirely reflexive at this stage — the palmar grasp reflex causes the hand to close tightly around anything that touches the palm',
      'No voluntary fine motor control exists yet; movements are driven by primitive reflexes',
      'Hands are typically held in closed fists most of the time',
    ],
    communication: [
      'Cycles through six states of consciousness: deep sleep, light sleep, drowsy, quiet alert, active alert, and crying',
      'Crying is the primary form of communication — each cry pattern conveys different needs',
      'May begin cooing softly toward the end of the first month, especially during quiet alert states',
      'Stares intently at faces during the quiet alert state, absorbing facial expressions',
    ],
    socialEmotional: [
      'Recognizes the sound of a parent\'s voice and is calmed by it',
      'Prefers human faces over any other visual stimulus',
      'Bonds through skin-to-skin contact, feeding, and being held',
      'The quiet alert state is the optimal time for connection and gentle interaction',
    ],
    activities: [
      {
        name: 'Movement Mat with Munari Mobile',
        description:
          'Place your baby on a firm movement mat with the Munari mobile hung approximately 12 inches above their chest. This black-and-white geometric mobile is perfectly calibrated for a newborn\'s developing vision and encourages focused visual tracking.',
        icon: '\u{1F3A8}',
        category: 'sensory',
      },
      {
        name: 'Tummy Time on the Floor',
        description:
          'Begin with short periods of tummy time on a firm surface, just a minute or two at a time. Stay close, face-to-face with your baby, offering encouragement. This strengthens neck and shoulder muscles and begins the long journey toward independent movement.',
        icon: '\u{1F476}',
        category: 'motor',
      },
      {
        name: 'Topponcino Holding',
        description:
          'Use a topponcino (a thin, oval cushion) when holding and transferring your baby. It provides consistent warmth, scent, and support, creating a sense of security during transitions between arms, surfaces, and caregivers.',
        icon: '\u{1F90D}',
        category: 'sensory',
      },
      {
        name: 'Talking Through Care Routines',
        description:
          'Narrate each step of diaper changes, feeding, and bathing. "I\'m going to lift your legs now. Here comes the warm water." This respectful communication builds trust and begins the language absorption process from day one.',
        icon: '\u{1F5E3}\uFE0F',
        category: 'language',
      },
      {
        name: 'Quiet Music and Singing',
        description:
          'Play soft classical music or sing lullabies during calm, wakeful moments. Your baby has been hearing your voice for months in the womb and finds it deeply soothing. Music also stimulates the auditory pathways that are actively myelinating.',
        icon: '\u{1F3B5}',
        category: 'sensory',
      },
    ],
    sensoryDevelopment: [
      'Vision limited to 20-35 cm — just the right distance for feeding and face-to-face bonding',
      'Baby relies on peripheral vision more than direct focusing; attracted to bold contrast patterns, especially black and white',
      'Hearing is well developed but tuned to lower-pitched sounds from in-utero experience',
      'Touch receptors concentrated around the mouth, making it the primary tool for sensory exploration',
      'Smell is acutely developed from birth to support bonding through skin-to-skin contact and feeding',
      'The vestibular system is functioning from birth, having developed in utero through movement and gravity changes',
      'Eye movements are jerky or staggered; baby can track very slowly moving objects',
      'Baby can recognize mother\'s face within hours after birth and prefers faces over objects',
    ],
    reflexes: [
      'All primitive reflexes present: rooting, head turning, sucking, swallowing, grasp (palmar), and Moro (startle)',
      'Primitive reflexes assist survival, protection, and the development of caregiver-baby relationships',
      'Each primitive reflex is linked to specific brain lobes where sensory processing occurs',
      'Permanent reflexes also present: eye blink, gag, yawn, cough, sneeze, and lip quiver — these never disappear',
      'Hand closing over an object is entirely reflexive at this stage, not voluntary',
    ],
    touchAndBonding: [
      'Skin-to-skin contact builds invaluable neural connections for security, emotional wellbeing, and immune health',
      'Use a Topponcino (comfort pillow) made from natural fibers — it holds your scent and helps baby feel safe',
      'Baby cannot regulate body temperature until about 6 months; keep them snug using natural fiber clothing and bedding',
      'Gentle, even pressure when drying after bathing helps develop body schema (awareness of all body parts)',
      'Allow baby to touch their own body freely without restrictive clothing — this builds early proprioception',
      'Bathing with dimmed lights offers a peaceful bonding experience as baby remembers their watery in-utero life',
      'Go slowly in the first weeks; it is easy to overstimulate a newborn — open the world to them little by little',
    ],
    communicationTips: [
      'Speak slowly and clearly to your newborn during quiet alert states — they are absorbing the melody and rhythm of your language even though they cannot yet respond',
      'Respond promptly and consistently to crying — this is not spoiling but building the foundation of trust that all later communication depends on',
      'Make eye contact during feeding and hold your face 8 to 12 inches from your baby\'s face, which is the focal distance their eyes can currently manage',
    ],
    independenceGains: [
      'Your newborn\'s independence begins with the ability to signal needs through different cry patterns',
      'During quiet alert states, your baby independently explores the world through vision and hearing',
      'When placed on a movement mat, your baby can freely move their limbs and begin to experience their own body in space',
    ],
    environmentTips: [
      'Set up a cestari (Moses basket) or simple bassinet near your sleeping area for nighttime care, keeping the sleep space calm and uncluttered',
      'Create a dedicated movement area on the floor with a firm mat, a low mirror mounted horizontally at floor level, and a mobile hanger for the Munari mobile',
      'Place a low shelf nearby with a few carefully chosen items — a rattle for later weeks, a soft cloth — so the environment is ordered and beautiful from the start',
      'Consider a floor bed or mattress on the floor for your baby\'s sleeping area, allowing free movement upon waking rather than containment in a crib',
      'Keep the environment calm with natural light, muted colors, and minimal visual clutter — your newborn\'s senses are easily overwhelmed',
    ],
    watchFor: [
      'Moments of quiet alertness when your baby stares intently at a face or mobile — this deep focus is already the beginning of concentration',
      'The first soft cooing sounds, often appearing toward the end of the month during calm, happy moments',
      'Attempts to turn the head toward your voice, showing early sound localization',
      'Brief moments of lifting the head during tummy time, even just a centimeter — this is enormous effort for a newborn',
    ],
  },

  // =========================================================================
  // MONTH 2
  // =========================================================================
  {
    id: 'month-2',
    monthNumber: 2,
    monthLabel: '2 Months',
    ageRange: '1 to 2 Months',
    tagline: 'Discovering the dance of connection',
    brainDevelopment:
      'The second myelination wave continues building pathways in the Cerebellum, Occipital lobe, Parietal lobe, and Wernicke\'s area. Visual processing is sharpening rapidly — your baby can now see further and with greater contrast sensitivity. The foundations for voluntary movement are being laid as the brain\'s motor centers develop.',
    bodyDevelopment:
      'Voluntary head turning develops this month, replacing the earlier reflexive movements. Your baby is beginning the long transition from reflexive to intentional movement. Neck muscles are strengthening from tummy time, and the curled newborn position is gradually relaxing into a more extended posture.',
    grossMotor: {
      shouldBeAbleTo: [
        'Turn head voluntarily toward a stimulus such as a voice or interesting sound',
        'Lift head briefly during tummy time at a 45-degree angle',
        'Move arms and legs with increasing vigor during active alert states',
      ],
      probablyAbleTo: [
        'Hold head up at 45 degrees for several seconds during tummy time',
        'Begin to uncurl from the newborn fetal position',
      ],
      mayEvenBeAbleTo: [
        'Roll in one direction, usually from side to back',
        'Bear some weight on forearms during tummy time',
      ],
    },
    handDevelopment: [
      'The reflexive palmar grasp continues to dominate — your baby grasps objects placed in the palm but cannot release them voluntarily',
      'Batting and swiping attempts begin as your baby starts to connect seeing with reaching',
      'Hands begin to open more frequently, spending less time in tight fists',
    ],
    communication: [
      'Cooing becomes more frequent and varied, with vowel-like sounds such as "oooh" and "aaah"',
      'The "communication dance" with parents begins — your baby coos, you respond, they coo again, creating the first back-and-forth conversations',
      'Smiling becomes social and intentional, not just reflexive — your baby smiles in response to your face and voice',
      'Shows excitement with whole-body movement when a familiar person approaches',
    ],
    socialEmotional: [
      'The social smile emerges — your baby smiles specifically at people, especially familiar caregivers',
      'Begins to differentiate between familiar and unfamiliar faces',
      'Shows clear preference for the primary caregiver\'s voice and face',
      'Calms when picked up or spoken to softly, showing the beginning of emotional co-regulation',
    ],
    activities: [
      {
        name: 'Octahedron Mobile',
        description:
          'Replace the Munari with the Octahedron mobile, featuring three glossy, reflective octahedrons in primary colors (red, yellow, blue). As your baby\'s color vision develops, this mobile provides appropriate visual stimulation and encourages sustained visual tracking.',
        icon: '\u{1F534}',
        category: 'sensory',
      },
      {
        name: 'Face-to-Face Tummy Time',
        description:
          'Lie on the floor face-to-face with your baby during tummy time. Your face is the most fascinating visual stimulus in your baby\'s world. Talk, sing, and make gentle expressions to encourage your baby to lift their head and engage.',
        icon: '\u{1F46B}',
        category: 'motor',
      },
      {
        name: 'Simple Music Box',
        description:
          'Introduce a simple wind-up music box that your baby can watch and listen to. The combination of gentle movement and predictable melody captivates attention and begins building the understanding that objects can produce sounds.',
        icon: '\u{1F3B6}',
        category: 'sensory',
      },
      {
        name: 'Mirror Exploration',
        description:
          'Place your baby on the movement mat next to a low, safely mounted mirror. Babies at this age are fascinated by faces, including their own reflection. The mirror also doubles the visual environment, encouraging head turning and visual exploration.',
        icon: '\u{1FA9E}',
        category: 'cognitive',
      },
      {
        name: 'The Communication Dance',
        description:
          'When your baby coos, pause and wait, then respond with similar sounds or gentle words. Allow silence for your baby to "take a turn." This back-and-forth exchange is the foundation of all human conversation and teaches your baby that communication is a two-way process.',
        icon: '\u{1F4AC}',
        category: 'language',
      },
    ],
    sensoryDevelopment: [
      'Baby can now discern distinct primary colors (red, yellow, blue) and more detail than at birth',
      'Visual focusing and tracking are improving; baby can follow a moving object with more precision',
      'Obligatory Looking phase may begin — baby may fixate on an object and need help moving it from their visual field',
      'Peripheral vision starts being inhibited as the occipital lobe wires up the ability to focus directly',
      'Baby can now voluntarily turn their head toward something of interest, a major sensory milestone',
      'Hearing continues to develop; baby enjoys gentle tones from rattles and music boxes',
    ],
    reflexes: [
      'All primitive reflexes remain present: rooting, sucking, swallowing, grasp, Moro (startle), Galant, Swimming, Babinski',
      'Permanent reflexes continue: eye blink, gag, yawn, cough, sneeze, lip quiver',
      'Reflexive grasping still dominant — baby may hold a rattle briefly through reflex, not intention',
    ],
    touchAndBonding: [
      'Focus on building a healthy bond through skin-to-skin, holding, and feeding during these early weeks',
      'Introduce the Communication Dance: echo baby\'s cooing sounds back and forth in reciprocal conversation',
      'Bath time helps develop body schema — name body parts as you gently towel baby dry with consistent pressure',
      'Consider introducing very gentle baby massage to strengthen bonding and support body awareness',
      'A framed family photograph provides a beautiful conversation focus and helps baby feel a sense of belonging',
    ],
    communicationTips: [
      'When your baby coos, respond enthusiastically but calmly — then wait. Give your baby time to respond back. This turn-taking is the earliest form of conversation',
      'Sing the same songs repeatedly during care routines — repetition helps your baby begin to anticipate and recognize patterns in language',
      'Name what you are doing and what your baby is seeing: "You are looking at the red octahedron. It is spinning slowly." Rich, descriptive language builds the foundation for understanding',
    ],
    independenceGains: [
      'Your baby can now voluntarily turn their head to choose what to look at — this is their first act of independent decision-making',
      'The social smile gives your baby a powerful new tool for engaging the world and influencing the people around them',
      'Longer periods of quiet alertness allow your baby to independently observe and absorb the environment',
    ],
    environmentTips: [
      'Ensure the movement mat area has a safely mounted mirror at floor level so your baby can observe themselves and the room from the floor',
      'Set up a mobile hanger that allows you to easily swap mobiles as your baby\'s visual abilities develop — the Octahedron replaces the Munari this month',
      'Keep a low shelf near the movement area with two or three carefully chosen items, rotating them weekly to maintain interest without overwhelming',
      'Maintain a calm, orderly environment with natural light — avoid bright overhead lights in your baby\'s movement area',
      'Create a comfortable spot nearby where you can sit at floor level during tummy time and play, making yourself accessible without hovering',
    ],
    watchFor: [
      'The first true social smiles directed at you — these are different from the earlier reflexive smiles and will light up your day',
      'Your baby attempting to bat at or swipe toward the mobile, showing the earliest connection between seeing and reaching',
      'Cooing sounds becoming more varied and musical, with different vowel combinations',
      'Increasing head control during tummy time, with longer periods of holding the head up',
    ],
  },

  // =========================================================================
  // MONTH 3
  // =========================================================================
  {
    id: 'month-3',
    monthNumber: 3,
    monthLabel: '3 Months',
    ageRange: '2 to 3 Months',
    tagline: 'Reaching out to grasp the world',
    brainDevelopment:
      'The second myelination wave continues building and strengthening neural pathways. Visual processing has matured significantly — your baby can now track objects smoothly through a full 180-degree arc. The brain regions controlling voluntary hand movement are beginning to take over from the earlier reflexive patterns.',
    bodyDevelopment:
      'Some babies may begin teething this early, though it is more common later. Head control improves dramatically as neck and upper body muscles strengthen. The transition from reflexive to intentional grasping is underway, marking a profound shift in how your baby interacts with objects.',
    grossMotor: {
      shouldBeAbleTo: [
        'Hold head at 90 degrees during tummy time and look around',
        'Track a moving object smoothly through 180 degrees',
        'Hold head steady when held upright in your arms',
      ],
      probablyAbleTo: [
        'Push up on forearms during tummy time, lifting chest off the surface',
        'Bear weight on forearms for extended periods',
      ],
      mayEvenBeAbleTo: [
        'Roll from tummy to back',
        'Reach toward an object while lying on back',
      ],
    },
    handDevelopment: [
      'The transition from reflexive to intentional grasping begins — your baby is starting to reach for objects they see',
      'Batting and swiping at hanging objects becomes more accurate and deliberate',
      'May bring hands together at midline, clasping them — an important milestone showing both sides of the body working together',
      'The palmar grasp reflex is fading, making way for voluntary grasping',
    ],
    communication: [
      'Cooing with clear enjoyment and experimentation — your baby delights in the sounds they can produce',
      'Stares intently at the mouths of people who are speaking, beginning to connect sounds with mouth movements',
      'Realizes that sounds come from people\'s mouths, an important cognitive leap',
      'Laughing may emerge this month, often in response to surprising or delightful interactions',
    ],
    socialEmotional: [
      'Shows clear delight in social interaction with animated facial expressions and whole-body excitement',
      'May become distressed when social interaction stops abruptly (the still-face effect)',
      'Recognizes and responds differently to familiar versus unfamiliar people',
      'Beginning to develop a sense of self as separate from caregivers',
    ],
    activities: [
      {
        name: 'Gobbi Mobile',
        description:
          'Introduce the Gobbi mobile with five spheres in graduated shades of a single color, from light to dark. This mobile refines color discrimination and depth perception as your baby\'s visual system matures. Hang it where your baby can study it during alert, wakeful periods.',
        icon: '\u{1F7E3}',
        category: 'sensory',
      },
      {
        name: 'Ring on Ribbon',
        description:
          'Suspend a lightweight wooden ring on a ribbon from the mobile hanger, positioned so your baby can bat at it and eventually grasp it. This bridges the gap between the visual mobiles and the first grasping toys, supporting the transition from looking to reaching to grasping.',
        icon: '\u{1F48D}',
        category: 'motor',
      },
      {
        name: 'Silver Rattle',
        description:
          'Offer a small, lightweight silver or metal rattle during supervised play. The cool temperature, reflective surface, and gentle sound when shaken provide multi-sensory feedback. Place it near your baby\'s hand and allow them to discover it through their own reaching efforts.',
        icon: '\u{1F514}',
        category: 'sensory',
      },
      {
        name: 'Propping Up to Observe',
        description:
          'Gently prop your baby at a slight incline using a firm cushion or your own body so they can observe household activities. Being part of family life — watching you cook, fold laundry, or talk — is rich learning that feeds the absorbent mind.',
        icon: '\u{1F440}',
        category: 'cognitive',
      },
      {
        name: 'Art Postcards',
        description:
          'Place two or three high-quality art postcards near the movement area at your baby\'s eye level. Choose images with clear subjects and good contrast. Rotate them every week or two. Your baby is absorbing beauty and form, and this early exposure to art enriches their visual culture.',
        icon: '\u{1F5BC}\uFE0F',
        category: 'sensory',
      },
    ],
    sensoryDevelopment: [
      'Baby can now discern color on a chromatic scale — for example, five tones of a single color',
      'Vision acuity (ability to see detail) continues to develop rapidly',
      'Between 3-6 months, eyes can focus slightly ahead of a moving object, anticipating its path',
      'Hearing becomes fully developed around month 3; baby can now perceive higher-pitched sounds',
      'Touch supported through mouthing (oral exploration), being gently held, and developing hand grasping',
    ],
    reflexes: [
      'Many primitive reflexes still present: Galant, Swimming, Moro (startle), Babinski',
      'Rooting reflex is diminishing by 3-4 months',
      'Sucking and swallowing transition from reflexive to voluntary around 3-4 months',
      'Palmar grasp reflex disappears, replaced by intentional (voluntary) grasping',
      'Permanent reflexes continue: eye blink, gag, yawn, cough, sneeze, lip quiver',
    ],
    touchAndBonding: [
      'Mouthing is an important form of touch exploration — allow safe oral exploration of toys',
      'Make good use of everyday care moments (feeding, bathing, playing) to integrate gentle touch',
      'Baby massage supports bonding, body schema development, and has physical and emotional benefits',
      'Encourage tummy time by lying on your stomach beside baby on the movement mat — your closeness helps them feel safe',
    ],
    communicationTips: [
      'When your baby coos or vocalizes, mirror their sounds back and then add a word or short phrase — "Ooooh! Yes, you see the mobile!" This validates their communication and models language',
      'Read short board books with simple, realistic images, pointing to each picture and naming it clearly. Even at this age, your baby absorbs the rhythm and melody of language',
      'Pause and wait after speaking to your baby — give them three to five seconds of silence to process and attempt a response. Patience is the gift that builds communicators',
    ],
    independenceGains: [
      'Your baby can choose what to look at by turning their head with control and purpose',
      'The beginning of intentional reaching means your baby is starting to act on their environment rather than just passively receiving it',
      'Longer periods of self-directed floor play emerge as your baby entertains themselves by studying mobiles and batting at objects',
    ],
    environmentTips: [
      'Introduce art postcards at eye level near the movement mat — choose realistic images with good contrast and rotate them every one to two weeks',
      'Add the Gobbi mobile to your rotation and consider having the Ring on Ribbon available for reaching practice',
      'Provide a variety of safe, simple sensory objects on the low shelf: a small rattle, a wooden ring, a soft fabric square with different textures',
      'Ensure the movement area has enough open floor space for your baby to stretch, roll, and move freely without bumping into furniture',
      'If your baby is spending time propped up to observe, create a safe, supportive seating arrangement that does not restrict movement',
    ],
    watchFor: [
      'The first intentional reach toward an object — this is a landmark moment when your baby begins to act upon the world',
      'Hands coming together at midline, clasping or studying their own fingers — self-discovery through the hands',
      'Laughter emerging, often during playful interactions or surprising events',
      'Your baby staring intently at your mouth when you speak, making the connection between sound and movement',
    ],
  },

  // =========================================================================
  // MONTH 4
  // =========================================================================
  {
    id: 'month-4',
    monthNumber: 4,
    monthLabel: '4 Months',
    ageRange: '3 to 4 Months',
    tagline: 'The hands awaken — reaching with purpose',
    brainDevelopment:
      'The second myelination wave continues its steady progress. Myelination is now traveling to the hands and upper trunk, enabling increasingly precise voluntary movements. The visual and motor systems are beginning to work together more efficiently, allowing your baby to see something and reach for it with improving accuracy.',
    bodyDevelopment:
      'Myelination reaching the hands and upper trunk is a major milestone this month. Your baby\'s upper body strength increases notably, and the transition from reflexive to voluntary hand use accelerates. The foundation for sitting is being built through increased trunk stability.',
    grossMotor: {
      shouldBeAbleTo: [
        'Raise chest off the surface with extended arms during tummy time (mini push-up)',
        'Hold head steady and upright when held in a sitting position',
        'Bear weight on arms during tummy time with good control',
      ],
      probablyAbleTo: [
        'Roll from tummy to back with increasing ease',
        'Reach for and grasp a nearby object while lying on back',
      ],
      mayEvenBeAbleTo: [
        'Sit with support, propped by hands or cushions',
        'Roll from back to tummy',
      ],
    },
    handDevelopment: [
      'Intentional reaching and grasping emerge — your baby deliberately reaches for objects they want',
      'Batting becomes more directed and purposeful, no longer random swiping',
      'Brings hands together at midline and may study them with fascination',
      'Can hold a lightweight object placed in the hand for increasing durations',
    ],
    communication: [
      'May start making clicking noises with the tongue, experimenting with new sounds',
      'Squealing with delight, testing the range and volume of the voice',
      'Marginal babbling begins — elongated single syllables such as "baaa" and "maaa" appear',
      'Responds to their own name by turning toward the speaker',
    ],
    socialEmotional: [
      'Initiates social interaction by smiling, cooing, or squealing at people',
      'Shows frustration when a desired toy is out of reach — an early expression of will and desire',
      'Enjoys games of gentle surprise and anticipation, such as peek-a-boo',
      'May show preference for certain toys or activities for the first time',
    ],
    activities: [
      {
        name: 'Ring on Ribbon Grasping',
        description:
          'Position the Ring on Ribbon so your baby must reach to grasp it. Allow them to pull, mouth, and explore it freely. This supports the critical transition from batting to intentional grasping and builds hand-eye coordination.',
        icon: '\u{1F48D}',
        category: 'motor',
      },
      {
        name: 'Bell and Ribbon',
        description:
          'Attach a small bell to a ribbon and hang it where your baby can reach it. The auditory feedback from the bell rewards each reaching attempt and helps your baby understand cause and effect — "When I move my hand, the bell rings."',
        icon: '\u{1F514}',
        category: 'cognitive',
      },
      {
        name: 'Kicking Ball',
        description:
          'Place a lightweight ball or balloon (safely contained) near your baby\'s feet during mat time. As your baby kicks and makes contact, they experience the joy of cause and effect through their legs while strengthening lower body muscles.',
        icon: '\u{26BD}',
        category: 'motor',
      },
      {
        name: 'Basket of Home Objects',
        description:
          'Gather a small basket of safe, interesting household objects — a wooden spoon, a small whisk, a metal measuring cup, a fabric napkin. Offer one at a time for your baby to explore with hands and mouth. Real objects are far more interesting than plastic toys.',
        icon: '\u{1F9FA}',
        category: 'sensory',
      },
      {
        name: 'Narrated Exploration',
        description:
          'As your baby grasps and mouths objects, narrate what they are experiencing: "You are holding the wooden spoon. It is smooth and hard. Now you are tasting it." This pairs sensory experience with language, building neural connections between touch and words.',
        icon: '\u{1F4D6}',
        category: 'language',
      },
    ],
    sensoryDevelopment: [
      'Baby develops binocular vision this month, enabling 3D depth perception and dramatically improved detail',
      'Baby can now focus slightly ahead of a moving object, anticipating its movement path',
      'Hearing is fully developed; offer a variety of rattles with different sounds for auditory stimulation',
      'Baby desires to explore every aspect of objects through sight, touch, taste, and hearing simultaneously',
      'Baby realizes sounds come from your mouth and will focus intently on your face while you speak',
    ],
    reflexes: [
      'Rooting reflex has diminished',
      'Sucking and swallowing have become voluntary (no longer reflexive)',
      'Palmar grasp has disappeared, replaced by voluntary grasping',
      'Swimming reflex disappears between 4-6 months',
      'Asymmetrical Tonic Neck (fencing) reflex disappears between 4-6 months',
      'Moro (startle), Galant, and Babinski reflexes still present',
      'Permanent reflexes continue: eye blink, gag, yawn, cough, sneeze, lip quiver',
    ],
    touchAndBonding: [
      'Baby finds greatest comfort from being fed, cradled, cuddled, held on your lap, carried, bathed, and massaged',
      'Gentle touch continues to strengthen early bonding — it reaffirms that you and baby need each other',
      'Spontaneous playful interactions build mutual delight and emotional connection',
      'Use gentle touch during diaper changes, bath time, and playful interactions',
      'Balance social outings with quiet home time; rushing or interrupting routines causes baby distress',
    ],
    communicationTips: [
      'Celebrate your baby\'s new sounds by imitating them back — when they squeal, squeal gently in return. When they babble "baaa," say "baaa" and then expand: "baaa — ball! You see the ball"',
      'Use your baby\'s name frequently and naturally throughout the day so they begin to recognize it as belonging to them',
      'During care routines, describe textures, temperatures, and sensations: "This water is warm on your tummy. The towel is soft and dry." Sensory vocabulary builds rich neural connections',
    ],
    independenceGains: [
      'Intentional grasping means your baby can now choose to hold an object and bring it to their mouth for exploration — a major leap in self-directed learning',
      'Increased head and upper body control allows your baby to look around the room and choose what captures their attention',
      'Your baby may begin to entertain themselves for longer stretches on the movement mat, exploring objects and their own body',
    ],
    environmentTips: [
      'Ensure all objects within reaching distance are safe for mouthing — your baby will explore everything orally, which is an essential part of sensory development',
      'Offer a small variety of grasping objects on the low shelf, choosing items with different textures, weights, and temperatures (wood, metal, fabric, rubber)',
      'Create a safe floor space where your baby can practice reaching and rolling without restriction — avoid keeping them in bouncers or seats for extended periods',
      'Consider placing a basket of two to three objects near the movement mat that you rotate daily to maintain novelty and interest',
    ],
    watchFor: [
      'The first time your baby deliberately reaches for and grasps an object — this is a profound moment of intentional action',
      'Marginal babbling sounds appearing, especially "baaa" and "maaa" — these are the building blocks of speech',
      'Your baby bringing both hands together at midline to hold and explore an object — this bilateral coordination is a key milestone',
      'Mini push-ups during tummy time with arms fully extended, showing growing upper body strength',
    ],
  },

  // =========================================================================
  // MONTH 5
  // =========================================================================
  {
    id: 'month-5',
    monthNumber: 5,
    monthLabel: '5 Months',
    ageRange: '4 to 5 Months',
    tagline: 'A new wave of growth — the world of sound opens up',
    brainDevelopment:
      'The third myelination wave begins this month, activating the Temporal lobe — the region responsible for hearing, language processing, and memory formation. This is a pivotal moment in brain development. Your baby\'s capacity to process and remember sounds, words, and voices is dramatically expanding. Simultaneously, myelination is reaching the lower trunk, supporting the core strength needed for sitting.',
    bodyDevelopment:
      'Teething may begin, with the first teeth typically appearing in the lower front. Myelination reaching the lower trunk enables greater core stability, and your baby may begin sitting with support. The palmar grasp matures, allowing your baby to hold objects with increasing control, though the thumb is not yet actively participating.',
    grossMotor: {
      shouldBeAbleTo: [
        'Sit supported in a propped position with minimal assistance',
        'Roll over in at least one direction with confidence',
        'Bear weight on extended arms during tummy time',
      ],
      probablyAbleTo: [
        'Roll from back to tummy and tummy to back',
        'Reach for objects while maintaining balance on tummy',
      ],
      mayEvenBeAbleTo: [
        'Slither or slide on stomach in an army-crawl motion',
        'Sit unsupported for a brief moment before tipping',
      ],
    },
    handDevelopment: [
      'The palmar grasp matures — your baby grabs objects with the whole hand but the thumb is not yet actively participating',
      'Transfers objects from one hand to the other, a major milestone showing the two brain hemispheres working together',
      'Crosses the midline of the body to reach for objects on the opposite side',
      'Can hold two objects at the same time, one in each hand',
    ],
    communication: [
      'Marginal babbling becomes more frequent, with elongated vowel and consonant combinations',
      'Consonant sounds b, d, m, and n appear as the mouth muscles develop the coordination for speech',
      'Guttural sounds from the back of the throat add variety to the vocal repertoire',
      'May begin canonical babbling — repeating syllable strings like "babababa" — especially near the end of the month',
    ],
    socialEmotional: [
      'Shows increasing awareness of strangers versus familiar people',
      'Laughs freely and frequently during playful interactions',
      'Expresses clear preferences for certain people, toys, and activities',
      'May show early signs of separation awareness when a parent leaves the room',
    ],
    activities: [
      {
        name: 'Varied Sensory Toys for Grasping',
        description:
          'Offer objects that match your baby\'s developing palmar grasp — rattles with wide handles, wooden rings, fabric balls, and textured teethers. Each object teaches the hand something different about shape, weight, texture, and sound.',
        icon: '\u{270B}',
        category: 'motor',
      },
      {
        name: 'Movement on the Mat',
        description:
          'Place interesting objects just out of reach during floor time to encourage your baby to stretch, roll, and slither toward them. This motivated movement builds core strength and begins the journey toward crawling. Never move the object closer — let your baby solve the problem.',
        icon: '\u{1F3C3}',
        category: 'motor',
      },
      {
        name: 'Sound Exploration',
        description:
          'With the third myelination wave activating the auditory cortex, now is the ideal time for rich sound exploration. Offer rattles with different tones, crinkly fabrics, and small percussion instruments. Name each sound as your baby discovers it.',
        icon: '\u{1F3B5}',
        category: 'sensory',
      },
      {
        name: 'Reading Together',
        description:
          'Read short board books with clear, realistic photographs of familiar objects. Point to each image and name it. Your baby\'s newly myelinating temporal lobe is primed to absorb language, and this repeated exposure to words paired with images builds vocabulary from the inside out.',
        icon: '\u{1F4DA}',
        category: 'language',
      },
      {
        name: 'Weaning Preparation Observation',
        description:
          'If your baby shows signs of readiness — sitting with support, watching you eat with intense interest, reaching for food — begin letting them observe family meals up close. Offer a small spoon to hold and explore. The introduction of solid foods is approaching.',
        icon: '\u{1F37D}\uFE0F',
        category: 'practical_life',
      },
    ],
    sensoryDevelopment: [
      'Third wave of brain myelination begins around month 5-6, igniting the Temporal lobe for hearing, language, and memory',
      'Neurological pathways around the Wernicke\'s area (speech comprehension) become intensely active',
      'Baby\'s ability to recognize foreign speech sounds begins to wane; increased sensitivity to native language',
      'Vision and hand coordination are combining — baby desires to reach and grasp everything visible',
      'All senses are working together to build concepts of objects through exploration',
    ],
    reflexes: [
      'Swimming reflex disappears between 4-6 months',
      'Asymmetrical Tonic Neck (fencing) reflex disappears between 4-6 months',
      'Moro (startle) and Babinski reflexes still present',
      'Permanent reflexes continue: eye blink, gag, yawn, cough, sneeze, lip quiver',
    ],
    touchAndBonding: [
      'Baby shows keen interest and responsiveness to your emotions and expressions from about 5 months onward',
      'Support weaning preparation — baby may show signs indicating readiness for solid food introduction',
      'Provide a variety of toys with different textures, temperatures, and materials for rich tactile exploration',
      'Baby may need a gently delivered "no" for safety — pair the word with a head shake and redirect to appropriate activity',
    ],
    communicationTips: [
      'The third myelination wave makes this a critical period for language exposure — immerse your baby in rich, varied language throughout the day. Narrate, sing, read, and name everything',
      'When your baby babbles, treat it as real communication. Respond with genuine interest: "Oh, babababa! You have so much to tell me!" This encourages more vocalization',
      'Introduce environmental sounds and name them: "Do you hear the birds? Tweet tweet. That is a bird singing outside." Connecting sounds to words builds auditory processing',
    ],
    independenceGains: [
      'Transferring objects between hands allows your baby to choose how to explore — they can switch an object from one hand to examine it from a new angle',
      'Rolling in both directions gives your baby genuine mobility and the ability to change their own position and perspective',
      'If weaning readiness signs appear, your baby is signaling their readiness for a new level of self-feeding independence',
    ],
    environmentTips: [
      'Begin preparing for weaning if your baby shows readiness signs — set up a small weaning table and chair where your baby can sit for early food exploration',
      'Provide a wider variety of grasping objects to match the maturing palmar grasp — include different textures, weights, and shapes',
      'Create safe spaces for rolling and the early stages of mobile movement — clear the floor area of small objects and ensure furniture is stable',
      'Introduce a small basket of board books near the movement area for you to read together during quiet times',
      'Place a few interesting objects slightly out of reach to motivate stretching and rolling — frustration in small, manageable doses builds problem-solving',
    ],
    watchFor: [
      'Objects being transferred from hand to hand — this crossing of the midline is a significant neurological milestone',
      'New consonant sounds appearing in babbling, especially b, d, m, and n — the building blocks of first words',
      'Signs of weaning readiness: intense interest in food, sitting with support, reaching for what you are eating, loss of the tongue-thrust reflex',
      'Early slithering or army-crawl movements during floor time, showing the drive toward independent mobility',
    ],
  },

  // =========================================================================
  // MONTH 6
  // =========================================================================
  {
    id: 'month-6',
    monthNumber: 6,
    monthLabel: '6 Months',
    ageRange: '5 to 6 Months',
    tagline: 'Sitting tall, babbling strong — a whole new perspective',
    brainDevelopment:
      'The third myelination wave intensifies in the Temporal lobe and Wernicke\'s area (language comprehension). Your baby\'s ability to process, store, and begin to understand language is expanding rapidly. Research suggests that around this age, babies begin losing the ability to distinguish phonemes from languages they are not regularly hearing — the brain is specializing for the language of the home environment.',
    bodyDevelopment:
      'Teething may be actively underway, with lower central incisors often appearing. Myelination has reached the lower trunk and is progressing toward the legs. Core muscles are strong enough for independent sitting, which opens up an entirely new perspective on the world. The hands are progressing from a full palmar grasp toward a radial palmar grasp, where the thumb begins to participate.',
    grossMotor: {
      shouldBeAbleTo: [
        'Sit without support for extended periods, using hands for balance when needed',
        'Roll confidently in both directions, tummy to back and back to tummy',
        'Bear weight on legs when held in a standing position',
      ],
      probablyAbleTo: [
        'Pivot in a circle while on the stomach to track objects or people',
        'Get into a sitting position from lying down with minimal assistance',
      ],
      mayEvenBeAbleTo: [
        'Begin rocking on hands and knees in a pre-crawling position',
        'Lunge forward from sitting to reach a distant object',
      ],
    },
    handDevelopment: [
      'The palmar grasp transitions to a radial palmar grasp — the thumb begins actively participating in holding objects',
      'Transfers objects between hands with smooth, purposeful movements',
      'Can rake small objects toward themselves using the whole hand',
      'May begin to bang objects on surfaces and together, exploring cause and effect through the hands',
    ],
    communication: [
      'Babbling transitions from marginal to canonical — repeated syllable strings like "mamamama" and "bababab" emerge',
      'The ability to distinguish foreign speech sounds may begin to wane as the brain specializes for the home language',
      'Responds to their name consistently by turning and looking',
      'Shows understanding of emotional tone — responds differently to happy, sad, or stern voices',
    ],
    socialEmotional: [
      'Stranger awareness may begin, with wariness around unfamiliar people',
      'Shows clear attachment to primary caregivers and may protest separation',
      'Enjoys interactive games and laughs heartily during play',
      'Begins to understand and respond to simple social gestures like outstretched arms for "pick me up"',
    ],
    activities: [
      {
        name: 'Rainbow Ball',
        description:
          'Offer a soft, easy-to-grasp ball with varied colors and textures. Now that your baby can sit independently, ball play becomes possible in a new way. Roll it gently toward them and encourage them to reach for and grasp it. This builds hand-eye coordination and introduces the concept of back-and-forth exchange.',
        icon: '\u{1F308}',
        category: 'motor',
      },
      {
        name: 'Basket of Varied Balls',
        description:
          'Fill a small basket with three to five balls of different sizes, textures, and weights — a knobby rubber ball, a smooth wooden ball, a soft fabric ball, a small tennis ball. Let your baby explore each one, discovering how different objects behave differently.',
        icon: '\u{1F3C0}',
        category: 'sensory',
      },
      {
        name: 'Spinning Top',
        description:
          'Demonstrate a simple press-and-spin top on a flat surface in front of your baby. The visual spectacle of the spinning, combined with the cause-and-effect of pressing, captivates attention. Your baby may not yet operate it independently, but watching builds the desire to try.',
        icon: '\u{1FA80}',
        category: 'cognitive',
      },
      {
        name: 'Cylinder with Balls',
        description:
          'Offer a clear cylinder or tube with openings at both ends and soft balls that fit through. Your baby can push a ball in one end and watch it emerge from the other. This introduces object permanence concepts and cause-and-effect thinking.',
        icon: '\u{1F3AF}',
        category: 'cognitive',
      },
      {
        name: 'First Foods Exploration',
        description:
          'If weaning has begun, offer single foods one at a time in small, manageable pieces on a low tray or table. Allow your baby to touch, squish, smell, and taste at their own pace. This is sensory exploration as much as nutrition — resist the urge to spoon-feed everything.',
        icon: '\u{1F34C}',
        category: 'practical_life',
      },
    ],
    sensoryDevelopment: [
      'All senses are now active and continue to be refined through exploration of toys with varied properties',
      'Hand-eye coordination developing as grasping becomes intentional — baby can transfer objects between hands',
      'Baby can cross the body midline when reaching for objects, an important coordination milestone',
      'Color vision, depth perception, detail acuity, and visual tracking all continue developing',
      'By month 6, sensitivity to native language speech sounds increases while foreign sound recognition diminishes',
    ],
    reflexes: [
      'Galant, Swimming, and Moro (startle) reflexes disappear by 6 months',
      'Symmetrical Tonic Neck (crawling) reflex reappears around 6-9 months to support crawling development',
      'Parachute reflex will appear before the onset of walking',
      'Babinski reflex still present',
      'Permanent reflexes continue: eye blink, gag, yawn, cough, sneeze, lip quiver',
    ],
    touchAndBonding: [
      'Weaning and introduction of solid foods begins — represents a second separation (first was birth) that builds independence',
      'Prepare yourself emotionally for weaning; baby creates a new relationship with food and seated mealtimes',
      'Separation anxiety or stranger fear is a normal emotional milestone around 6 months — provide comfort when needed',
      'Avoid giving baby access to screens — prioritize real-life sensory exploration and human interaction',
      'Baby\'s strong bond with you enables confident exploration; respond warmly when they return seeking security',
    ],
    communicationTips: [
      'Repeat your baby\'s canonical babbling back to them and then pair it with meaning: "Mamama — yes, Mama is here! Mama loves you." This begins to bridge babbling sounds with real words',
      'Name objects as your baby reaches for and grasps them. The combination of touch, sight, and hearing a word creates powerful multi-sensory learning connections',
      'Sing simple songs with hand motions, like pat-a-cake or itsy-bitsy spider. The combination of rhythm, words, and movement reinforces language processing in the newly myelinating temporal lobe',
    ],
    independenceGains: [
      'Independent sitting transforms your baby\'s world — both hands are free for exploration, and the visual perspective shifts from horizontal to vertical for the first time',
      'Your baby can now select toys from a low shelf independently if items are placed at their seated eye level',
      'If weaning has begun, your baby is beginning the lifelong journey of feeding themselves, an act of profound independence',
    ],
    environmentTips: [
      'Arrange the low shelf so your baby can see and reach materials from a seated position — place two to three carefully chosen items at their eye level',
      'Introduce a small coffee table, sturdy ottoman, or push-up bar at chest height for your baby to practice pulling up to standing when they are ready',
      'If weaning, set up a dedicated eating area with a small table and supportive chair at the right height for your baby to sit with feet flat',
      'Ensure the floor area is clear and safe for the increasing mobility that is coming — your baby may begin rocking on hands and knees at any time',
      'Provide a variety of balls and objects that roll, bounce, and move in different ways to encourage reaching and the beginnings of crawling motivation',
    ],
    watchFor: [
      'Canonical babbling with clear repeated syllables — "mamama," "bababa," "dadada" — these are the direct precursors to first words',
      'The thumb beginning to participate in grasping, moving from a full palmar grip to a radial palmar grip',
      'Rocking on hands and knees, which signals that crawling is approaching',
      'Your baby independently selecting an object from the shelf and bringing it back to explore — early evidence of choice and concentration',
    ],
  },

  // =========================================================================
  // MONTH 7
  // =========================================================================
  {
    id: 'month-7',
    monthNumber: 7,
    monthLabel: '7 Months',
    ageRange: '6 to 7 Months',
    tagline: 'Exploring with purpose — every object tells a story',
    brainDevelopment:
      'The third myelination wave continues its intensive work in the Temporal lobe. Language comprehension pathways are strengthening, and your baby is building an increasingly sophisticated internal map of the sounds, rhythms, and patterns of your language. Memory formation is accelerating, allowing your baby to anticipate familiar routines and recognize regular sequences.',
    bodyDevelopment:
      'Teething continues with potential eruption of additional incisors. Myelination is progressing toward the legs, supporting the developing ability to bear weight and prepare for standing. Sitting is now stable and confident, freeing both hands for extended exploration. The torso muscles continue to strengthen, supporting more complex movements.',
    grossMotor: {
      shouldBeAbleTo: [
        'Sit independently with good balance, rarely tipping over',
        'Roll both ways with ease and use rolling as a form of transportation',
        'Support full body weight when held in a standing position',
      ],
      probablyAbleTo: [
        'Slither or slide on stomach to move toward desired objects',
        'Get into and out of sitting position with some effort',
      ],
      mayEvenBeAbleTo: [
        'Begin rocking on hands and knees, preparing for crawling',
        'Pull up to a kneeling position using furniture',
      ],
    },
    handDevelopment: [
      'Continued progression of the grasp from radial palmar toward more refined patterns',
      'Raking small objects toward themselves with the fingers becomes more precise',
      'Squeezing objects deliberately to test what happens — a ball squeaks, a sponge compresses',
      'Controlled reaching with one hand while the other stabilizes the body during sitting',
    ],
    communication: [
      'Consonant repertoire expands to include b, d, m, n plus w and j sounds',
      'Canonical babbling becomes the dominant vocal activity, with long strings of varied syllables',
      'May begin using gestures — reaching arms up to be lifted, pushing away unwanted food',
      'Responds to simple words in context, such as looking at the dog when you say "Where is the dog?"',
    ],
    socialEmotional: [
      'Stranger anxiety may intensify — this is a healthy sign of secure attachment, not something to worry about',
      'Shows clear preferences for specific caregivers and may cling during transitions',
      'Enjoys social games with predictable patterns, like peek-a-boo and "Where did it go?"',
      'Begins to look to caregivers for emotional cues about unfamiliar situations (social referencing)',
    ],
    activities: [
      {
        name: 'Treasure Baskets',
        description:
          'Fill a low, open basket with five to eight interesting objects from around the home — a wooden egg, a small metal whisk, a pine cone, a silk scarf, a large shell, a rubber ball. Let your baby sit beside the basket and explore each object at their own pace. This is heuristic play at its finest.',
        icon: '\u{1F9FA}',
        category: 'sensory',
      },
      {
        name: 'Hand-Eye Coordination Toys',
        description:
          'Offer toys that require reaching, grasping, and manipulating — stacking rings on a post (just the placing, not the ordering), a simple shape with a handle to turn, or a textured ball to squeeze. Each interaction refines the connection between what the eyes see and what the hands do.',
        icon: '\u{1F441}\uFE0F',
        category: 'motor',
      },
      {
        name: 'Music and Movement',
        description:
          'Play varied styles of music and gently move with your baby — bouncing, swaying, clapping their hands together. Offer simple percussion instruments like a maraca or small drum. Music engages the temporal lobe that is actively myelinating and builds rhythmic awareness.',
        icon: '\u{1F941}',
        category: 'sensory',
      },
      {
        name: 'Cause and Effect Exploration',
        description:
          'Provide objects that respond when acted upon: a ball that rolls when pushed, a toy that makes a sound when squeezed, a lid that pops off a container. Your baby is building the foundational understanding that their actions have consequences in the world.',
        icon: '\u{1F4A1}',
        category: 'cognitive',
      },
      {
        name: 'Naming Games',
        description:
          'Point to familiar objects and people throughout the day and name them clearly: "That is the lamp. Lamp." "Here comes Papa. Papa!" Repeat frequently and consistently. Your baby is building a receptive vocabulary even though they cannot yet speak the words.',
        icon: '\u{1F4AC}',
        category: 'language',
      },
    ],
    sensoryDevelopment: [
      'Temporal lobe myelination continues — supporting hearing, language production, memory, and sensory input organization',
      'Toys with varied shapes, colors, textures, and temperatures provide rich sensory experiences',
      'Hand-eye coordination needs active support through toys that offer slight challenges',
      'Equilibrium and spatial sense are developing through diverse movement patterns',
      'Baby builds understanding of objects by linking sensory exploration with language you provide',
    ],
    reflexes: [
      'Symmetrical Tonic Neck (crawling) reflex reappears around 6-9 months',
      'Parachute reflex appears before onset of walking',
      'Permanent reflexes continue: eye blink, gag, yawn, cough, sneeze, lip quiver',
    ],
    touchAndBonding: [
      'Baby may start to use gestures like pointing to communicate — respond with naming and conversation',
      'Stranger Anxiety may emerge; a secure relationship with you helps baby trust their world',
      'Object Permanence begins developing — baby feels real loss when you disappear from sight',
      'Provide physical comfort or closeness when needed, and maintain order and routines to build security',
      'Be an available adult, especially when baby signals a need for help or closeness',
    ],
    communicationTips: [
      'When your baby gestures — reaching up, pushing away, pointing — put words to the gesture: "You want up! You are reaching your arms up because you want me to pick you up." This bridges gesture and language',
      'Play simple "where is it?" games: hold up a familiar object, name it, then hide it under a cloth. "Where did the ball go? There it is!" This builds both vocabulary and object permanence understanding',
      'Respond to babbling as if it were conversation. When your baby says "badadada," respond: "Really? Tell me more!" Pause and let them continue. This teaches conversational turn-taking',
    ],
    independenceGains: [
      'Stable sitting frees both hands for sustained exploration, allowing your baby to manipulate and study objects for longer periods',
      'Early mobility through slithering or sliding gives your baby the ability to move toward what interests them',
      'Your baby can participate more actively in feeding, holding food and bringing it to their mouth with increasing skill',
    ],
    environmentTips: [
      'Create safe spaces for increasing mobility — as your baby begins moving across the floor, ensure the entire accessible area is baby-proofed',
      'Provide treasure baskets in different locations around the home for exploration during different times of day',
      'Arrange furniture to create natural supports for pulling up — sturdy coffee tables, low shelves, and ottomans at the right height',
      'Ensure that toys on the shelf are rotated regularly to maintain engagement — three to four items at a time is ideal',
      'Keep a small selection of books accessible at sitting height so your baby can reach for and explore them independently',
    ],
    watchFor: [
      'First gestures appearing — reaching up to be held, waving arms with excitement, pushing food away — these are early intentional communication',
      'Rocking on hands and knees, which is the immediate precursor to crawling',
      'Your baby looking where you point, showing understanding of this fundamental social gesture',
      'Extended concentration on a single object from the treasure basket — sometimes several minutes of focused exploration',
    ],
  },

  // =========================================================================
  // MONTH 8
  // =========================================================================
  {
    id: 'month-8',
    monthNumber: 8,
    monthLabel: '8 Months',
    ageRange: '7 to 8 Months',
    tagline: 'On the move — the world expands dramatically',
    brainDevelopment:
      'The third myelination wave continues building the temporal lobe\'s capacity for language and memory. Neural pathways for understanding cause and effect are strengthening. Your baby\'s brain is also developing the spatial awareness needed for navigation as mobility increases — understanding distance, obstacles, and how to move the body through space.',
    bodyDevelopment:
      'Teething continues with potential new teeth emerging. Myelination has reached the thighs, supporting the leg movements needed for crawling, pulling up, and eventually walking. Core strength is now robust enough for dynamic sitting — your baby can lean, twist, and reach without losing balance.',
    grossMotor: {
      shouldBeAbleTo: [
        'Sit independently with excellent balance, even while reaching and twisting',
        'Get into and out of sitting position independently',
        'Bear full weight on legs when held in standing position with good stability',
      ],
      probablyAbleTo: [
        'Crawl forward on hands and knees or scoot on bottom',
        'Pull up to a kneeling or standing position using furniture',
      ],
      mayEvenBeAbleTo: [
        'Cruise along furniture while holding on with both hands',
        'Stand holding on with only one hand, freeing the other to explore',
      ],
    },
    handDevelopment: [
      'The raking grasp refines — your baby can pick up smaller objects by raking them into the palm',
      'Radial digital grasp is developing — the thumb and first two fingers work together to hold objects',
      'Can deliberately drop objects and watch where they fall, showing intentional release is emerging',
      'Uses both hands cooperatively, such as holding a container with one hand while reaching inside with the other',
    ],
    communication: [
      'Canonical babbling with varied consonant-vowel combinations: "bababa," "dadada," "mamama"',
      'Gestures are developing — pointing, waving, shaking head',
      '"Dada" and "mama" sounds appear, though they may not yet be used with specific meaning',
      'Understands an increasing number of words in context and responds to simple requests like "wave bye-bye"',
    ],
    socialEmotional: [
      'Separation anxiety may peak this month — your baby protests loudly when you leave and shows clear joy at your return',
      'Shows wariness with strangers but may warm up if given time and space to observe',
      'Engages in simple social games and may initiate peek-a-boo or clapping games',
      'References familiar caregivers before engaging with something new or uncertain (social referencing)',
    ],
    activities: [
      {
        name: 'Object Permanence Box (Ball and Box)',
        description:
          'Offer a simple box with a hole in the top and an opening on the side. Your baby pushes a ball through the top hole and watches it roll out the side. This concrete, repeatable experience builds the understanding that objects continue to exist even when out of sight.',
        icon: '\u{1F4E6}',
        category: 'cognitive',
      },
      {
        name: 'Dropping Game',
        description:
          'Your baby is discovering the joy of intentionally releasing objects. Provide a container and small objects (large enough to be safe) to drop in. Sit together and take turns dropping items in — clunk! This satisfies the developmental need to practice voluntary release.',
        icon: '\u{1F3AF}',
        category: 'motor',
      },
      {
        name: 'Crawling Obstacle Course',
        description:
          'If your baby is crawling, create simple, safe obstacles using firm cushions and pillows to crawl over, through, and around. This builds spatial awareness, problem-solving, and physical confidence in their newly mobile body.',
        icon: '\u{1F3D4}\uFE0F',
        category: 'motor',
      },
      {
        name: 'Simple Songs with Gestures',
        description:
          'Sing songs that incorporate hand gestures — clapping, waving, touching body parts. "Head, shoulders, knees, and toes" and "If you\'re happy and you know it" pair language with movement, reinforcing both communication and body awareness.',
        icon: '\u{1F3A4}',
        category: 'language',
      },
      {
        name: 'Container Play',
        description:
          'Provide containers of various sizes with lids that pop on and off, as well as nesting containers. Putting things in, taking things out, stacking, and nesting — these simple actions build spatial reasoning, fine motor control, and concentration.',
        icon: '\u{1F4E5}',
        category: 'cognitive',
      },
    ],
    sensoryDevelopment: [
      'All senses are active and fully functioning; continue providing toys with broad sensorial variety',
      'Mealtime finger foods offer valuable observation of how baby picks up small items',
      'Toys with finer properties and smaller circumferences support thumb involvement in grasping',
      'Sound encourages engagement — musical instruments and toys build hand and wrist strength',
      'Visual tracking and spatial awareness develop through movement and toy interaction',
    ],
    reflexes: [
      'Symmetrical Tonic Neck (crawling) reflex is present (reappeared at 6-9 months)',
      'Parachute reflex appears before onset of walking',
      'Permanent reflexes continue: eye blink, gag, yawn, cough, sneeze, lip quiver',
    ],
    touchAndBonding: [
      'Object Permanence is establishing — baby experiences genuine anxiety when you or a toy disappears',
      'Play Peek-a-Boo around corners and furniture to help baby understand you still exist when out of sight',
      'Sing familiar songs as you move around the home so baby hears you and feels secure',
      'When baby lifts arms asking to be picked up, honor this request for closeness and security',
      'Snuggle and read a quality book together at calm, alert moments — this builds security and language',
    ],
    communicationTips: [
      'Name objects your baby points at immediately and enthusiastically — "Ball! You see the ball! It is a red ball." Responding to pointing reinforces this critical communicative gesture',
      'Use simple, consistent phrases during daily routines: "Time to eat," "Let us change your diaper," "All done!" Predictable language paired with predictable routines builds comprehension',
      'Read the same favorite books repeatedly. Repetition is not boring to your baby — it is building mastery. Watch how they begin to anticipate pages, sounds, and words',
    ],
    independenceGains: [
      'Crawling gives your baby genuine independence of movement — they can now go where they want, when they want, following their own interests',
      'Pulling up to standing opens a new visual world and gives your baby the power to change their own perspective dramatically',
      'The ability to intentionally release objects means your baby can choose to let go, put down, and drop — expanding their repertoire of purposeful actions',
    ],
    environmentTips: [
      'Baby-proof thoroughly for a crawling baby — cover outlets, secure furniture to walls, remove small objects from the floor, and gate stairs',
      'Arrange furniture to create natural pathways for pulling up and early cruising — sturdy items spaced closely enough to provide continuous support',
      'Place the object permanence box and dropping game on the low shelf for independent selection',
      'Create a safe crawling path between rooms so your baby can practice their new mobility with purpose — perhaps from the living area to their room',
      'Ensure there are interesting destinations to crawl toward — a mirror on the wall at floor level, a treasure basket in a corner, a window with a view',
    ],
    watchFor: [
      'First crawling movements, whether classic hands-and-knees crawling, scooting, or commando crawling — all styles are normal and valid',
      'Your baby pulling up to standing for the first time, often looking surprised and delighted at the new height',
      'Intentional pointing at objects or people, with clear expectation that you will respond — this is a huge communicative milestone',
      'Using "mama" or "dada" with increasing specificity, beginning to direct these sounds toward the correct parent',
    ],
  },

  // =========================================================================
  // MONTH 9
  // =========================================================================
  {
    id: 'month-9',
    monthNumber: 9,
    monthLabel: '9 Months',
    ageRange: '8 to 9 Months',
    tagline: 'The pincer grasp arrives — precision meets curiosity',
    brainDevelopment:
      'The third myelination wave is at its most intense. The Temporal lobe continues maturing rapidly, with dramatic improvements in language comprehension and memory. All major brain regions are now connected by myelinated pathways, and the speed of neural transmission is increasing. Your baby\'s ability to understand, remember, and respond to language is expanding at a remarkable rate.',
    bodyDevelopment:
      'Teething is likely active, with central incisors (top and bottom) emerging. Myelination has progressed to the thighs, supporting crawling and pulling up with increasing strength. The hands are undergoing a pivotal transformation — the pincer grasp (thumb and forefinger working together) is developing, representing one of the most important fine motor milestones of the first year.',
    grossMotor: {
      shouldBeAbleTo: [
        'Sit independently with complete stability, even during vigorous play',
        'Crawl or move efficiently across the floor using their preferred method',
        'Pull up to standing using furniture or a parent\'s hands',
      ],
      probablyAbleTo: [
        'Cruise along furniture while holding on with one or both hands',
        'Lower from standing back to sitting in a controlled manner',
      ],
      mayEvenBeAbleTo: [
        'Rise up on hands and feet (bear position) as a precursor to standing independently',
        'Stand alone briefly when distracted or holding an interesting object',
      ],
    },
    handDevelopment: [
      'The pincer grasp is developing — the thumb and forefinger come together to pick up small objects with precision',
      'Intentionally drops objects to watch them fall and hear them land — this is scientific experimentation, not mischief',
      'May begin to wave goodbye and clap hands together, showing voluntary control of expressive hand movements',
      'Can pick up small pieces of food and bring them to the mouth with increasing accuracy',
    ],
    communication: [
      'Canonical babbling continues with increasingly varied syllable combinations',
      'Says "dada" and "mama" with growing specificity — beginning to direct these sounds to the correct parent',
      'Pointing gestures become deliberate and communicative — points to request and to share attention',
      'Understands the emotional tone of speech and responds to firm "no" by pausing or looking',
    ],
    socialEmotional: [
      'Joint attention emerges — your baby looks where you look and points to share interesting discoveries with you',
      'Shows empathy in early forms, such as becoming distressed when another child cries',
      'Seeks approval by looking at your face before and after doing something, reading your expression',
      'May begin to test boundaries, repeating an action while watching your face for a reaction',
    ],
    activities: [
      {
        name: 'Egg and Cup',
        description:
          'Offer a wooden egg and a small cup or container. Your baby can practice placing the egg in the cup and taking it out. This simple, repeatable activity builds the pincer grasp, hand-eye coordination, and the concept of containment. Watch them repeat it with intense concentration.',
        icon: '\u{1F95A}',
        category: 'motor',
      },
      {
        name: 'Box with Ball and Drawer',
        description:
          'A small box with a hole on top for pushing a ball through and a drawer on the front that opens to reveal the ball. This builds on object permanence — the ball disappears but can be found by opening the drawer. Cause, effect, and problem-solving in one elegant material.',
        icon: '\u{1F4E6}',
        category: 'cognitive',
      },
      {
        name: 'Rings on a Vertical Dowel',
        description:
          'Offer a vertical dowel with large rings to stack on and remove. Focus on the process, not getting the order right. Each ring requires the pincer grasp to hold and a coordinated release to place. This is deeply satisfying work for your baby\'s developing hands.',
        icon: '\u{1F4CD}',
        category: 'motor',
      },
      {
        name: 'Peek-a-Boo Variations',
        description:
          'Play peek-a-boo with variations — hide behind a blanket, around a corner, under a hat. Your baby may begin to initiate the game themselves. This play supports object permanence understanding and the joy of social connection.',
        icon: '\u{1F60A}',
        category: 'cognitive',
      },
      {
        name: 'Dropping Game with Sound',
        description:
          'Provide a tin can or metal container and small balls or objects to drop in. The satisfying clank when the object hits the bottom provides auditory feedback that rewards the precision of the release. Your baby will repeat this many, many times — let them.',
        icon: '\u{1F3B6}',
        category: 'motor',
      },
    ],
    sensoryDevelopment: [
      'Pincer Grasp development begins — baby starts picking up small objects between thumb and index finger',
      'Dropping Game emerges: baby explores cause and effect, distance, and spatial awareness by releasing objects',
      'Hand-eye coordination, sequencing, and repetition are all developing through toy exploration',
      'Books that fit baby\'s hand help practice developing hand abilities through page turning',
      'Visual tracking continues to develop through toys that roll, spin, and move across floors',
    ],
    reflexes: [
      'Symmetrical Tonic Neck (crawling) reflex present (reappeared at 6-9 months)',
      'Parachute reflex appears before onset of walking',
      'Permanent reflexes continue: eye blink, gag, yawn, cough, sneeze, lip quiver',
    ],
    touchAndBonding: [
      'When baby can stand and grasp, transition to changing and dressing them upright to avoid power struggles',
      'Finger games, simple songs, and rhymes with hand actions provide fun language experiences and physical bonding',
      'Outdoor spaces with varied surfaces and safe levels provide wonderful exploration for building strength and balance',
      'Object Permanence continues developing — use reassuring voice and games like Hide and Seek',
    ],
    communicationTips: [
      'Follow your baby\'s pointing — when they point at something, name it clearly and add a simple detail: "Tree! That is a big green tree." Honoring their pointing teaches them that communication works and their interests matter',
      'Introduce simple signs alongside spoken words: "more," "all done," "milk." Signs give your baby a way to communicate before spoken words are available, reducing frustration',
      'Ask simple questions and wait: "Do you want the ball or the bear?" Hold up each option. Even before your baby can answer verbally, they will begin to reach for their choice — this is communication',
    ],
    independenceGains: [
      'The pincer grasp allows your baby to pick up small pieces of food independently, making self-feeding with finger foods genuinely possible',
      'Cruising along furniture gives your baby independent mobility while upright, a precursor to walking',
      'Your baby can now actively participate in getting dressed — pushing arms through sleeves, pulling off a hat — when given time and encouragement',
    ],
    environmentTips: [
      'Ensure furniture is arranged to support cruising — stable pieces spaced close enough for your baby to step between them while holding on',
      'Set up a low activity table (or small coffee table) where your baby can stand and play with materials at the right height',
      'Place the egg and cup, rings on dowel, and object permanence box on the shelf for independent selection',
      'Provide safe, small finger foods during meals that allow your baby to practice the pincer grasp — small pieces of soft fruit, cooked vegetables, and cereal',
      'Create a safe space near a window or door where your baby can stand and observe the outside world — nature observation is rich learning',
    ],
    watchFor: [
      'The pincer grasp emerging — watch for the moment when the thumb and forefinger come together to pick up something small like a piece of cereal',
      'Deliberate pointing with the index finger, often accompanied by a vocalization — this is one of the most important communicative milestones of infancy',
      'Your baby initiating games like peek-a-boo or handing you objects, showing they understand social reciprocity',
      'Extended periods of concentration on a single activity, especially the egg and cup or dropping game — this deep focus is the Montessori concept of normalization in action',
    ],
  },

  // =========================================================================
  // MONTH 10
  // =========================================================================
  {
    id: 'month-10',
    monthNumber: 10,
    monthLabel: '10 Months',
    ageRange: '9 to 10 Months',
    tagline: 'Confidence grows with every cruise and every word understood',
    brainDevelopment:
      'The third myelination wave continues with all major brain areas actively building connections. The neural pathways for language comprehension are maturing rapidly — your baby likely understands around 50 words now, far more than they can say. The brain\'s memory systems are strengthening, allowing your baby to remember routines, anticipate events, and recall where favorite objects are stored.',
    bodyDevelopment:
      'Teething continues with additional teeth emerging. Myelination has progressed to the lower legs, supporting the standing and early cruising that characterize this month. Muscle coordination throughout the body is improving, and your baby\'s movements are becoming increasingly fluid and purposeful.',
    grossMotor: {
      shouldBeAbleTo: [
        'Crawl confidently and efficiently across varied surfaces',
        'Pull up to standing using any stable surface',
        'Lower from standing to sitting in a controlled, deliberate way',
      ],
      probablyAbleTo: [
        'Cruise along furniture with growing confidence, stepping sideways',
        'Stand holding on with just one hand while reaching with the other',
      ],
      mayEvenBeAbleTo: [
        'Stand independently for a few seconds without holding anything',
        'Take a step or two between furniture pieces',
      ],
    },
    handDevelopment: [
      'The pincer grasp is refining — your baby picks up small objects with increasing precision and control',
      'Both hands work together cooperatively, one holding while the other manipulates',
      'Can turn pages of a thick board book, though often several pages at once',
      'Places objects inside containers with intentional aim and releases them deliberately',
    ],
    communication: [
      'Receptive vocabulary reaches approximately 50 words — your baby understands far more than they can express',
      'Pointing intensifies and becomes a primary communication tool for requesting and sharing attention',
      'May begin to follow simple instructions: "Give it to Mama," "Where is the ball?"',
      'Jargon babbling appears — babbling with the intonation patterns of real speech, as if telling a story',
    ],
    socialEmotional: [
      'Shows increasing independence in play, moving away from caregivers to explore while checking back periodically',
      'Develops strong preferences and may resist activities or foods they do not want',
      'Imitates simple actions — clapping, waving, banging, stirring — after watching others',
      'May show early humor, deliberately doing something silly and looking to see if you laugh',
    ],
    activities: [
      {
        name: 'Simple Puzzles',
        description:
          'Offer a puzzle with large, single-piece knobs — a circle, square, and triangle each in their own space. The knobs are perfectly sized for the developing pincer grasp, and the satisfaction of fitting a shape into its matching space builds spatial reasoning and concentration.',
        icon: '\u{1F9E9}',
        category: 'cognitive',
      },
      {
        name: 'Nesting and Stacking',
        description:
          'Provide a set of nesting cups or stacking rings. Your baby will explore these in many ways — stacking, nesting, knocking down, carrying — before eventually learning to order them by size. The process of exploration is more important than the product.',
        icon: '\u{1F3D7}\uFE0F',
        category: 'cognitive',
      },
      {
        name: 'First Books with Real Images',
        description:
          'Choose board books with clear, realistic photographs of familiar objects — animals, fruits, vehicles, household items. Sit together and point to each image: "Dog! That is a dog. Woof woof." Your baby\'s expanding receptive vocabulary makes this a particularly rich activity.',
        icon: '\u{1F4D6}',
        category: 'language',
      },
      {
        name: 'Imitation Play',
        description:
          'Perform simple actions and invite your baby to imitate — stir with a spoon, brush your hair, wipe the table. Your baby is a natural imitator, and this play builds practical life skills while strengthening the connection between observation and action.',
        icon: '\u{1F46A}',
        category: 'practical_life',
      },
      {
        name: 'Cruising Challenge',
        description:
          'Arrange stable furniture pieces with small gaps between them to encourage your baby to step from one to the next while holding on. Place interesting objects at standing height to motivate the journey. This builds leg strength, balance, and confidence.',
        icon: '\u{1F6B6}',
        category: 'motor',
      },
    ],
    sensoryDevelopment: [
      'Fourth wave of brain myelination begins, igniting the Frontal lobe and Broca\'s area for grammar and syntax',
      'Pincer Grasp is developing or being practiced — baby uses tips of index finger and thumb for small objects',
      'Baby can voluntarily release objects and may practice clapping with more open hands',
      'All senses are well-established but need continued support through appropriately matched toys',
      'Hand-eye coordination continues requiring stimulation through varied activities',
    ],
    reflexes: [
      'By 11 months, Symmetrical Tonic Neck (crawling) reflex has disappeared',
      'Babinski reflex may still be present',
      'Parachute reflex appears before onset of walking',
      'Permanent reflexes continue: eye blink, gag, yawn, cough, sneeze, lip quiver',
    ],
    touchAndBonding: [
      'Baby may offer cuddles and kisses to familiar, trusted people — a sign of deepening emotional bonds',
      'Baby looks to others for cues on how to react in social situations — model calm, positive responses',
      'Play clapping games, hand rhymes, and songs like Peek-a-Boo and Round and Round the Garden together',
      'Resist the urge to compare development with others; provide a supportive, safe, stimulating environment',
      'Avoid offering hands for walking — baby\'s arms need to be free for natural balance adjustments',
    ],
    communicationTips: [
      'Expand on your baby\'s single-word attempts and jargon: if they point and say "dah!" at a dog, respond with "Yes! Dog! That is a big brown dog." Expansion models richer language without correcting',
      'Read together every day, pointing to pictures and naming them. Ask simple questions: "Where is the cat?" and give your baby time to point. Celebrate their correct responses with genuine enthusiasm',
      'Narrate your daily activities in simple, clear sentences: "I am pouring water into the glass. Now I am drinking. The water is cold." This running commentary is the richest form of language exposure',
    ],
    independenceGains: [
      'Cruising gives your baby the ability to navigate the room upright, reaching objects and destinations that were previously inaccessible',
      'Following simple instructions like "bring me the ball" shows your baby can understand and act on your words — a major cognitive and social leap',
      'Your baby can feed themselves a variety of finger foods with the refined pincer grasp, making mealtimes increasingly independent',
    ],
    environmentTips: [
      'Arrange furniture with intentional spacing — close enough for your baby to cruise between pieces, with interesting objects placed at standing height as motivation',
      'Add simple puzzles and nesting materials to the shelf rotation',
      'Create a small book area with a basket or low shelf of board books that your baby can access independently',
      'Ensure your baby has a safe, designated place to practice standing and early stepping, with a clear surface to grab if they lose balance',
      'Begin offering simple practical life materials: a small dustpan and brush for sweeping, a cloth for wiping up spills',
    ],
    watchFor: [
      'Jargon babbling that sounds like real speech with rising and falling intonation — your baby is practicing the melody of language even before they have the words',
      'Your baby following a simple instruction for the first time, showing comprehension of your words',
      'Moments of independent standing, even just a second or two — your baby may not even realize they have let go',
      'Deliberate humor — your baby doing something silly and looking at you to check if you noticed and appreciated it',
    ],
  },

  // =========================================================================
  // MONTH 11
  // =========================================================================
  {
    id: 'month-11',
    monthNumber: 11,
    monthLabel: '11 Months',
    ageRange: '10 to 11 Months',
    tagline: 'Standing on the threshold of walking and talking',
    brainDevelopment:
      'All four myelination waves are now active, and neural connections are intensifying throughout the brain. The pathways for language, movement, memory, and reasoning are all being refined simultaneously. Your baby\'s brain is preparing for two of the most transformative milestones of childhood: walking and first words.',
    bodyDevelopment:
      'The Babinski reflex (toes fanning when the sole of the foot is stroked) typically disappears around this time, signaling the maturation of the nervous system pathways to the feet. Your baby\'s body is becoming fully integrated, with all major muscle groups working together for complex movements like cruising, standing, and preparing to walk.',
    grossMotor: {
      shouldBeAbleTo: [
        'Cruise confidently along furniture, moving smoothly between pieces',
        'Stand holding on with one hand while freely reaching and playing with the other',
        'Lower to the floor from standing in a controlled, intentional way',
      ],
      probablyAbleTo: [
        'Stand alone for several seconds without holding anything',
        'Walk while holding onto a push toy or an adult\'s hands',
      ],
      mayEvenBeAbleTo: [
        'Take one or two independent steps without support',
        'Climb onto low furniture like a couch or toddler chair',
      ],
    },
    handDevelopment: [
      'Neat pincer grasp is established — thumb and forefinger work together with precision to pick up tiny objects',
      'Voluntary release is well-controlled — your baby can deliberately place objects exactly where they want them',
      'Clapping with open hands becomes a joyful expression of excitement and achievement',
      'May begin to hold a crayon or large marker and make marks on paper',
    ],
    communication: [
      'Understanding of words and phrases expands rapidly — your baby follows multi-step instructions in familiar contexts',
      'Jargon babbling sounds increasingly like real speech, with the cadence and intonation of your language',
      'May produce their first clearly intentional word — often "mama," "dada," "dog," "ball," or "more"',
      'Uses gestures, vocalizations, and pointing together to communicate complex desires',
    ],
    socialEmotional: [
      'Shows strong desire for independence — wants to do things "by myself" even before they have the words to say so',
      'Cooperates in familiar routines like dressing, bathing, and tidying when given time and participation',
      'Tests boundaries more actively, watching your response to decide whether to repeat an action',
      'Shows pride and satisfaction when they accomplish something, looking to you to share the achievement',
    ],
    activities: [
      {
        name: 'Weighted Push Wagon',
        description:
          'A sturdy, weighted wagon that your baby can push while walking provides the perfect balance support. Unlike walkers that babies sit in, a push wagon requires your baby to use their own muscles and balance. The weight prevents it from rolling away too fast. This is often the bridge to independent walking.',
        icon: '\u{1F6D2}',
        category: 'motor',
      },
      {
        name: 'First Drawing',
        description:
          'Offer a large piece of paper taped to the floor or a low easel and a thick, non-toxic crayon or beeswax block crayon. Your baby\'s first marks are an act of creation — they cause a visible change in the world with their own hand. This is the very beginning of writing and art.',
        icon: '\u{1F58D}\uFE0F',
        category: 'sensory',
      },
      {
        name: 'Practical Life Participation',
        description:
          'Invite your baby to participate in simple household tasks: wiping the table with a small cloth, putting a toy back on the shelf, dropping dirty clothes in a basket. The drive to imitate and contribute is powerful at this age — channel it into real, meaningful work.',
        icon: '\u{1F9F9}',
        category: 'practical_life',
      },
      {
        name: 'Ball Play',
        description:
          'Sit on the floor facing your baby and roll a ball back and forth. This simple game teaches turn-taking, cause and effect, and social reciprocity. Vary the speed and direction. Your baby may begin to throw the ball as well — celebrate the effort, not the accuracy.',
        icon: '\u{26BD}',
        category: 'motor',
      },
      {
        name: 'Naming and Language Games',
        description:
          'Play "Where is your nose? Where are your toes?" touching each body part as you name it. Ask "Where is the book?" and celebrate when your baby points or moves toward it. These games make the connection between words and objects concrete and joyful.',
        icon: '\u{1F5E3}\uFE0F',
        category: 'language',
      },
    ],
    sensoryDevelopment: [
      'Baby can use a neat Pincer Grasp and is intent on practicing it with small objects',
      'Can point with index finger, wave, and clap with a more open hand',
      'Continues building knowledge through holding and manipulating toys and objects',
      'Hand-eye coordination requires ongoing support through toys with finer properties',
      'Equilibrium requires stimulation as baby cruises, stands, and possibly takes first steps',
    ],
    reflexes: [
      'Symmetrical Tonic Neck (crawling) reflex has disappeared',
      'Babinski reflex may still be present',
      'Parachute reflex is present before onset of walking',
      'Permanent reflexes continue: eye blink, gag, yawn, cough, sneeze, lip quiver',
    ],
    touchAndBonding: [
      'Introduce self-care collaboration: show baby how to use a toothbrush, hairbrush, or face cloth together',
      'Stranger and Separation Anxiety typically diminishes for most babies around this time',
      'Baby may begin asserting themselves — invite them to help with everyday activities',
      'Use silence to your advantage — baby needs up to 30 seconds to process a simple request',
      'Avoid rushing development; trust that milestones will be reached within the normal timeframe',
    ],
    communicationTips: [
      'When your baby says their first word, respond with genuine excitement and expand: if they say "ba" for ball, say "Ball! Yes, that is your ball! You want the ball." This confirms their word was understood and models the full form',
      'Give choices throughout the day: "Do you want the banana or the apple?" Hold up each option. This encourages communication and builds vocabulary while respecting your baby\'s preferences',
      'Slow down your speech slightly and enunciate clearly, but do not use baby talk. Your baby is building their language on the model they hear most — make it clear, correct, and rich',
    ],
    independenceGains: [
      'Standing and beginning to walk gives your baby extraordinary independence — they can move through the world upright, with both hands free',
      'The neat pincer grasp allows precise self-feeding, self-selection of materials from the shelf, and beginning to use simple tools',
      'Participating in practical life activities like wiping the table gives your baby a role in the family and a sense of meaningful contribution',
    ],
    environmentTips: [
      'Provide a weighted push wagon for walking practice — position it near furniture so your baby can pull up, grasp the handle, and begin pushing',
      'Set up a low easel or tape large paper to the floor for first drawing experiences with thick crayons',
      'Create practical life opportunities: a low hook for a jacket, a small basket for dirty clothes, a cloth on the table for wiping',
      'Ensure clear walking paths throughout the home — remove obstacles that could trip a new walker',
      'Consider adding a small chalkboard or whiteboard at your baby\'s standing height for mark-making exploration',
    ],
    watchFor: [
      'Your baby standing independently, perhaps without even noticing they have let go of the furniture — the moment of discovering their own balance',
      'The first clearly intentional word — said in context, with meaning and expectation of being understood',
      'Your baby spontaneously participating in a household task, like picking up an item and putting it where it belongs',
      'Extended concentration during activities like stacking, nesting, or drawing — these moments of deep focus are precious',
    ],
  },

  // =========================================================================
  // MONTH 12
  // =========================================================================
  {
    id: 'month-12',
    monthNumber: 12,
    monthLabel: '12 Months',
    ageRange: '11 to 12 Months',
    tagline: 'Happy birthday — the first year of miracles complete',
    brainDevelopment:
      'All four myelination waves are reaching completion. Broca\'s area (responsible for grammar and speech production) and the Frontal lobe (reasoning, planning, and self-regulation) are now actively developing. Your baby\'s brain has built an extraordinary foundation in just twelve months — from a newborn dependent on reflexes to a person on the verge of walking and talking.',
    bodyDevelopment:
      'Myelination has reached the feet, completing the head-to-toe progression that began at birth. Teething continues, and your baby may have several teeth by now. The entire body is now under increasingly voluntary control, from the fine movements of the fingertips to the large movements of walking. The first birthday marks the completion of the initial myelination journey.',
    grossMotor: {
      shouldBeAbleTo: [
        'Cruise confidently along furniture and between pieces',
        'Stand alone for extended periods with good balance',
        'Walk while holding one hand or pushing a walker',
      ],
      probablyAbleTo: [
        'Take several independent steps without holding anything',
        'Squat down from standing to pick up an object and return to standing',
      ],
      mayEvenBeAbleTo: [
        'Walk independently across a room',
        'Begin climbing stairs on hands and knees',
      ],
    },
    handDevelopment: [
      'Neat pincer grasp is well-established and precise',
      'Waves goodbye and claps hands with open palms as deliberate, meaningful gestures',
      'Voluntary release is fully controlled — can place objects precisely where intended',
      'May begin to use a crayon or marker with intentional mark-making, creating scribbles',
    ],
    communication: [
      'Enters the Linguistic Stage — the transition from pre-verbal to verbal communication',
      'Produces one or more intentional words used consistently in the correct context',
      'Understands approximately 70 words and follows simple one-step instructions',
      'Combines gestures, words, and intonation to express complex ideas: pointing at a cup and saying "wa" for water',
    ],
    socialEmotional: [
      'Shows strong attachment to primary caregivers while becoming increasingly comfortable with familiar people',
      'Demonstrates clear likes, dislikes, and preferences — asserting their emerging personality',
      'Cooperates actively during familiar routines and may begin to anticipate next steps',
      'Shows empathy by patting or hugging someone who appears upset',
    ],
    activities: [
      {
        name: 'First Art with Crayons',
        description:
          'Provide large sheets of paper and thick, non-toxic crayons or beeswax block crayons. Sit alongside your baby and draw together. Do not direct their marks — every scribble is an act of self-expression and a step toward writing. Name the colors they use and celebrate the process.',
        icon: '\u{1F3A8}',
        category: 'sensory',
      },
      {
        name: 'Practical Life: Dressing',
        description:
          'During dressing routines, slow down and invite participation. "Can you push your arm through the sleeve? You did it!" Even at twelve months, your baby can cooperate meaningfully in dressing when given time, patience, and a running narration of each step.',
        icon: '\u{1F455}',
        category: 'practical_life',
      },
      {
        name: 'Push Wagon Walking',
        description:
          'The weighted push wagon remains an important tool as your baby practices walking with increasing confidence. Set up destinations to walk toward — a favorite toy, a mirror, a window. Walking with purpose and toward a goal builds both physical skill and intentional movement.',
        icon: '\u{1F6B6}',
        category: 'motor',
      },
      {
        name: 'Ball Games',
        description:
          'Now that your baby can stand and perhaps walk, ball play becomes more dynamic. Roll, kick, throw, and chase balls together. Vary the size and type of ball. These games build gross motor skills while teaching social concepts like turn-taking and cooperation.',
        icon: '\u{26BD}',
        category: 'motor',
      },
      {
        name: 'Brushing Hair and Teeth Together',
        description:
          'Give your baby a small brush to hold while you brush their hair, and a toothbrush to explore while you model brushing teeth. These self-care routines become opportunities for independence when introduced as shared, enjoyable activities rather than tasks imposed on the child.',
        icon: '\u{1FAA5}',
        category: 'practical_life',
      },
    ],
    sensoryDevelopment: [
      'All visual abilities are almost complete — baby enjoys a full 3D world of detail and color',
      'Oral exploration gradually decreases as other senses take over for gathering information',
      'Established equilibrium and upright balance allow engagement in self-care and home activities',
      'Pincer Grasp is being refined; first art activities like scribbling with crayons can be introduced',
      'Hands no longer needed for locomotion — they are free for independence activities and fine motor refinement',
    ],
    reflexes: [
      'By 12 months, most primitive reflexes have integrated',
      'Babinski reflex typically disappears, though it may persist up to 18 months',
      'Parachute reflex is present',
      'Permanent reflexes continue: eye blink, gag, yawn, cough, sneeze, lip quiver',
    ],
    touchAndBonding: [
      'Show interest in baby\'s desire to care for self (dressing, brushing hair, teeth); ignoring these signs causes developmental delays',
      'Use encouragement over praise: focus on effort and process rather than results',
      'Baby\'s world expands with walking; they will return to you for security reinforcement through cuddles',
      'Introduce simple classifying when out and about — point out groups of flowers, dogs, birds, or cars',
      'Consider introducing a chalkboard easel for self-expression and crossing the midline',
    ],
    communicationTips: [
      'Celebrate first words enthusiastically but without overcorrecting pronunciation. If your baby says "wa" for water, respond warmly: "Water! You want water. Here is your water." Modeling the correct form without criticism encourages continued effort',
      'Read together daily, encouraging your baby to point to pictures and name them. Ask open-ended questions: "What do you see?" and accept any response — a point, a sound, or a word',
      'Continue narrating daily life in rich, descriptive language. Your baby now understands far more than they can say, and every word they hear builds the vocabulary they will soon begin to speak',
    ],
    independenceGains: [
      'Walking (or the imminent arrival of walking) represents the ultimate independence milestone of the first year — your baby can move through the world on their own two feet',
      'First words give your baby the power to express their needs, wants, and observations with specificity',
      'Active participation in dressing, brushing, and self-care routines establishes the foundation for lifelong self-care independence',
    ],
    environmentTips: [
      'Arrange furniture to create clear, safe walking paths — remove coffee table clutter and ensure stable surfaces for balance support',
      'Visit parks and outdoor spaces with varied surfaces (grass, sand, gentle hills) for walking practice — each surface challenges balance differently',
      'Maintain a well-organized shelf with five to six materials, rotated weekly, that your baby can select independently',
      'Create a simple art area with paper, crayons, and an easel or tape for wall drawing at your baby\'s standing height',
      'Ensure your baby has their own low hooks for coats, low shelves for shoes, and accessible spaces that reinforce their independence in daily routines',
    ],
    watchFor: [
      'Independent walking — some babies walk at 10 months, others at 14 months. The range is wide and all timelines within it are perfectly normal',
      'First words being used consistently and in context — not just mimicked sounds but genuine communication',
      'Your baby spontaneously helping with household tasks, showing the deep human drive to contribute to the community',
      'Extended play sequences where your baby combines multiple objects and actions, showing increasingly complex thinking',
    ],
  },

  // =========================================================================
  // MONTH 13
  // =========================================================================
  {
    id: 'month-13',
    monthNumber: 13,
    monthLabel: '13 Months',
    ageRange: '12 to 13 Months',
    tagline: 'Walking into toddlerhood — a new chapter of discovery',
    brainDevelopment:
      'All four myelination waves are complete, and the brain continues building and refining neural pathways through experience. Broca\'s area and the Frontal lobe are actively developing, supporting the explosion of language and the beginning of more complex reasoning. Every interaction, every new word heard, every step taken strengthens the neural architecture.',
    bodyDevelopment:
      'Myelination of the major pathways is complete, though the brain will continue to refine connections for years to come. Teething continues with lateral incisors and first molars potentially emerging. If walking has not yet begun, it is likely imminent. The body is coordinating increasingly complex movement patterns.',
    grossMotor: {
      shouldBeAbleTo: [
        'Walk with support or cruise confidently if not yet walking independently',
        'Stand independently with good balance for extended periods',
        'Squat to pick up objects and return to standing without sitting down',
      ],
      probablyAbleTo: [
        'Walk independently if not already doing so (may take up to 14 months)',
        'Begin to show interest in climbing — onto low furniture, up stairs',
      ],
      mayEvenBeAbleTo: [
        'Walk backward a few steps',
        'Carry a toy or object while walking',
      ],
    },
    handDevelopment: [
      'The refined pincer grasp is well-established, allowing precise manipulation of small objects',
      'Beginning to use tools intentionally — a spoon for eating, a brush for hair',
      'Can stack two or three blocks and may begin to build simple towers',
      'Turns pages of a board book one at a time with increasing control',
    ],
    communication: [
      'First words are emerging or established, with the pointing-and-naming phase in full swing',
      'Points at objects and waits expectantly for you to name them — this is active vocabulary building',
      'May begin the vocabulary explosion, adding new words rapidly in the coming weeks',
      'Understands and follows simple one-step instructions: "Bring me the shoe," "Put it on the table"',
    ],
    socialEmotional: [
      'Asserting independence more strongly — "I can do it myself" becomes a driving force',
      'May show frustration when unable to communicate a specific desire — tantrums are a natural expression of this gap',
      'Imitates complex household activities: pretends to talk on the phone, stirs a pot, sweeps',
      'Shows strong desire to be included in whatever the adults and older children are doing',
    ],
    activities: [
      {
        name: 'Walking on Varied Surfaces',
        description:
          'Take your toddler outside to walk on grass, sand, gentle slopes, pebbles, and smooth paths. Each surface challenges balance differently and sends rich sensory information through the newly myelinated pathways to the feet. Barefoot walking, when safe, provides the most sensory feedback.',
        icon: '\u{1F463}',
        category: 'motor',
      },
      {
        name: 'Practical Life Activities',
        description:
          'Invite your toddler into real household work: wiping the table, putting napkins at each place setting, watering a plant with a small pitcher, sorting laundry by color. These activities build concentration, coordination, and a sense of belonging to the family community.',
        icon: '\u{1F3E0}',
        category: 'practical_life',
      },
      {
        name: 'Naming Games with Real Objects',
        description:
          'Gather baskets of real objects from around the home — fruits, utensils, clothing items — and play naming games. Hold up each object, name it clearly, and let your toddler explore it. "This is an apple. Apple. It is red and smooth." Pair the word with the sensory experience.',
        icon: '\u{1F4AC}',
        category: 'language',
      },
      {
        name: 'Simple Tower Building',
        description:
          'Offer large blocks or stacking cups for tower building. Your toddler will stack two or three, then gleefully knock them down. Both the building and the knocking down are valuable — building requires coordination and the knocking teaches cause and effect. The cycle of construction and demolition is deeply satisfying.',
        icon: '\u{1F9F1}',
        category: 'cognitive',
      },
      {
        name: 'Spoon Practice at Meals',
        description:
          'Provide a child-sized spoon and thick, scoopable foods like yogurt, oatmeal, or mashed vegetables. Your toddler\'s spoon will often arrive at the mouth upside-down or empty — this is perfectly normal. The practice is the point, and the mess is the evidence of learning.',
        icon: '\u{1F944}',
        category: 'practical_life',
      },
    ],
    sensoryDevelopment: [
      'Body myelination completes between 12-14 months, allowing full gross and fine motor potential',
      'Hands progress from one-hand use to two hands working together (one holds, one works)',
      'Refinement of the Pincer Grasp drives interest in small things: buttons, zippers, tiny models',
      'Strong interest in real-life small objects like shells, stones, seedpods, and model animals',
      'Sensorial information continues to be acquired through movement and manipulation',
    ],
    reflexes: [
      'All primitive reflexes have integrated by 12-14 months',
      'Babinski reflex typically gone, but may persist up to 18 months',
      'Only permanent reflexes remain: eye blink, gag, yawn, cough, sneeze, lip quiver',
    ],
    touchAndBonding: [
      'Invite your toddler to collaborate in daily activities: collecting shoes, bringing items to the bath, helping in the kitchen',
      'Use minimal words when showing "how" — keep talking and movement separate so your child can process each',
      'Provide toddler-sized real items (small brooms, cutting boards, brushes) to support the drive to do it themselves',
      'When toddler says "no," recognize it as emerging autonomy, not defiance',
      'Walking together at toddler\'s pace through nature builds strength, sensory exploration, and deep bonding',
    ],
    communicationTips: [
      'When your toddler points and vocalizes, name the object immediately and clearly. Then add one descriptor: "Dog! Big dog." This "point and name" exchange is the engine of vocabulary growth during this period',
      'Resist the urge to anticipate every need. If your toddler reaches for water, wait a moment for them to attempt to communicate. A brief pause gives them the opportunity to use words or gestures before you respond',
      'Use simple, complete sentences rather than single words or baby talk: "Please put the spoon on the table" rather than "Spoon — table." Full sentences model grammar naturally',
    ],
    independenceGains: [
      'Walking gives your toddler the freedom to explore independently, choosing where to go and what to investigate',
      'Tool use (spoon, brush, cloth) extends your toddler\'s capabilities and gives them real participation in self-care and household life',
      'The ability to follow instructions and complete simple tasks means your toddler can contribute meaningfully to family routines',
    ],
    environmentTips: [
      'Create open spaces for walking practice, free of tripping hazards and obstacles — your toddler needs room to walk, turn, stop, and change direction',
      'Install low hooks at your toddler\'s height for hanging a coat, bag, or hat — arriving home becomes a practical life lesson',
      'Set up a small practical life station in the kitchen with a child-sized table, real dishes (small ceramic, not plastic), and a sponge for cleaning up',
      'Provide outdoor time daily on varied terrain — walking on different surfaces builds balance, strength, and sensory integration',
      'Arrange the shelf with materials that invite tool use: a small brush and dustpan, a cloth for polishing, a watering can for plants',
    ],
    watchFor: [
      'The vocabulary explosion beginning — suddenly your toddler seems to learn a new word every day, pointing and naming with enthusiasm',
      'Independent walking becoming confident and fluid, with your toddler choosing walking as their primary mode of transport',
      'Your toddler imitating increasingly complex actions, like pretending to cook or care for a doll — this symbolic play shows growing cognitive complexity',
      'Moments of intense concentration during practical life activities, sometimes lasting five to ten minutes or more — this focused engagement is the hallmark of meaningful work',
    ],
  },

  // =========================================================================
  // MONTH 14
  // =========================================================================
  {
    id: 'month-14',
    monthNumber: 14,
    monthLabel: '14 Months',
    ageRange: '13 to 14 Months',
    tagline: 'Steady steps and growing words — the world is theirs to name',
    brainDevelopment:
      'The Prefrontal cortex, though still very immature, is beginning to develop. This region is responsible for impulse control, planning, and decision-making — skills that will take years to mature but whose foundations are being laid now. Every time your toddler pauses before acting, considers a choice, or follows a sequence, the Prefrontal cortex is exercising.',
    bodyDevelopment:
      'Walking should be well-established by this age, with your toddler moving with increasing confidence and stability. Coordination between upper and lower body improves, allowing your toddler to walk while carrying objects, turn while walking, and navigate around obstacles. Fine motor precision continues to advance.',
    grossMotor: {
      shouldBeAbleTo: [
        'Walk independently with stable, confident gait',
        'Carry objects while walking without losing balance',
        'Squat to play on the floor and stand back up smoothly',
      ],
      probablyAbleTo: [
        'Begin running with a stiff, wide-legged gait',
        'Show interest in climbing stairs, initially on hands and knees',
      ],
      mayEvenBeAbleTo: [
        'Walk up stairs while holding an adult\'s hand',
        'Kick a ball forward while standing, though with limited accuracy',
      ],
    },
    handDevelopment: [
      'Both hands work together with increasing coordination — one holds while the other manipulates',
      'Precision of placement improves — can stack three or four blocks, fit pieces into simple puzzles',
      'Uses a spoon with improving accuracy, though spills remain common',
      'May begin to show hand preference, though dominance is not established until much later',
    ],
    communication: [
      'Growing vocabulary with new words appearing frequently — many toddlers are learning several new words per week',
      'Two-word combinations may emerge: "more milk," "daddy go," "big dog"',
      'Uses words, gestures, and intonation together to express increasingly complex ideas',
      'Follows two-step instructions in familiar contexts: "Pick up the cup and put it on the table"',
    ],
    socialEmotional: [
      'Strong desire for autonomy leads to more frequent "no" and resistance — this is healthy self-assertion, not defiance',
      'Parallel play develops — plays alongside other children with interest but limited direct interaction',
      'Shows affection openly through hugging, kissing, and snuggling with familiar people',
      'May begin to show ownership: "mine" becomes an important concept as the sense of self strengthens',
    ],
    activities: [
      {
        name: 'Stacking and Sorting',
        description:
          'Offer a basket of objects to sort by color, size, or type — red things and blue things, big blocks and small blocks, spoons and cups. Sorting builds the mathematical foundations of classification and comparison. Start with two clear categories and let your toddler discover the pattern.',
        icon: '\u{1F4CA}',
        category: 'cognitive',
      },
      {
        name: 'Pouring Practice',
        description:
          'Provide two small pitchers and dried beans or rice. Show your toddler how to pour from one to the other slowly and carefully. This classic Montessori practical life activity builds hand-eye coordination, concentration, and independence in food preparation. Start with dry materials before progressing to water.',
        icon: '\u{1FAD7}',
        category: 'practical_life',
      },
      {
        name: 'Simple Food Preparation',
        description:
          'Invite your toddler to help with safe food preparation: spreading butter on bread with a small knife, tearing lettuce leaves, peeling a banana, washing fruits and vegetables. Real participation in meal preparation is deeply meaningful work that builds confidence and practical skills.',
        icon: '\u{1F952}',
        category: 'practical_life',
      },
      {
        name: 'Dressing Practice',
        description:
          'Set aside extra time during dressing routines and invite your toddler to participate. Pulling off socks, pushing arms through sleeves, stepping into shoes — each step they manage themselves builds independence. A low mirror at their height lets them see the results of their efforts.',
        icon: '\u{1F45F}',
        category: 'practical_life',
      },
      {
        name: 'Nature Walks with Naming',
        description:
          'Take slow, toddler-paced walks outdoors and name everything you encounter: trees, flowers, birds, clouds, puddles, rocks. Collect natural treasures in a small basket. These walks combine language development, sensory experience, gross motor practice, and the joy of the natural world.',
        icon: '\u{1F33F}',
        category: 'language',
      },
    ],
    sensoryDevelopment: [
      'Body myelination is complete — all gross and fine motor potential is now neurologically supported',
      'Two-handed coordination becomes more refined through purposeful activities',
      'Toddler shows strong interest in matching, sorting, and classifying objects by sensory properties',
      'Vestibular and proprioception systems strengthen through walking, climbing, and carrying objects',
    ],
    reflexes: [
      'All primitive reflexes have fully integrated',
      'Babinski reflex may still be present in some children up to 18 months',
      'Only permanent reflexes remain: eye blink, gag, yawn, cough, sneeze, lip quiver',
    ],
    touchAndBonding: [
      'Offer limited choices of two options to build decision-making while maintaining security',
      'Use encouragement that reflects effort and process rather than praise that judges the result',
      'Provide toddler-sized tools and utensils for real household participation',
      'Walking together outdoors at toddler\'s pace builds bonding while supporting physical development',
    ],
    communicationTips: [
      'When your toddler says a single word, expand it into a short sentence: if they say "ball," respond "You want the ball! Here is the red ball." This models grammar naturally',
      'Offer real choices throughout the day to encourage communication: "Would you like the apple or the pear?" Present both options and wait for a response — a word, a point, or a reach',
      'Read books together and pause to let your toddler fill in familiar words. If a beloved book says "Brown bear, brown bear, what do you see?" pause before "see" and let your toddler complete it. This builds participation and confidence in language',
    ],
    independenceGains: [
      'Confident walking means your toddler can move through the world on their terms, choosing destinations and exploring with purpose',
      'Two-word combinations allow your toddler to express specific wants and observations, reducing frustration and increasing connection',
      'Participating in dressing, food preparation, and household tasks gives your toddler a real, meaningful role in the family',
    ],
    environmentTips: [
      'Set up child-height furniture for working and eating — a small table and chair that allow feet to be flat on the floor and elbows comfortably on the table',
      'Make materials accessible on low, open shelves — organized, visible, and limited to five or six options to avoid overwhelm',
      'Create a practical life station in the kitchen: a learning tower or step stool at the counter, child-sized utensils, and a small pitcher for pouring practice',
      'Designate a dressing area with a low mirror, a hook for clothes, and a small bench or stool for sitting while putting on shoes',
      'Ensure outdoor access daily — a safe yard, a nearby park, or simply a walk around the neighborhood provides essential movement and sensory input',
    ],
    watchFor: [
      'Two-word combinations emerging — these simple phrases represent a cognitive leap from naming objects to describing relationships between them',
      'Your toddler persisting at a challenging task despite frustration, then showing satisfaction upon completion — this cycle of effort and mastery builds resilience',
      'Running appearing for the first time, though it may look more like fast walking with a wide stance',
      'Spontaneous sorting or grouping of objects, showing the innate mathematical mind at work',
    ],
  },

  // =========================================================================
  // MONTHS 15-18
  // =========================================================================
  {
    id: 'months-15-18',
    monthNumber: 15,
    monthLabel: '15-18 Months',
    ageRange: '15 to 18 Months',
    tagline: 'The vocabulary explosion — naming everything with passion',
    brainDevelopment:
      'The Prefrontal cortex continues developing, and all major brain areas are maturing and refining connections. The most dramatic development during this period is the language explosion — the brain\'s language centers are working overtime, and many toddlers go from a handful of words to hundreds seemingly overnight. This is the result of all the myelination, all the listening, and all the neural pathway building of the first year.',
    bodyDevelopment:
      'Walking is well-established and your toddler is becoming increasingly coordinated. Running, climbing, and jumping attempts begin as confidence grows. Fine motor skills are refining dramatically, with increasing precision in threading, stacking, and using tools. The whole body moves with growing fluidity and purpose.',
    grossMotor: {
      shouldBeAbleTo: [
        'Walk confidently with a natural gait, including on uneven surfaces',
        'Run with an emerging running pattern, though still somewhat stiff',
        'Climb stairs with support, one step at a time',
      ],
      probablyAbleTo: [
        'Kick a ball forward while walking',
        'Carry large or heavy objects while walking (this is "maximum effort" work and is deeply satisfying)',
      ],
      mayEvenBeAbleTo: [
        'Jump with both feet leaving the ground briefly',
        'Walk backward several steps',
        'Climb onto playground equipment with increasing confidence',
      ],
    },
    handDevelopment: [
      'Precision and refinement characterize hand development during this period',
      'Threading large beads onto a thick string or lace becomes possible',
      'Stacking towers of five or more blocks with careful, deliberate placement',
      'Pouring from small pitchers with improving control and less spillage',
      'May begin to use child-safe scissors with supervision, showing the first cutting attempts',
    ],
    communication: [
      'The vocabulary explosion is in full force — many toddlers learn 200 or more words per month during this period',
      'Two-word phrases become common: "more crackers," "go outside," "doggy sleeping," "my shoe"',
      'Naming becomes a passion — your toddler points at everything and demands to know what it is called',
      'Understanding far exceeds expression — your toddler comprehends complex sentences even though they speak in short phrases',
      'May begin to use pronouns, especially "me" and "mine"',
    ],
    socialEmotional: [
      'The desire for independence intensifies — your toddler insists on doing things "by myself" even when it takes much longer',
      'Tantrums may peak during this period as language cannot keep pace with desires and frustrations',
      'Parallel play continues, with growing interest in what other children are doing',
      'Shows empathy more clearly — may bring a crying child a toy or a blanket, attempting to comfort them',
      'Order and consistency become very important — your toddler may insist on rituals and routines being done the same way each time',
    ],
    activities: [
      {
        name: 'Beading and Threading',
        description:
          'Provide large wooden beads and a thick lace or shoelace for threading. This precise, sequential work requires extraordinary concentration and coordination — the hand must guide the lace through the small hole in each bead. Start with just two or three beads and add more as skill develops.',
        icon: '\u{1F4FF}',
        category: 'motor',
      },
      {
        name: 'Food Preparation',
        description:
          'Expand your toddler\'s kitchen participation: cutting soft foods with a child-safe knife, spreading with a butter knife, juicing oranges with a hand juicer, pouring milk from a small pitcher, setting the table with real dishes. Each task builds practical skills and genuine independence.',
        icon: '\u{1F373}',
        category: 'practical_life',
      },
      {
        name: 'Sewing Cards',
        description:
          'Offer thick cardboard cards with pre-punched holes and a blunt needle threaded with yarn. Your toddler sews in and out of the holes, developing hand-eye coordination, sequential thinking, and the patience required for a multi-step process.',
        icon: '\u{1F9F5}',
        category: 'motor',
      },
      {
        name: 'Music and Movement',
        description:
          'Play various styles of music and dance together. Offer simple instruments — tambourine, maracas, xylophone, small drum. Sing songs with actions and let your toddler move freely to the rhythm. Music builds language, rhythm, emotional expression, and joy in equal measure.',
        icon: '\u{1F3B6}',
        category: 'sensory',
      },
      {
        name: 'Nomenclature Cards',
        description:
          'Use cards with clear photographs paired with labels — animals, fruits, vehicles, household objects. Lay out three cards, name each one clearly, then ask your toddler to find specific ones: "Where is the horse? Can you point to the horse?" This feeds the naming passion of this age.',
        icon: '\u{1F5BC}\uFE0F',
        category: 'language',
      },
    ],
    sensoryDevelopment: [
      'Sensory development focuses on refining hand capacities, gross motor movement, and the senses through purposeful activity',
      'Toddler understands approximately 70-200 nouns by 18 months and is in a sensitive period for spoken language',
      'Hand-eye coordination precision and two-handed coordination become more refined',
      'Vestibular and proprioception systems strengthen through walking, climbing, stair use, and carrying objects',
      'Toddler can point to 3-6 body parts and find familiar objects on request — showing sensory memory integration',
    ],
    reflexes: [
      'All primitive reflexes have fully integrated',
      'Babinski reflex may still be present in some children up to 18 months, then disappears',
      'Only permanent reflexes remain: eye blink, gag, yawn, cough, sneeze, lip quiver',
    ],
    touchAndBonding: [
      'Support independence through dressing, self-care, and household tasks that build secure attachment',
      'Provide a full-length mirror so your toddler can develop self-awareness during this stage of growing identity',
      'Add independence furniture: learning towers, step stools, accessible cupboards with toddler-sized utensils',
      'Show your toddler "how" to do tasks using slow, clear movements with minimal words — then let them try',
      'Maintain order, routines, and a predictable, responsive relationship — your voice continues to be a primary source of security',
    ],
    communicationTips: [
      'Feed the naming passion: when your toddler points and asks "What that?" (or their version of it), always answer promptly and clearly. This question-and-answer cycle is how vocabulary grows at its fastest rate',
      'Expand two-word phrases into three or four words: if your toddler says "more milk," respond "You want more milk. I will pour more milk in your cup." Gentle expansion models the next level of grammar',
      'Sing songs, recite nursery rhymes, and read books with repetitive patterns. Rhythm and repetition are the scaffolding your toddler needs to internalize language structure',
    ],
    independenceGains: [
      'Your toddler can dress themselves with simple clothing items — pulling on pants, stepping into shoes, pulling off a shirt',
      'Kitchen participation becomes real and substantial — pouring their own water, preparing simple snacks, cleaning up after meals',
      'The vocabulary explosion gives your toddler the power to express specific needs, observations, and feelings with increasing precision',
      'Walking and climbing mean your toddler navigates the home and playground with true autonomy',
    ],
    environmentTips: [
      'Provide low, open shelves with five to six carefully chosen activities, rotated weekly to maintain engagement',
      'Ensure a child-height table and chair are available for eating, working, and art — feet flat on the floor, elbows comfortable on the surface',
      'Set up a dedicated practical life area with child-sized real tools: a small broom, dustpan, watering can, sponge, and hand towel',
      'Create an art area with paper, crayons, washable markers, and paint — protect the floor with a mat and let creativity flow',
      'Maintain consistent routines and a well-ordered environment — during this period, your toddler finds deep comfort in order and predictability',
    ],
    watchFor: [
      'The vocabulary explosion in action — a dramatic increase in new words, often several per day, as your toddler names the world around them',
      'Two-word phrases becoming common and varied, showing your toddler combining words creatively rather than just repeating memorized phrases',
      'Maximum effort activities — carrying heavy objects, pushing furniture, pulling wagons loaded with toys. This is a deep developmental need, not a behavioral problem',
      'Extended concentration on threading, pouring, or other precise activities — this deep focus is normalization, and it should be protected and celebrated',
    ],
  },

  // =========================================================================
  // MONTHS 18-24
  // =========================================================================
  {
    id: 'months-18-24',
    monthNumber: 18,
    monthLabel: '18-24 Months',
    ageRange: '18 to 24 Months',
    tagline: 'Words, will, and the joy of real work',
    brainDevelopment:
      'All major myelination is complete, though the Prefrontal cortex remains very immature and will continue developing well into the twenties. Your toddler\'s brain has built an extraordinary network of connections — the focus now shifts to refinement, pruning unused pathways, and strengthening the most-used ones. Language, movement, and practical life experiences are the primary builders of this neural architecture.',
    bodyDevelopment:
      'Full body control is now achieved, with coordination improving steadily. Your toddler moves with confidence and purpose — running, climbing, kicking, and carrying heavy objects. Fine motor control continues to advance, enabling increasingly complex hand activities. The body is a well-coordinated instrument for exploring and acting upon the world.',
    grossMotor: {
      shouldBeAbleTo: [
        'Run with improving form and speed, though stopping and turning remain challenging',
        'Climb up and down stairs with support, one step at a time',
        'Kick a ball forward while standing with reasonable accuracy',
      ],
      probablyAbleTo: [
        'Carry heavy objects across the room, satisfying the need for maximum effort',
        'Jump with both feet leaving the ground',
        'Walk along a low balance beam or curb with assistance',
      ],
      mayEvenBeAbleTo: [
        'Ride a balance bike or sit-and-ride toy with feet on the ground',
        'Climb playground equipment independently including ladders',
        'Throw a ball overhand in the intended direction',
      ],
    },
    handDevelopment: [
      'Both hands work together with fluid coordination — one stabilizes while the other manipulates',
      'Precision cutting with child-safe scissors improves, able to snip along a line with practice',
      'Threading smaller beads onto thinner strings becomes possible',
      'Pouring from pitchers with increasing control, including pouring water without spilling',
      'Drawing progresses from random scribbles to more controlled and intentional marks',
    ],
    communication: [
      'Explosive growth in both vocabulary and grammar — by 24 months, many children have 250 to 300 expressive words',
      'Two to four-word phrases become the norm: "Daddy go work," "I want more crackers please," "Big truck outside"',
      'Grammar emerges naturally — plurals, possessives, and verb tenses begin to appear',
      'Questions multiply: "What that?" "Where going?" "Why?" — each question is an opportunity for learning',
      'May begin to use "I" and "you" correctly, though pronoun errors are normal and charming',
    ],
    socialEmotional: [
      'The concepts of freedom and limits become central — your toddler needs both wide independence and clear, consistent boundaries',
      'Maximum effort continues as a strong developmental drive — seeking heavy carrying, pushing, pulling, and vigorous physical activity',
      'The sensitive period for order is intense — your toddler may insist on routines, placement of objects, and sequences being exactly the same each time',
      'Empathy becomes more sophisticated — your toddler may try to help someone who is sad or hurt',
      'Parallel play evolves into the beginnings of cooperative play, with moments of true shared activity with other children',
    ],
    activities: [
      {
        name: 'Daily Home Activities',
        description:
          'The most powerful Montessori activities during this period are the real daily activities of the home: cooking together, cleaning together, folding laundry, watering plants, feeding pets, setting the table. Your toddler wants to do what you do. Let them. The "normalization" that Montessori described comes through meaningful, purposeful work.',
        icon: '\u{1F3E0}',
        category: 'practical_life',
      },
      {
        name: 'Nomenclature Cards',
        description:
          'Use three-part nomenclature cards (picture, label, and control card combining both) to build vocabulary in specific categories: animals, fruits, vehicles, body parts, tools. Lay out three to five cards, name each one, and play matching and identification games.',
        icon: '\u{1F5BC}\uFE0F',
        category: 'language',
      },
      {
        name: 'Art Progression',
        description:
          'Expand art materials: finger painting, watercolors with a thick brush, stamping with sponges, tearing and gluing paper, rolling and shaping clay or playdough. Each medium teaches the hands something different and provides a channel for creative self-expression.',
        icon: '\u{1F3A8}',
        category: 'sensory',
      },
      {
        name: 'Music Exploration',
        description:
          'Introduce more complex musical activities: following simple rhythmic patterns, playing a xylophone with a mallet, dancing to different tempos, singing songs with multiple verses. Music builds language, mathematical thinking, emotional expression, and social connection simultaneously.',
        icon: '\u{1F3B5}',
        category: 'sensory',
      },
      {
        name: 'Maximum Effort Activities',
        description:
          'Provide opportunities for your toddler to carry heavy objects, push loaded wagons, pull furniture, dig in the garden, climb hills, and engage in vigorous physical activity. This "maximum effort" satisfies a deep developmental need and leads to calm, focused behavior afterward.',
        icon: '\u{1F4AA}',
        category: 'motor',
      },
    ],
    sensoryDevelopment: [
      'Around 18-20 months, an Explosion of Words and Grammar occurs — toddler begins forming two-word phrases',
      'Fine motor precision and two-handed coordination are approaching completion through purposeful activities',
      'Toddler can respond to simple verbal tasks requiring action, showing deep sensory-language integration',
      'Understanding extends to common verbs, pronouns, and descriptive words',
      'By 24 months, expressive vocabulary reaches 250-300 words',
    ],
    reflexes: [
      'All primitive reflexes have fully integrated',
      'Only permanent reflexes remain: eye blink, gag, yawn, cough, sneeze, lip quiver',
    ],
    touchAndBonding: [
      'Daily activities of home life (Practical Life) provide the richest opportunities for self-construction',
      'Your toddler needs freedom within limits — offer limited choices to support autonomy while providing security',
      'Protect your toddler\'s concentration during activities; interruption disrupts self-construction',
      'Maximum effort activities (long walks, carrying heavy objects) support both physical and psychological development',
      'Toddler may experience tantrums due to immature Prefrontal Cortex — respond with calm presence and empathy',
    ],
    communicationTips: [
      'Answer every "what that?" and "why?" with patience and clarity. These questions are the engine of intellectual growth. If you do not know the answer, say so honestly: "I do not know — let us find out together"',
      'Model correct grammar without correcting your toddler directly. If they say "me go park," respond warmly: "Yes, we are going to the park! You want to go to the park." They will self-correct naturally over time',
      'Tell stories about your toddler\'s day: "This morning, you helped me make breakfast. You poured the milk into the bowl. Then you ate your cereal." Narrative language builds memory, sequencing, and grammar simultaneously',
    ],
    independenceGains: [
      'Your toddler can participate meaningfully in all major household routines — cooking, cleaning, dressing, and personal care',
      'Complex sentences allow your toddler to express needs, feelings, and ideas with specificity and nuance',
      'Physical confidence means your toddler navigates playgrounds, parks, and the home environment with genuine autonomy',
      'Self-care skills expand significantly: hand-washing, tooth-brushing, nose-wiping, and beginning stages of toileting readiness',
    ],
    environmentTips: [
      'Create a complete prepared environment: organized low shelves with materials, child-height table and chair, practical life station, art area, and a cozy reading corner',
      'Set up a kitchen area where your toddler can prepare simple snacks independently: a low shelf with crackers, fruit, and a small pitcher of water',
      'Provide real, child-sized tools rather than toy versions: a small broom that actually sweeps, a pitcher that actually pours, a knife that actually cuts soft foods',
      'Maintain consistent daily routines with visual schedules or picture sequences if helpful — the sensitive period for order means consistency brings deep comfort',
      'Ensure ample outdoor time with access to varied terrain, natural materials, and space for running, climbing, and maximum effort activities',
    ],
    watchFor: [
      'The explosion of grammar and sentence structure — your toddler combining words in new and creative ways they have never heard you say, showing true language generation rather than simple imitation',
      'Extended periods of concentration during practical life activities, sometimes lasting 15 to 20 minutes or more — this deep focus is Montessori\'s "normalization" in action',
      'The sensitive period for order manifesting as insistence on routines, placement of objects, and correct sequences — this is not rigidity but a deep developmental need',
      'Maximum effort activities — watch for your toddler seeking out heavy objects to carry, hills to climb, and vigorous activities to pursue. This is essential work',
    ],
  },

  // =========================================================================
  // MONTHS 24-36
  // =========================================================================
  {
    id: 'months-24-36',
    monthNumber: 24,
    monthLabel: '24-36 Months',
    ageRange: '24 to 36 Months',
    tagline: 'The reasoning child emerges — full sentences and big questions',
    brainDevelopment:
      'The brain continues its maturation with the Prefrontal cortex developing steadily, though it remains far from fully mature. This region supports impulse control, planning, empathy, and abstract thinking. Neural connections throughout the brain are being pruned and refined based on experience — the pathways that are used most are strengthened, while unused connections are gradually eliminated. This is why rich, varied experiences during this period have such lasting impact.',
    bodyDevelopment:
      'Full coordination is achieved, and movements become increasingly refined and graceful. Your child runs, jumps, climbs, and balances with growing skill. Fine motor control advances to allow complex manipulations: drawing recognizable shapes, using scissors along a line, buttoning large buttons, and handling increasingly small objects. The body is a well-tuned instrument for learning and self-expression.',
    grossMotor: {
      shouldBeAbleTo: [
        'Run confidently with good form, able to stop, start, and change direction',
        'Jump with both feet, clear small obstacles, and land with balance',
        'Climb stairs alternating feet with support, or one foot at a time without support',
      ],
      probablyAbleTo: [
        'Balance on one foot briefly',
        'Pedal a tricycle or balance bike',
        'Walk along a balance beam or low wall independently',
      ],
      mayEvenBeAbleTo: [
        'Hop on one foot several times',
        'Catch a large ball with both arms and body',
        'Somersault with assistance',
      ],
    },
    handDevelopment: [
      'Complex manipulations become possible: buttoning and unbuttoning large buttons, zipping and unzipping',
      'Drawing progresses from scribbles to intentional shapes — circles, lines, and the beginnings of representational drawings',
      'Uses scissors to cut along a line with improving accuracy',
      'Can build towers of eight or more blocks and create simple structures',
      'Holds a pencil or crayon with a more mature grip, transitioning from a fist grip toward a tripod grip',
    ],
    communication: [
      'Full sentences of four to six words or more become the norm',
      'Vocabulary exceeds 500 words and expands daily — many children in this range have 1,000 or more words',
      'Asks "why?" constantly — this is the beginning of abstract reasoning and the desire to understand causes',
      'Tells simple stories about their experiences, sometimes mixing real events with imagination',
      'Uses language for multiple purposes: requesting, refusing, questioning, describing, imagining, and narrating',
      'May begin to recognize and name letters, numbers, and colors if exposed to them naturally',
    ],
    socialEmotional: [
      'Cooperative play emerges — your child plays with other children, not just alongside them, sharing roles and taking turns',
      'Imaginary play becomes rich and complex: pretend cooking, doctor visits, building projects, and elaborate scenarios',
      'Empathy deepens — your child shows concern for others\' feelings and may try to comfort, help, or problem-solve',
      'Testing limits remains important as your child continues to learn where boundaries lie and how the social world works',
      'Beginning to understand and follow simple rules, though compliance varies with mood, fatigue, and emotional state',
    ],
    activities: [
      {
        name: 'Complex Practical Life',
        description:
          'Your child is ready for multi-step practical life activities: preparing a complete simple meal (washing, cutting, assembling a sandwich), doing laundry (sorting, loading, folding simple items), gardening (planting seeds, watering, observing growth), and caring for pets. These real tasks build executive function, sequencing, and independence.',
        icon: '\u{1F9D1}\u200D\u{1F373}',
        category: 'practical_life',
      },
      {
        name: 'Art Exploration',
        description:
          'Provide a rich art area with watercolors, tempera paint, colored pencils, safety scissors, glue sticks, collage materials, and clay. Your child\'s art is becoming increasingly intentional and representational. Display their work at their eye level on a dedicated wall or easel to honor their creative efforts.',
        icon: '\u{1F3A8}',
        category: 'sensory',
      },
      {
        name: 'Nature Study',
        description:
          'Take regular nature walks with a purpose: collecting leaves to identify, observing insects, planting a small garden, studying the weather, and watching the seasons change. Provide a magnifying glass, a small notebook, and containers for treasures. Nature study builds scientific observation, vocabulary, and reverence for the living world.',
        icon: '\u{1F33B}',
        category: 'cognitive',
      },
      {
        name: 'Early Math Concepts',
        description:
          'Introduce mathematical thinking through concrete materials: counting real objects (set the table with four plates for four people), comparing sizes (which stick is longer?), sorting by attributes, creating patterns with beads or blocks, and measuring ingredients during cooking. Math is everywhere when you know where to look.',
        icon: '\u{1F522}',
        category: 'cognitive',
      },
      {
        name: 'Storytelling and Books',
        description:
          'Read longer picture books with more complex stories and discuss them: "How do you think the bear felt? What would you do?" Encourage your child to tell their own stories about their day, their drawings, and their imaginative play. Storytelling builds narrative thinking, vocabulary, empathy, and imagination.',
        icon: '\u{1F4DA}',
        category: 'language',
      },
    ],
    sensoryDevelopment: [
      'Precision and refinement of hand-eye coordination are essentially complete',
      'Two hands work together in a fully coordinated way — toddler can make vertical, horizontal, and circular strokes',
      'The Explosive Epoch around 24 months drives a sudden increase in words, grammar, and phrase formation',
      'By 30-36 months, language development is considered complete; interest shifts to the written word',
      'Stereognostic sense develops — toddler can identify concealed objects using only touch memory',
    ],
    reflexes: [
      'All primitive reflexes have long been integrated',
      'Only permanent reflexes remain: eye blink, gag, yawn, cough, sneeze, lip quiver',
    ],
    touchAndBonding: [
      'Self-Affirmation stage begins around 2.5-3 years — toddler says "NO!" with real meaning; offer choices within limits',
      'Sensitive Period for manners operates during this stage — model graces and courtesies consistently in daily life',
      'Wonder and spirituality emerge: share the beauty of nature to connect your toddler with something greater than self',
      'Participation in family life builds social responsibility — your toddler can now do many daily tasks with confidence',
      'When tantrums occur, remain calm and predictably loving; request permission to hold your toddler, and stay available',
      'Art activities like clay work build hand strength, two-hand coordination, and offer rich new sensory experiences',
    ],
    communicationTips: [
      'Answer "why?" questions with genuine, simple explanations rather than dismissing them. If the questions become repetitive, turn it around: "Why do you think?" This encourages reasoning and shows that their curiosity is valued',
      'Have real conversations with your child — ask about their day, their feelings, their ideas. Listen attentively and respond thoughtfully. They are now capable of genuine dialogue and deserve to be taken seriously as conversation partners',
      'Read chapter books aloud, tell family stories, and discuss events together. Rich, sustained narrative language builds the comprehension and vocabulary that support later reading and academic success',
    ],
    independenceGains: [
      'Your child can manage most aspects of personal care: dressing, hand-washing, tooth-brushing, and toileting with decreasing assistance',
      'Complex household participation is possible: cooking simple dishes, cleaning up after activities, organizing their belongings, and caring for plants and pets',
      'Social independence grows as your child navigates friendships, resolves minor conflicts, and participates in group activities with increasing skill',
      'Intellectual independence deepens as your child asks questions, makes observations, solves problems, and generates ideas',
    ],
    environmentTips: [
      'Organize shelves with materials that invite multi-step, complex activities: art supplies, practical life tools, early math materials, and nature study equipment',
      'Prepare for Montessori preschool if applicable by visiting classrooms and gradually extending time away from home',
      'Provide real, functional tools sized for your child: a child-safe knife that actually cuts, a broom that actually sweeps, a pitcher that actually pours. Toy versions frustrate and do not build real skills',
      'Create a rich reading environment with a varied library of books accessible at your child\'s height, and a cozy, well-lit reading nook',
      'Maintain the prepared environment with your child\'s participation — tidying, organizing, and caring for the space becomes a shared responsibility',
    ],
    watchFor: [
      'Full sentences and complex language constructions that your child has never heard you say — this shows genuine language generation and grammar understanding',
      'Rich imaginative play with elaborate scenarios, character voices, and story arcs — this creativity is intellectual and emotional development in action',
      'Your child asking deep "why" questions and wrestling with the answers — this is the beginning of abstract reasoning and philosophical thought',
      'Extended concentration on complex projects — building elaborate structures, completing multi-step art projects, or spending extended time in the garden — showing the mature concentration that Montessori called the hallmark of the developing child',
    ],
  },
]

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Retrieve the monthly guide for a specific month number.
 * For months 1-14, provide the exact month number.
 * For grouped ranges, use: 15 (for 15-18), 18 (for 18-24), 24 (for 24-36).
 */
export function getMonthlyGuide(monthNumber: number): MonthlyGuide | undefined {
  return MONTHLY_GUIDES.find((guide) => guide.monthNumber === monthNumber)
}

/**
 * Calculate a child's age in months from their date of birth and return
 * the matching monthly guide.
 *
 * For months 1-14, returns the exact month match.
 * For 15-17 months, returns the 15-18 guide.
 * For 18-23 months, returns the 18-24 guide.
 * For 24-36 months, returns the 24-36 guide.
 * Returns undefined if the child is over 36 months or the date is invalid.
 */
export function getGuideForChildAge(dateOfBirth: string): MonthlyGuide | undefined {
  const dob = new Date(dateOfBirth)
  if (isNaN(dob.getTime())) {
    return undefined
  }

  const now = new Date()
  let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth())

  // Adjust if the current day of month is before the birth day of month
  if (now.getDate() < dob.getDate()) {
    months -= 1
  }

  // Newborns in their first month are month 1
  if (months < 1) {
    months = 1
  }

  if (months > 36) {
    return undefined
  }

  if (months <= 14) {
    return MONTHLY_GUIDES.find((guide) => guide.monthNumber === months)
  }

  if (months <= 17) {
    return MONTHLY_GUIDES.find((guide) => guide.monthNumber === 15)
  }

  if (months <= 23) {
    return MONTHLY_GUIDES.find((guide) => guide.monthNumber === 18)
  }

  // 24-36 months
  return MONTHLY_GUIDES.find((guide) => guide.monthNumber === 24)
}

/**
 * Return all monthly guides in order.
 */
export function getAllMonthlyGuides(): MonthlyGuide[] {
  return MONTHLY_GUIDES
}

/**
 * Return guides whose monthNumber falls within the given range (inclusive).
 * For example, getGuidesByRange(6, 12) returns guides for months 6 through 12.
 */
export function getGuidesByRange(startMonth: number, endMonth: number): MonthlyGuide[] {
  return MONTHLY_GUIDES.filter(
    (guide) => guide.monthNumber >= startMonth && guide.monthNumber <= endMonth
  )
}
