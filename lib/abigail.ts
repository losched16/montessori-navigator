// Abigail experience helpers (Phase 3) — all deterministic, no AI calls.
// Suggested prompts, light topic classification, follow-up chips, and the
// safe pathways from a conversation to activities / Foundation content.

import type { Child } from '@/lib/supabase'
import { getAgePlane } from '@/lib/utils'
import { getHomeActivities, type HomeActivity } from '@/lib/family-home'
import { getAllArticles, type Article } from '@/lib/articles'

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

export type AbigailTopic = 'behavior' | 'activity' | 'learning' | 'routine' | 'general'

const TOPIC_KEYWORDS: Array<{ topic: AbigailTopic; words: RegExp }> = [
  { topic: 'behavior', words: /tantrum|meltdown|hitt?ing|bit(e|ing)|refus|won'?t listen|screaming|whin|acting out|behavio|discipline|loses it|fight|yell/i },
  { topic: 'activity', words: /activit|what (can|should) we (do|try)|bored|things to do|play|materials?|practical life|pouring|busy|hands-?on/i },
  { topic: 'learning', words: /read|writ|math|count|letter|number|curriculum|learn|school work|homework|skill/i },
  { topic: 'routine', words: /routine|morning|bedtime|sleep|meal|dinner|getting dressed|transition|schedule|leave the house/i },
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
  article?: Article
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
  if (child && (topic === 'activity' || topic === 'learning' || topic === 'behavior')) {
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

  // Article: keyword match against known article titles/categories. Skip when
  // confidence is poor — no fabricated relevance.
  const words = question.toLowerCase().match(/[a-z]{4,}/g) || []
  const meaningful = words.filter(w => !['what', 'should', 'about', 'with', 'that', 'this', 'have', 'does', 'when', 'they', 'their', 'from', 'your', 'some', 'much', 'every', 'time'].includes(w))
  if (meaningful.length > 0) {
    const scored = getAllArticles()
      .map(a => {
        const haystack = (a.title + ' ' + a.categories.join(' ')).toLowerCase()
        const score = meaningful.reduce((s, w) => s + (haystack.includes(w) ? 1 : 0), 0)
        return { a, score }
      })
      .filter(x => x.score >= 2)
      .sort((x, y) => y.score - x.score)
    if (scored.length > 0) result.article = scored[0].a
  }

  // Observation loop: behavior/activity conversations end in noticing.
  if (child && (topic === 'behavior' || topic === 'activity' || topic === 'routine')) {
    result.observePrompt = topic === 'behavior'
      ? `What happens right before the hardest moment — and does anything shift after you try this?`
      : `Does ${n} come back to this again tomorrow, without being asked?`
  }

  return result
}
