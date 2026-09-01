// Family Home content layer — Phase 1 parent Home redesign.
//
// This module maps EXISTING data (sensitive periods, seo-content activities,
// monthly development guides, articles, development levels) into the small,
// parent-friendly shapes the new Home screen renders. It introduces no new
// backend — everything here is presentation logic.

import type { Child } from '@/lib/supabase'
import { getAgePlane } from '@/lib/utils'
import { getGuideForChildAge } from '@/lib/monthly-development'
import { ACTIVITY_PAGES } from '@/lib/seo-content'
import { getAllArticles, type Article } from '@/lib/articles'

// ── Sensitive periods (moved unchanged from the old dashboard page) ──
export const SENSITIVE_PERIODS: Array<{
  name: string; minMonths: number; maxMonths: number; peakMin: number; peakMax: number;
  description: string; parentTip: string; icon: string;
}> = [
  { name: 'Order', minMonths: 12, maxMonths: 42, peakMin: 18, peakMax: 30, icon: '🧩',
    description: 'Your child has a deep need for consistency, routine, and knowing where things belong.',
    parentTip: 'Keep the environment consistent. Prepare them for transitions. If they get upset about something being "wrong," respect it — this need is real.' },
  { name: 'Language', minMonths: 0, maxMonths: 72, peakMin: 24, peakMax: 48, icon: '🗣️',
    description: 'Your child is absorbing language at an extraordinary rate right now.',
    parentTip: 'Narrate your day. Use precise vocabulary. Read aloud daily. Name everything. When letter interest appears, teach sounds (/mmm/) not names ("em").' },
  { name: 'Movement', minMonths: 0, maxMonths: 48, peakMin: 12, peakMax: 36, icon: '🏃',
    description: 'Your child is driven to refine both gross and fine motor control.',
    parentTip: 'Maximize safe movement opportunities. Walking to the mailbox IS the activity. Offer pouring, transferring, and threading for fine motor development.' },
  { name: 'Small Objects', minMonths: 12, maxMonths: 36, peakMin: 14, peakMax: 30, icon: '🔍',
    description: 'Your child is fascinated by tiny things — crumbs, insects, beads, buttons.',
    parentTip: 'This is preparing the pincer grip for writing. Offer safe sorting activities with increasingly small items. Supervise but don\'t discourage the interest.' },
  { name: 'Refinement of Senses', minMonths: 24, maxMonths: 72, peakMin: 30, peakMax: 60, icon: '👁️',
    description: 'Your child is driven to classify and discriminate through all their senses.',
    parentTip: 'Provide rich sensory experiences. Name qualities precisely: "rough," "smooth," "heavy," "light." Sensorial work is the foundation for math and science.' },
  { name: 'Social Behavior', minMonths: 30, maxMonths: 60, peakMin: 30, peakMax: 48, icon: '🤝',
    description: 'Your child is intensely interested in how people interact and behave.',
    parentTip: 'Grace and courtesy lessons land powerfully now. Model the behavior you want to see. Give explicit demonstrations of greetings, turn-taking, and polite requests.' },
  { name: 'Writing', minMonths: 42, maxMonths: 60, peakMin: 42, peakMax: 54, icon: '✏️',
    description: 'Your child may be ready to encode — expressing their thoughts in written symbols.',
    parentTip: 'If they know letter sounds, introduce the Moveable Alphabet. Let them "write" before their hand is ready for a pencil. Accept all phonetic spellings — "sed" for "said" is brilliant.' },
  { name: 'Reading', minMonths: 54, maxMonths: 78, peakMin: 54, peakMax: 66, icon: '📖',
    description: 'Your child may be on the verge of the explosion into reading.',
    parentTip: 'Have books everywhere. Read aloud daily. Don\'t drill — the child will read when the preceding work (sounds, encoding, phonograms) has prepared them.' },
  { name: 'Math', minMonths: 48, maxMonths: 72, peakMin: 48, peakMax: 66, icon: '🔢',
    description: 'Your child is drawn to counting, quantity, patterns, and operations.',
    parentTip: 'Count everything in real life. Bake together (measuring). Let them handle money. If they can count to 10 with objects, they may be ready for golden bead work.' },
]

export function getAgeMonths(dateOfBirth: string | Date | null): number | null {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  return Math.floor((Date.now() - dob.getTime()) / (30.44 * 86400000))
}

export function getActiveSensitivePeriods(child: Child) {
  const ageMonths = getAgeMonths(child.date_of_birth)
  if (ageMonths === null) return []
  return SENSITIVE_PERIODS
    .filter(sp => ageMonths >= sp.minMonths && ageMonths <= sp.maxMonths)
    .map(sp => ({ ...sp, isPeak: ageMonths >= sp.peakMin && ageMonths <= sp.peakMax }))
}

// ── Hero insight ──

export interface HeroInsight {
  eyebrow: string
  title: string
  description: string
  tryTitle: string
  tryDetail: string
  meta: string
  abigailPrompt: string
  /** Longer guidance shown in the "Show Me How" sheet (e.g. the full parentTip) */
  moreDetail?: string
}

// Parent-friendly hero content per sensitive period. The raw parentTip text is
// too dense for a hero — each period gets one short insight and one action.
const PERIOD_HERO: Record<string, {
  title: string
  description: (name: string) => string
  tryTitle: string
  tryDetail: string
  duration: string
  ages: string
}> = {
  'Order': {
    title: 'Order matters deeply right now.',
    description: n => `${n} is drawn to consistency and routine — knowing where things belong helps them feel calm and capable.`,
    tryTitle: 'Give one thing a forever home.',
    tryDetail: 'Shoes by the door, cup on the low shelf. Show it once, then let them return it there themselves.',
    duration: '5 min', ages: 'Ages 1½–2½',
  },
  'Language': {
    title: 'Language is especially active.',
    description: n => `${n} is absorbing words quickly and may be especially interested in naming, conversation, sounds and stories.`,
    tryTitle: 'Name everything on your walk.',
    tryDetail: 'Trees, bark, gravel, clouds, branches, shadows.',
    duration: '10 min', ages: 'Ages 2–4',
  },
  'Movement': {
    title: 'Movement is the work right now.',
    description: n => `${n} is driven to refine how their body moves — carrying, climbing, pouring, balancing. The wiggles have a purpose.`,
    tryTitle: 'Let the errand be the activity.',
    tryDetail: 'Walk to the mailbox at their pace. Let them carry something real — a small bag, the letters, a watering can.',
    duration: '15 min', ages: 'Ages 1–3',
  },
  'Small Objects': {
    title: 'Tiny things are fascinating.',
    description: n => `${n} is drawn to crumbs, pebbles, beads and buttons. This interest is quietly building the grip they'll one day write with.`,
    tryTitle: 'Set up a simple sorting tray.',
    tryDetail: 'Two bowls, a handful of large buttons or walnuts. Sort together, then let them repeat. Stay close and supervise.',
    duration: '10 min', ages: 'Ages 1–2½',
  },
  'Refinement of Senses': {
    title: 'The senses are sharpening.',
    description: n => `${n} is learning to notice fine differences — textures, sounds, weights, shades. Precise words help them organize it all.`,
    tryTitle: 'Play "rough or smooth" around the house.',
    tryDetail: 'Touch bark, glass, a towel, a spoon. Name each quality precisely: rough, smooth, heavy, light, warm, cool.',
    duration: '10 min', ages: 'Ages 2½–5',
  },
  'Social Behavior': {
    title: 'How people treat each other has their full attention.',
    description: n => `${n} is watching closely how we greet, wait, ask and thank. Lessons in grace and courtesy land powerfully now.`,
    tryTitle: 'Practice one small courtesy.',
    tryDetail: 'Show how to greet someone by name, or how to say "excuse me" and wait. Make it a tiny role-play, not a correction.',
    duration: '5 min', ages: 'Ages 2½–4',
  },
  'Writing': {
    title: 'Writing may be ready to bloom.',
    description: n => `${n} may be ready to put thoughts into symbols — often before their hand is ready for a pencil.`,
    tryTitle: 'Write a word with letter sounds.',
    tryDetail: 'Use magnetic or cut-out letters. Sound out something they love — /c/ /a/ /t/. Accept every phonetic spelling.',
    duration: '10 min', ages: 'Ages 3½–5',
  },
  'Reading': {
    title: 'The reading explosion may be near.',
    description: n => `${n} may be on the verge of putting sounds together into words. No drilling needed — just books, everywhere.`,
    tryTitle: 'Read aloud, then let them find one word.',
    tryDetail: 'Pick a favorite book. After reading, ask them to spot one small word they know — "cat", "the", their name.',
    duration: '15 min', ages: 'Ages 4½–5½',
  },
  'Math': {
    title: 'Numbers are calling.',
    description: n => `${n} is drawn to counting, quantity and patterns — and real life is the best math material there is.`,
    tryTitle: 'Bake something together.',
    tryDetail: 'Let them measure, count scoops, and divide the dough. Measuring is math they can eat.',
    duration: '30 min', ages: 'Ages 4–5½',
  },
}

const PLANE_GENERIC_HERO: Record<string, Omit<HeroInsight, 'eyebrow' | 'abigailPrompt'>> = {
  '0-3': {
    title: 'Independence starts tiny.',
    description: 'At this age, real objects and real tasks beat any toy. Your child wants to do what you do.',
    tryTitle: 'Invite them into one real task.',
    tryDetail: 'Wiping the table, carrying laundry, watering one plant. Slow down and let them finish it.',
    meta: '10 min · Practical Life',
  },
  '3-6': {
    title: 'This is the age of "I can do it myself."',
    description: 'Concentration, coordination and independence are all growing fast — real work feeds all three.',
    tryTitle: 'Hand over one daily job.',
    tryDetail: 'Pouring their own water, buttering toast, feeding a pet. Show it slowly once, then step back.',
    meta: '10 min · Practical Life · Ages 3–6',
  },
  '6-9': {
    title: 'The age of big questions.',
    description: 'Your child\'s imagination and sense of justice are expanding. They want to know how everything connects.',
    tryTitle: 'Follow one "why" all the way down.',
    tryDetail: 'Take their next big question seriously. Look it up together, draw it, or plan a small experiment.',
    meta: '20 min · Curiosity · Ages 6–9',
  },
  '9-12': {
    title: 'Ready for real responsibility.',
    description: 'Your child is craving independence with meaning — real projects, real contribution, real trust.',
    tryTitle: 'Put them in charge of something real.',
    tryDetail: 'Planning one family dinner, managing a small budget, organizing an outing. Let them own it end to end.',
    meta: '30 min · Independence · Ages 9–12',
  },
  '12+': {
    title: 'Connection over correction.',
    description: 'Adolescents grow through meaningful work and being taken seriously. One real conversation beats ten reminders.',
    tryTitle: 'Have one logistics-free conversation.',
    tryDetail: 'Ask what they\'re building, making, or thinking about lately — and just listen.',
    meta: '15 min · Connection · Ages 12+',
  },
}

const AREA_LABELS: Record<string, string> = {
  practical_life: 'Practical Life', sensorial: 'Sensorial', language: 'Language',
  mathematics: 'Mathematics', cultural_studies: 'Cultural Studies',
  social_emotional: 'Social & Emotional', executive_function: 'Executive Function',
  gross_motor: 'Gross Motor', fine_motor: 'Fine Motor', art_music: 'Art & Music',
}

function dayOfYear(): number {
  return Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
}

export function getHeroInsight(
  child: Child,
  devLevels?: Array<{ area: string; level: number | null }>,
): HeroInsight {
  const first = firstName(child.name)
  const eyebrow = `${first} right now`.toUpperCase()

  // 1. Peak sensitive period (rotates daily when several are at peak)
  const peaks = getActiveSensitivePeriods(child).filter(p => p.isPeak)
  if (peaks.length > 0) {
    const period = peaks[dayOfYear() % peaks.length]
    const hero = PERIOD_HERO[period.name]
    if (hero) {
      return {
        eyebrow,
        title: hero.title,
        description: hero.description(first),
        tryTitle: hero.tryTitle,
        tryDetail: hero.tryDetail,
        meta: `${hero.duration} · ${period.name} · ${hero.ages}`,
        abigailPrompt: `${first} is in a sensitive period for ${period.name.toLowerCase()}. What should we be doing at home?`,
        moreDetail: period.parentTip,
      }
    }
  }

  // 2. Development area with momentum (highest assessed level)
  const assessed = (devLevels || []).filter(l => l.level && l.level >= 3)
    .sort((a, b) => (b.level || 0) - (a.level || 0))
  if (assessed.length > 0) {
    const areaLabel = AREA_LABELS[assessed[0].area] || assessed[0].area
    return {
      eyebrow,
      title: `${areaLabel} is a bright spot.`,
      description: `${first} is showing real momentum in ${areaLabel.toLowerCase()}. Following a strength is the easiest way to deepen concentration.`,
      tryTitle: `Offer one step more challenge.`,
      tryDetail: `Pick the ${areaLabel.toLowerCase()} activity ${first} loves most and add one small twist — a bigger pitcher, a longer story, a harder puzzle.`,
      meta: `15 min · ${areaLabel}`,
      abigailPrompt: `${first} is doing really well with ${areaLabel.toLowerCase()}. How can we build on that at home?`,
    }
  }

  // 3. Monthly developmental guide (babies and toddlers)
  if (child.date_of_birth) {
    const ageMonths = getAgeMonths(child.date_of_birth)
    if (ageMonths !== null && ageMonths <= 36) {
      const guide = getGuideForChildAge(child.date_of_birth)
      const activity = guide?.activities?.[0]
      if (guide && activity) {
        return {
          eyebrow,
          title: guide.tagline,
          description: guide.communication[0] || guide.socialEmotional[0] || '',
          tryTitle: activity.name,
          tryDetail: activity.description,
          meta: `10 min · ${guide.monthLabel}`,
          abigailPrompt: `What matters most for ${first} developmentally at ${guide.monthLabel.toLowerCase()}?`,
        }
      }
    }
  }

  // 4. Generic age-plane recommendation
  const plane = getAgePlane(child.date_of_birth)
  const generic = PLANE_GENERIC_HERO[plane] || PLANE_GENERIC_HERO['3-6']
  return {
    eyebrow,
    ...generic,
    abigailPrompt: `What should we focus on with ${first} this week?`,
  }
}

// ── Activities for the Home carousel ──

export interface HomeActivity {
  id: string
  name: string
  category: string
  duration: string
  ages: string
  image: string
  description: string
  materials: string[]
  presentation: string[]
  whyItMatters: string
  diyTip?: string
}

const AREA_IMAGES: Record<string, string> = {
  sensorial: '/images/environment/play-area.jpg',
  practical_life: '/images/environment/living-room-setup.jpg',
  language: '/images/environment/girl-reading.jpg',
  gross_motor: '/images/environment/boy-outdoor.jpg',
  fine_motor: '/images/environment/playroom.jpg',
  mathematics: '/images/environment/playroom.jpg',
  art_music: '/images/environment/girls-art.jpg',
  cultural_studies: '/images/environment/reading-nook.jpg',
  baby: '/images/environment/baby-playing.jpg',
}

const DURATIONS = ['10 min', '15 min', '10 min', '20 min', '15 min']

// Which seo-content activity page fits which age (in months).
function activitySlugForAge(ageMonths: number): string | null {
  if (ageMonths < 9) return '6-months'
  if (ageMonths < 18) return '1-year'
  if (ageMonths < 30) return '2-years'
  if (ageMonths < 42) return '3-years'
  if (ageMonths < 54) return '4-years'
  if (ageMonths < 78) return '5-years'
  return null
}

const SLUG_AGES: Record<string, string> = {
  '6-months': '6–12 mo', '1-year': 'Age 1–2', '2-years': 'Age 2–3',
  '3-years': 'Age 3–4', '4-years': 'Age 4–5', '5-years': 'Age 5–6',
}

// Hand-curated activities for children older than the seo-content pages cover.
const OLDER_ACTIVITIES: Record<string, HomeActivity[]> = {
  '6-9': [
    { id: 'older-cooking', name: 'Cook One Dish Solo', category: 'Practical Life', duration: '30 min', ages: 'Ages 6–9',
      image: AREA_IMAGES.practical_life,
      description: 'Your child prepares one simple dish from start to finish — including cleanup.',
      materials: ['A simple recipe (3–5 steps)', 'Real kitchen tools', 'Ingredients set out together'],
      presentation: ['Choose the recipe together', 'Walk through it once, then step back', 'Let them plate and serve it to the family', 'Cleanup is part of the work'],
      whyItMatters: 'Multi-step real work builds executive function, sequencing, and the deep pride of genuine contribution.' },
    { id: 'older-research', name: 'Mini Research Project', category: 'Curiosity', duration: '30 min', ages: 'Ages 6–9',
      image: AREA_IMAGES.cultural_studies,
      description: 'Follow one of their big questions with books, drawings, and a small presentation.',
      materials: ['Paper and pencils', 'A library book or safe search together'],
      presentation: ['Start from a question they actually asked', 'Gather 3 facts together', 'Let them draw or write what they found', 'Invite them to present it at dinner'],
      whyItMatters: 'The elementary child has a reasoning, imaginative mind. Research they own turns curiosity into concentration.' },
    { id: 'older-nature', name: 'Nature Collection Walk', category: 'Cultural Studies', duration: '20 min', ages: 'Ages 6–9',
      image: AREA_IMAGES.gross_motor,
      description: 'Collect, classify and label finds from a walk — leaves, seeds, stones.',
      materials: ['A small bag or basket', 'Paper for labels'],
      presentation: ['Collect anything interesting (that\'s allowed to be taken)', 'Sort finds into groups at home', 'Label each group together', 'Display the collection on a shelf'],
      whyItMatters: 'Classification is the elementary mind\'s favorite work — it organizes the world and prepares scientific thinking.' },
    { id: 'older-money', name: 'Shop With a Budget', category: 'Mathematics', duration: '30 min', ages: 'Ages 6–9',
      image: AREA_IMAGES.mathematics,
      description: 'Hand over a small real budget for one part of the grocery run.',
      materials: ['A short shopping list', 'Cash they can count'],
      presentation: ['Agree the budget before the store', 'They find the items and compare prices', 'They pay and check the change', 'Talk about what was left over'],
      whyItMatters: 'Real money makes arithmetic meaningful — estimation, addition and subtraction with real consequences.' },
  ],
  '9-12': [
    { id: 'tween-dinner', name: 'Plan a Family Dinner', category: 'Independence', duration: '45 min', ages: 'Ages 9–12',
      image: AREA_IMAGES.practical_life,
      description: 'They plan the menu, budget, shopping list — and lead the cooking.',
      materials: ['A budget', 'Recipe books or family favorites'],
      presentation: ['They choose the menu within the budget', 'They write the shopping list', 'They lead the cooking with you as assistant', 'They run the meal'],
      whyItMatters: 'Upper elementary children crave real responsibility. Owning a project end-to-end builds planning, math, and confidence.' },
    { id: 'tween-project', name: 'Passion Project Hour', category: 'Curiosity', duration: '60 min', ages: 'Ages 9–12',
      image: AREA_IMAGES.cultural_studies,
      description: 'One protected hour a week for whatever they are building, making or mastering.',
      materials: ['Whatever their project needs', 'A visible spot to keep work-in-progress'],
      presentation: ['Let them pick the project — no steering', 'Protect the time like an appointment', 'Ask to be shown, not to inspect', 'Help source materials when asked'],
      whyItMatters: 'Sustained self-chosen work is where concentration, grit and identity grow at this age.' },
    { id: 'tween-service', name: 'Contribute Beyond Home', category: 'Community', duration: '60 min', ages: 'Ages 9–12',
      image: AREA_IMAGES.gross_motor,
      description: 'Find one way to help someone outside the family — a neighbor, a cause, a place.',
      materials: ['None — just a conversation to choose it'],
      presentation: ['Brainstorm who could use help', 'Let them pick and plan the how', 'Do it alongside them the first time', 'Reflect afterward: how did it feel?'],
      whyItMatters: 'The 9–12 child is developing a moral compass. Real contribution answers their growing question: "Do I matter?"' },
  ],
  '12+': [
    { id: 'teen-venture', name: 'Micro-Business Experiment', category: 'Independence', duration: 'Ongoing', ages: 'Ages 12+',
      image: AREA_IMAGES.practical_life,
      description: 'Support one small real venture — baked goods, lawn care, digital art, tutoring.',
      materials: ['A simple plan: what, for whom, at what price'],
      presentation: ['They write the one-page plan', 'Front the tiny startup cost as a loan', 'They track money in and out', 'Review together monthly — their call what changes'],
      whyItMatters: 'Montessori called adolescence the age of economic independence. Real stakes teach more than any worksheet.' },
    { id: 'teen-meal', name: 'Own a Weekly Meal', category: 'Contribution', duration: '60 min', ages: 'Ages 12+',
      image: AREA_IMAGES.mathematics,
      description: 'One night a week is fully theirs: menu, shopping, cooking, hosting.',
      materials: ['A weekly budget', 'Their pick of recipes'],
      presentation: ['Agree the night and the budget', 'Everything else is theirs to run', 'Eat what is served, gratefully', 'Resist the urge to rescue'],
      whyItMatters: 'Regular meaningful contribution is what adolescents need most — visible proof they are necessary to the family.' },
    { id: 'teen-talk', name: 'The No-Logistics Walk', category: 'Connection', duration: '30 min', ages: 'Ages 12+',
      image: AREA_IMAGES.gross_motor,
      description: 'A regular walk with one rule: no schedules, no grades, no reminders.',
      materials: ['None'],
      presentation: ['Invite, don\'t require', 'Side-by-side beats face-to-face for teens', 'Ask about what they\'re making or thinking', 'Mostly: listen'],
      whyItMatters: 'Connection is the channel everything else flows through. Walking side by side lowers the stakes enough for real talk.' },
  ],
}

export function getHomeActivities(child: Child): HomeActivity[] {
  const ageMonths = getAgeMonths(child.date_of_birth)
  if (ageMonths === null) return OLDER_ACTIVITIES['6-9']

  const slug = activitySlugForAge(ageMonths)
  if (!slug) {
    const plane = getAgePlane(child.date_of_birth)
    return OLDER_ACTIVITIES[plane] || OLDER_ACTIVITIES['12+']
  }

  const page = ACTIVITY_PAGES.find(p => p.slug === slug)
  if (!page) return OLDER_ACTIVITIES['6-9']

  const flat: HomeActivity[] = []
  page.categories.forEach(cat => {
    cat.activities.forEach((a, i) => {
      flat.push({
        id: `${slug}-${cat.area}-${i}`,
        name: a.name,
        category: cat.areaLabel,
        duration: DURATIONS[flat.length % DURATIONS.length],
        ages: SLUG_AGES[slug] || '',
        image: AREA_IMAGES[cat.area] || (ageMonths < 15 ? AREA_IMAGES.baby : AREA_IMAGES.practical_life),
        description: a.description,
        materials: a.materials,
        presentation: a.presentation,
        whyItMatters: a.whyItMatters,
        diyTip: a.diyTip,
      })
    })
  })
  // Rotate the starting point daily so the shelf feels alive, cap at 5.
  const start = flat.length > 0 ? dayOfYear() % flat.length : 0
  const rotated = [...flat.slice(start), ...flat.slice(0, start)]
  return rotated.slice(0, 5)
}

// ── Parent-facing development labels (internal 1–5 storage unchanged) ──

export function getParentLevelLabel(level: number | null | undefined): string {
  if (!level) return 'Just beginning'
  const labels = ['', 'Exploring', 'Emerging', 'Practicing', 'Growing Strong', 'Confident']
  return labels[level] || 'Just beginning'
}

export function getAreaLabel(area: string): string {
  return AREA_LABELS[area] || area
}

// ── Observation prompts (moved unchanged from the old dashboard page) ──

const OBSERVATION_PROMPTS: Record<string, string[]> = {
  '0-3': [
    'What did your child try to do independently today?',
    'Did you notice any new words or sounds?',
    'What held their attention the longest?',
    'Did they show interest in helping with a household task?',
    'How did they react to a change in routine?',
    'What small objects fascinated them today?',
  ],
  '3-6': [
    'What activity did your child choose to repeat today?',
    'Did you notice deep concentration? What triggered it?',
    'What new skill is emerging — even if imperfect?',
    'Did they show interest in letters, sounds, or numbers?',
    'How did they handle a frustration or challenge?',
    'What did they want to do "by myself"?',
  ],
  '6-9': [
    'What question did your child ask today that surprised you?',
    'Did they work collaboratively with another child?',
    'What topic sparked their curiosity?',
    'Did you notice their sense of fairness or justice?',
    'What research or project captured their interest?',
    'How did they handle a peer disagreement?',
  ],
  '9-12': [
    'What big question is your child thinking about?',
    'What project are they most invested in right now?',
    'How are they contributing to the family or community?',
    'What abstract concept are they grappling with?',
    'Did you notice leadership or mentoring behavior?',
    'What challenge did they persevere through?',
  ],
  '12+': [
    'What is your teen passionate about this week?',
    'How did they contribute meaningfully — to family, friends, or community?',
    'What decision did they make independently?',
    'Did you have a real conversation (not logistics) today?',
    'What are they creating, building, or working toward?',
    'Where did you see them showing responsibility?',
  ],
}

export function getTodayPrompt(child: Child): string {
  const plane = getAgePlane(child.date_of_birth)
  const prompts = OBSERVATION_PROMPTS[plane] || OBSERVATION_PROMPTS['3-6']
  const base = prompts[dayOfYear() % prompts.length]
  // Personalize the generic "your child" phrasing with the child's name.
  return base.replace('your child', firstName(child.name)).replace('your teen', firstName(child.name))
}

// ── One learning recommendation ──

const PLANE_ARTICLE_CATEGORIES: Record<string, string[]> = {
  '0-3': ['Infant-Toddler (0 to 3)', 'Toddler (18 months-3 years)'],
  '3-6': ['Primary (3-6)'],
  '6-9': ['Lower Elementary (6-9)'],
  '9-12': ['Upper Elementary (9-12)'],
  '12+': ['Early Adolescence (12-15)', 'Montessori Middle School', 'Montessori Secondary / High School'],
}

export function getLearningRecommendation(child: Child | undefined): Article {
  const sorted = getAllArticles()
    .slice()
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  if (child) {
    const plane = getAgePlane(child.date_of_birth)
    const wanted = PLANE_ARTICLE_CATEGORIES[plane]
    if (wanted) {
      const matches = sorted.filter(a => a.categories.some(c => wanted.includes(c)))
      if (matches.length > 0) return matches[dayOfYear() % Math.min(matches.length, 8)]
    }
  }
  return sorted[0]
}

function firstName(name: string): string {
  return (name || '').trim().split(/\s+/)[0] || name
}
