// Abigail experience helpers (Phase 3) — all deterministic, no AI calls.
// Suggested prompts, light topic classification, follow-up chips, and the
// safe pathways from a conversation to activities / Foundation content.

import type { Child } from '@/lib/supabase'
import { getAgePlane } from '@/lib/utils'
import { getHomeActivities, type HomeActivity } from '@/lib/family-home'
import { getAllArticleMeta, type ArticleMeta } from '@/lib/articles-metadata'
import { EXPLORE_TOPICS } from '@/lib/explore'

function firstName(name: string): string {
  return (name || '').trim().split(/\s+/)[0] || name
}

// ── Suggested prompts (empty state) ──

export interface SuggestedPrompt {
  text: string
  icon: 'sprout' | 'heart' | 'repeat' | 'cloud' | 'book' | 'home' | 'compass' | 'star'
  tone: 'sage' | 'warm' | 'purple' | 'cream'
}

const GENERAL_PROMPTS: SuggestedPrompt[] = [
  { text: 'What makes Montessori different?', icon: 'compass', tone: 'purple' },
  { text: 'How do I encourage independence?', icon: 'sprout', tone: 'sage' },
  { text: 'How should I set up our home?', icon: 'home', tone: 'warm' },
  { text: 'What should I know about sensitive periods?', icon: 'book', tone: 'cream' },
]

export function getSuggestedPrompts(child: Child | undefined): SuggestedPrompt[] {
  if (!child) return GENERAL_PROMPTS
  const n = firstName(child.name)
  const plane = getAgePlane(child.date_of_birth)

  if (plane === '0-3' || plane === '3-6') {
    return [
      { text: `How can I encourage more independence?`, icon: 'sprout', tone: 'sage' },
      { text: `What should we work on this week?`, icon: 'star', tone: 'purple' },
      { text: `Why is ${n} repeating the same activity?`, icon: 'repeat', tone: 'cream' },
      { text: `How should I handle a tantrum?`, icon: 'cloud', tone: 'warm' },
    ]
  }
  if (plane === '6-9' || plane === '9-12') {
    return [
      { text: `How do I support motivation without rewards?`, icon: 'star', tone: 'purple' },
      { text: `What can we do at home for math?`, icon: 'book', tone: 'cream' },
      { text: `How do I encourage responsibility?`, icon: 'sprout', tone: 'sage' },
      { text: `What should I notice at this age?`, icon: 'compass', tone: 'warm' },
    ]
  }
  return [
    { text: `How do I stay connected with ${n}?`, icon: 'heart', tone: 'warm' },
    { text: `How much independence should ${n} have?`, icon: 'sprout', tone: 'sage' },
    { text: `How do I handle screens and phones?`, icon: 'cloud', tone: 'purple' },
    { text: `What does Montessori look like for teens?`, icon: 'compass', tone: 'cream' },
  ]
}

// ── Light topic classification (keyword-based, intentionally modest) ──

export type AbigailTopic = 'behavior' | 'routine' | 'independence' | 'activity' | 'learning' | 'general'

const TOPIC_KEYWORDS: Array<{ topic: AbigailTopic; words: RegExp }> = [
  // Order matters: behavior/routine cues outrank generic activity words so a
  // dressing meltdown classifies as behavior/routine, not "activity".
  { topic: 'behavior', words: /tantrum|meltdown|hitt?ing|bit(e|ing)|refus|won'?t listen|screaming|whin|acting out|behavio|discipline|loses it|melts down|fight|yell/i },
  { topic: 'routine', words: /routine|morning|bedtime|sleep|meal|dinner|getting dressed|get dressed|transition|schedule|leave the house|toilet|potty/i },
  { topic: 'independence', words: /independen|by (him|her|them)self|on (his|her|their) own|do it (myself|themselves)|self-suffici|responsibilit|chores|help around/i },
  { topic: 'activity', words: /activit|what (can|should) we (do|try)|bored|things to do|play|materials?|practical life|pouring|busy|hands-?on/i },
  { topic: 'learning', words: /read|writ|math|count|letter|number|curriculum|learn|school work|homework|skill/i },
]

export function classifyTopic(question: string): AbigailTopic {
  for (const { topic, words } of TOPIC_KEYWORDS) {
    if (words.test(question)) return topic
  }
  return 'general'
}

// ── Follow-up chips (deterministic per topic) ──

export function getFollowUps(topic: AbigailTopic, childName?: string): string[] {
  const n = childName || 'my child'
  switch (topic) {
    case 'behavior':
      return ['What if that doesn\'t work?', 'What should I avoid?', 'Give me an activity for this']
    case 'independence':
      return ['Where should we start?', 'What if it takes forever?', 'What should I avoid?']
    case 'activity':
      return ['How do I present it?', 'What should I watch for?', `What comes after ${n} masters this?`]
    case 'learning':
      return ['What signs of readiness should I look for?', 'Give me a hands-on way to practice', 'What should I avoid?']
    case 'routine':
      return ['What if we\'re short on time?', 'How long until it improves?', 'What should I avoid?']
    default:
      return ['Tell me more', 'What could we try today?']
  }
}

// ── Attachments: safe pathways to activities / Foundation content ──

export interface AbigailAttachments {
  activity?: HomeActivity
  /** true when the activity is an age-plane fallback, not a keyword match */
  activityIsFallback?: boolean
  article?: ArticleMeta
  observePrompt?: string
}

// Map topical keywords to curriculum-area labels used by HomeActivity.category
const AREA_HINTS: Array<{ words: RegExp; categories: RegExp }> = [
  { words: /practical life|pour|dress|button|chore|help around|cook|kitchen|snack|independen/i, categories: /practical/i },
  { words: /read|letter|sound|writ|language|talk|vocab|stor(y|ies)/i, categories: /language/i },
  { words: /math|count|number|quantit/i, categories: /math|number/i },
  { words: /sens|texture|sort|match/i, categories: /sensor/i },
  { words: /mov|climb|balance|outdoor|energy|gross motor/i, categories: /motor|movement/i },
]

export function getAttachments(question: string, child: Child | undefined): AbigailAttachments {
  const topic = classifyTopic(question)
  const result: AbigailAttachments = {}
  const n = child ? firstName(child.name) : undefined

  // Activity: only when the question is activity-shaped, and only for a child.
  // getHomeActivities is already curated to home-suitable activities.
  if (child && (topic === 'activity' || topic === 'learning' || topic === 'behavior' || topic === 'independence' || topic === 'routine')) {
    const pool = getHomeActivities(child)
    const hint = AREA_HINTS.find(h => h.words.test(question))
    const matched = hint ? pool.find(a => hint.categories.test(a.category)) : undefined
    if (matched) {
      result.activity = matched
    } else if (topic === 'activity') {
      // Age-plane fallback is acceptable only when explicitly labeled.
      result.activity = pool[0]
      result.activityIsFallback = true
    }
  }

  // Article: keyword match against known article titles/categories first.
  const words = question.toLowerCase().match(/[a-z]{4,}/g) || []
  const meaningful = words.filter(w => !['what', 'should', 'about', 'with', 'that', 'this', 'have', 'does', 'when', 'they', 'their', 'from', 'your', 'some', 'much', 'every', 'time'].includes(w))
  if (meaningful.length > 0) {
    const scored = getAllArticleMeta()
      .map(a => {
        const haystack = (a.title + ' ' + a.categories.join(' ')).toLowerCase()
        const score = meaningful.reduce((s, w) => s + (haystack.includes(w) ? 1 : 0), 0)
        return { a, score }
      })
      .filter(x => x.score >= 2)
      .sort((x, y) => y.score - x.score)
    if (scored.length > 0) result.article = scored[0].a
  }
  // Fallback: when the question clearly maps to a known topic, attach that
  // topic's strongest Foundation article rather than mentioning reading the
  // parent can't reach. Still threshold-gated — never a fabricated match.
  if (!result.article) {
    result.article = getTopicFallbackArticle(topic, child)
  }

  // Observation loop — topic-aware. Relevance first, personalization second:
  // a repeat-interest prompt is wrong for a morning meltdown.
  if (child) {
    switch (topic) {
      case 'behavior':
        result.observePrompt = 'What happens immediately before the difficult moment?'
        break
      case 'routine':
        result.observePrompt = 'Does the transition go more smoothly when the sequence is more predictable?'
        break
      case 'independence':
        result.observePrompt = `Which part can ${n} already do without help?`
        break
      case 'activity':
        result.observePrompt = `Does ${n} choose this again on their own, without prompting?`
        break
      case 'learning':
        result.observePrompt = `Which part holds ${n}'s attention the longest?`
        break
    }
  }

  return result
}

// Map conversation topics to Explore's topic definitions so Abigail can
// attach a genuinely relevant Foundation article when direct keyword
// matching finds nothing.
const TOPIC_TO_EXPLORE: Partial<Record<AbigailTopic, string>> = {
  behavior: 'behavior',
  routine: 'routines',
  independence: 'independence',
  learning: 'learning',
}

function getTopicFallbackArticle(topic: AbigailTopic, child: Child | undefined): ArticleMeta | undefined {
  const key = TOPIC_TO_EXPLORE[topic]
  if (!key) return undefined
  const exploreTopic = EXPLORE_TOPICS.find(t => t.key === key)
  if (!exploreTopic) return undefined
  const plane = child ? getAgePlane(child.date_of_birth) : null

  const scored = getAllArticleMeta()
    .map(a => {
      let s = 0
      if (exploreTopic.keywords.test(a.title)) s += 4
      if (a.categories.some(c => exploreTopic.categories.includes(c))) s += 2
      if (exploreTopic.keywords.test(a.excerpt)) s += 1
      // Prefer age-appropriate reading when the plane is known
      if (plane && a.categories.some(c => c.includes(`(${plane})`) || c.includes(plane))) s += 1
      return { a, s }
    })
    .filter(x => x.s >= 4)
    .sort((x, y) => y.s - x.s || (y.a.date || '').localeCompare(x.a.date || ''))
  return scored[0]?.a
}
