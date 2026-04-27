// Start Here — Static content for the parent onboarding guide
// Features, Day 1 actions, and ongoing rhythm recommendations

export interface StartHereFeature {
  id: string
  icon: string
  label: string
  href: string
  tagline: string
  whatYouCanDo: string[]
  proTip: string
  priority: 'essential' | 'recommended' | 'explore'
}

export interface Day1Action {
  id: string
  step: number
  title: string
  description: string
  href: string
  icon: string
  estimatedMinutes: number
}

export interface RhythmItem {
  action: string
  feature: string
  href: string
  icon: string
  whyItMatters: string
}

export interface RhythmCategory {
  id: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  label: string
  icon: string
  color: string
  items: RhythmItem[]
}

// ---------------------------------------------------------------------------
// Day 1 Actions — The 4 most impactful things a new parent should do first
// ---------------------------------------------------------------------------

export const DAY1_ACTIONS: Day1Action[] = [
  {
    id: 'add-child',
    step: 1,
    title: 'Add your child\'s profile',
    description: 'Set their name, birthday, and learning environment so Abigail can personalize everything to your child\'s age and stage.',
    href: '/dashboard/children',
    icon: '🌱',
    estimatedMinutes: 3,
  },
  {
    id: 'ask-guide',
    step: 2,
    title: 'Ask the Guide a question',
    description: 'Try asking "What should I focus on with my child this week?" or "How do I set up a reading corner?" — the AI knows your child\'s age and tailors every answer.',
    href: '/dashboard/chat',
    icon: '💬',
    estimatedMinutes: 3,
  },
  {
    id: 'first-observation',
    step: 3,
    title: 'Log your first observation',
    description: 'Watch your child for 5 minutes without interrupting. What are they drawn to? What are they practicing? Write down what you see — this is the foundation of Montessori parenting.',
    href: '/dashboard/children',
    icon: '📓',
    estimatedMinutes: 5,
  },
  {
    id: 'generate-plan',
    step: 4,
    title: 'Generate a daily plan',
    description: 'Choose 1-3 focus areas and get personalized activities with materials lists, presentation steps, and observation prompts — all matched to your child.',
    href: '/dashboard/plans',
    icon: '📋',
    estimatedMinutes: 3,
  },
]

// ---------------------------------------------------------------------------
// Features — All 12 app features with walkthroughs
// ---------------------------------------------------------------------------

export const START_HERE_FEATURES: StartHereFeature[] = [
  // ── Essential (start with these) ──
  {
    id: 'children',
    icon: '🌱',
    label: 'Children',
    href: '/dashboard/children',
    tagline: 'Your child\'s developmental profile and observation journal.',
    whatYouCanDo: [
      'Add child profiles with birthdates and learning environments',
      'Set development levels across 10 curriculum areas (Practical Life, Language, Math, etc.)',
      'Log daily observations — the heart of your Montessori practice',
    ],
    proTip: 'Observation is the cornerstone of Montessori. Even 2 minutes of watching without intervening teaches you more about your child than any book.',
    priority: 'essential',
  },
  {
    id: 'guide',
    icon: '💬',
    label: 'Abigail',
    href: '/dashboard/chat',
    tagline: 'Your personal AI Montessori advisor, available 24/7.',
    whatYouCanDo: [
      'Ask anything about Montessori philosophy, discipline, activities, or your child\'s development',
      'Get answers personalized to your child\'s age, development level, and your family context',
      'Save valuable responses to Memories for quick reference later',
    ],
    proTip: 'The Guide sees your child\'s profile, observations, and saved memories — the more you use the app, the more personalized the guidance becomes.',
    priority: 'essential',
  },
  {
    id: 'plans',
    icon: '📋',
    label: 'At-Home Learning',
    href: '/dashboard/plans',
    tagline: 'AI-generated learning plans for home — whether homeschooling or reinforcing school.',
    whatYouCanDo: [
      'Generate Daily, Weekly, Focus, or Catch-Up plans',
      'Get detailed activities with materials, presentation steps, and observation prompts',
      'Choose 1-3 curriculum areas to focus on, with optional constraints (time, materials, weather)',
    ],
    proTip: 'Start with a Daily Plan to get a feel for the activities. Once you\'re comfortable, try a Weekly Plan to build a rhythm your child can rely on.',
    priority: 'essential',
  },

  // ── Recommended (add these when comfortable) ──
  {
    id: 'journey',
    icon: '✨',
    label: 'Journey',
    href: '/dashboard/journey',
    tagline: 'Track your family\'s progress and celebrate growth.',
    whatYouCanDo: [
      'See your observation streaks, milestone counts, and curriculum progress at a glance',
      'For babies (0-36 months): access a month-by-month development guide with milestones and activities',
      'Reflect on growth with seasonal prompts and visual activity charts',
    ],
    proTip: 'This page becomes more meaningful over time. After a month of observations, you\'ll start seeing patterns you never noticed before.',
    priority: 'recommended',
  },
  {
    id: 'milestones',
    icon: '⭐',
    label: 'Milestones',
    href: '/dashboard/milestones',
    tagline: 'Age-appropriate developmental milestones to observe and celebrate.',
    whatYouCanDo: [
      'Browse milestones across all 10 curriculum areas, filtered to your child\'s age',
      'Check off milestones as you observe them — no pressure, just documentation',
      'See your child\'s overall milestone progress with visual indicators',
    ],
    proTip: 'Milestones are not deadlines — they\'re guideposts. Every child follows their own timeline. Use these to know what to look for, not what to worry about.',
    priority: 'recommended',
  },
  {
    id: 'curriculum',
    icon: '🎯',
    label: 'Curriculum',
    href: '/dashboard/curriculum',
    tagline: 'The full Montessori scope and sequence — 2,566 skills across all areas.',
    whatYouCanDo: [
      'Explore skills organized by curriculum area and sub-area',
      'Track your child\'s progress through the sequence (Introduced → Practicing → Mastered)',
      'Discover what comes next in each learning area to guide your planning',
    ],
    proTip: 'You don\'t need to cover every skill. Browse this when you\'re looking for what to introduce next, or when the Guide suggests an area to focus on.',
    priority: 'recommended',
  },
  {
    id: 'reports',
    icon: '📊',
    label: 'Reports',
    href: '/dashboard/reports',
    tagline: 'Beautiful progress reports, portfolios, and conference prep.',
    whatYouCanDo: [
      'Generate AI-written progress reports summarizing your child\'s development',
      'Create homeschool portfolio documentation for compliance',
      'Prepare for parent-teacher conferences with organized talking points',
    ],
    proTip: 'Generate your first report after 2-3 weeks of observations. The AI synthesizes your notes into insights you might have missed.',
    priority: 'recommended',
  },

  // ── Explore (use as needed) ──
  {
    id: 'environment',
    icon: '🏡',
    label: 'Environment',
    href: '/dashboard/environment',
    tagline: 'Room-by-room guide to creating Montessori-friendly spaces at home.',
    whatYouCanDo: [
      'Get setup tips, shopping suggestions, and safety checklists for every room',
      'Browse inspiration photos and videos of real Montessori home environments',
      'Find quick wins you can do today with no purchases needed',
    ],
    proTip: 'The prepared environment is one of Montessori\'s most powerful ideas. Start with the entryway — a low hook and a mirror can transform your child\'s independence in minutes.',
    priority: 'explore',
  },
  {
    id: 'schools',
    icon: '🏫',
    label: 'Schools',
    href: '/dashboard/schools',
    tagline: 'Evaluate and compare Montessori schools with a guided tour checklist.',
    whatYouCanDo: [
      'Use a structured questionnaire to evaluate schools during tours',
      'Get AI-powered analysis of each school\'s Montessori authenticity',
      'Compare multiple schools side-by-side with strengths and concerns highlighted',
    ],
    proTip: 'Take the checklist on your phone during school tours. Rate each area in real-time, then review the AI analysis at home.',
    priority: 'explore',
  },
  {
    id: 'library',
    icon: '📚',
    label: 'Library',
    href: '/dashboard/library',
    tagline: '900+ articles and videos covering every aspect of Montessori education.',
    whatYouCanDo: [
      'Search articles by topic, category, or keyword',
      'Watch embedded video lessons on practical topics',
      'Deepen your understanding of Montessori philosophy and practice',
    ],
    proTip: 'When the Guide recommends an article, it links directly to your Library. Think of the Library as your reference bookshelf and the Guide as your mentor.',
    priority: 'explore',
  },
  {
    id: 'memories',
    icon: '💭',
    label: 'Memories',
    href: '/dashboard/memories',
    tagline: 'Your saved collection of the most valuable AI guidance.',
    whatYouCanDo: [
      'Review guidance you\'ve saved from conversations with the Guide',
      'Add custom labels to organize your saved insights',
      'The Guide can see your Memories and reference them in future conversations',
    ],
    proTip: 'When the Guide gives you advice that clicks — save it. Over time, your Memories become a personalized Montessori handbook written just for your family.',
    priority: 'explore',
  },
  {
    id: 'notes',
    icon: '📝',
    label: 'Notes',
    href: '/dashboard/notes',
    tagline: 'A simple space for your own thoughts, plans, and reflections.',
    whatYouCanDo: [
      'Jot down ideas, conference notes, or things to discuss with your Guide',
      'Keep a running list of materials to buy or activities to try',
      'Reflect on your own growth as a Montessori parent',
    ],
    proTip: 'Some parents use Notes as a weekly reflection journal. Even one sentence on Sunday evening — "This week I noticed..." — builds remarkable awareness over time.',
    priority: 'explore',
  },
]

// ---------------------------------------------------------------------------
// Rhythm Guide — What to do daily, weekly, monthly, quarterly
// ---------------------------------------------------------------------------

export const RHYTHM_CATEGORIES: RhythmCategory[] = [
  {
    id: 'daily',
    label: 'Daily',
    icon: '☀️',
    color: 'warm',
    items: [
      {
        action: 'Log one observation',
        feature: 'Children',
        href: '/dashboard/children',
        icon: '📓',
        whyItMatters: 'Small daily notes compound into deep understanding of your child. Even one sentence counts.',
      },
      {
        action: 'Ask the Guide one question',
        feature: 'Guide',
        href: '/dashboard/chat',
        icon: '💬',
        whyItMatters: 'Keep the conversation going — the more context the Guide has, the better the advice gets.',
      },
    ],
  },
  {
    id: 'weekly',
    label: 'Weekly',
    icon: '📆',
    color: 'blue',
    items: [
      {
        action: 'Generate a new learning plan',
        feature: 'At-Home Learning',
        href: '/dashboard/plans',
        icon: '📋',
        whyItMatters: 'Fresh plans keep activities aligned with your child\'s current interests and development.',
      },
      {
        action: 'Review the week\'s observations',
        feature: 'Children',
        href: '/dashboard/children',
        icon: '🔍',
        whyItMatters: 'Patterns emerge when you read observations together. You\'ll spot interests and breakthroughs you missed in the moment.',
      },
      {
        action: 'Check milestone progress',
        feature: 'Milestones',
        href: '/dashboard/milestones',
        icon: '⭐',
        whyItMatters: 'Celebrating progress — even small steps — reinforces your own commitment and builds confidence.',
      },
    ],
  },
  {
    id: 'monthly',
    label: 'Monthly',
    icon: '🗓️',
    color: 'violet',
    items: [
      {
        action: 'Generate a progress report',
        feature: 'Reports',
        href: '/dashboard/reports',
        icon: '📊',
        whyItMatters: 'A monthly snapshot helps you see the forest, not just the trees. Share it with your partner or co-parent.',
      },
      {
        action: 'Rotate materials at home',
        feature: 'Environment',
        href: '/dashboard/environment',
        icon: '🏡',
        whyItMatters: 'Fresh materials reignite curiosity. The Environment page has suggestions matched to your child\'s age.',
      },
      {
        action: 'Browse 2-3 new articles',
        feature: 'Library',
        href: '/dashboard/library',
        icon: '📚',
        whyItMatters: 'Deepening your own understanding makes you a more confident, responsive parent.',
      },
    ],
  },
  {
    id: 'quarterly',
    label: 'Quarterly',
    icon: '🌿',
    color: 'amber',
    items: [
      {
        action: 'Review the Journey page',
        feature: 'Journey',
        href: '/dashboard/journey',
        icon: '✨',
        whyItMatters: 'Step back and see the bigger picture — how far your family has come on this path.',
      },
      {
        action: 'Update development levels',
        feature: 'Children',
        href: '/dashboard/children',
        icon: '📈',
        whyItMatters: 'As your child grows, their development levels change. Keeping them current improves all AI recommendations.',
      },
      {
        action: 'Evaluate curriculum progress',
        feature: 'Curriculum',
        href: '/dashboard/curriculum',
        icon: '🎯',
        whyItMatters: 'Identify areas that need attention and discover skills your child is ready to explore next.',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getFeaturesByPriority(priority: 'essential' | 'recommended' | 'explore'): StartHereFeature[] {
  return START_HERE_FEATURES.filter(f => f.priority === priority)
}
