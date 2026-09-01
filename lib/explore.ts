// Explore discovery layer (Phase 4) — a presentation/aggregation adapter over
// the existing content systems. No new database, no persisted models:
//   - imported Foundation articles   (lib/articles.ts)
//   - DB-backed resources            (resources table via lib/resources.ts)
//   - Tomorrow's Child issues        (lib/newsletters.ts)
//   - activities                     (lib/family-home.ts)
// Everything here is deterministic — no AI ranking, no invented popularity.

import type { Child } from '@/lib/supabase'
import { getAgePlane } from '@/lib/utils'
import { getAllArticleMeta, type ArticleMeta } from '@/lib/articles-metadata'
import { getAllNewsletters, type Newsletter } from '@/lib/newsletters'
import type { Resource } from '@/lib/resources'
import { resourceTypeLabel } from '@/lib/resources'
import {
  getAllHomeActivities, getHomeActivities, getActiveSensitivePeriods,
  type HomeActivity,
} from '@/lib/family-home'

// ── Unified discovery item (adapter type only — never persisted) ──

export type ExploreKind = 'article' | 'resource' | 'activity' | 'newsletter'

export interface ExploreItem {
  id: string
  kind: ExploreKind
  title: string
  description?: string
  image?: string
  /** Absent for activities — they open the ActivityDetailSheet instead */
  href?: string
  /** External links (Tomorrow's Child PDFs) open in a new tab */
  external?: boolean
  category?: string
  agePlane?: string
  publishedAt?: string
  metadata?: string
  isVideo?: boolean
  /** YouTube thumbnail for video articles (derived from real videoIds) */
  videoThumb?: string
  /** Raw payload for activity items (drives the detail sheet) */
  activity?: HomeActivity
  /** Search corpus (lowercased) — precomputed once */
  _search: { title: string; category: string; tags: string; description: string }
}

// ── Adapters ──

const AGE_GROUP_PLANES: Array<{ cat: string; plane: string }> = [
  { cat: 'Infant-Toddler (0 to 3)', plane: '0-3' },
  { cat: 'Toddler (18 months-3 years)', plane: '0-3' },
  { cat: 'Primary (3-6)', plane: '3-6' },
  { cat: 'Lower Elementary (6-9)', plane: '6-9' },
  { cat: 'Upper Elementary (9-12)', plane: '9-12' },
  { cat: 'Early Adolescence (12-15)', plane: '12+' },
  { cat: 'Montessori Middle School', plane: '12+' },
  { cat: 'Montessori Secondary / High School', plane: '12+' },
]

function articlePlane(a: ArticleMeta): string | undefined {
  return AGE_GROUP_PLANES.find(m => a.categories.includes(m.cat))?.plane
}

function articleCategory(a: ArticleMeta): string {
  return a.categories.filter(c => c !== 'MFA' && !c.startsWith('TC '))[0] || 'Montessori'
}

function articleToItem(a: ArticleMeta): ExploreItem {
  const isVideo = !!a.videoIds?.length || a.categories.some(c => c === 'Video' || c === 'Webinars / MFA')
  return {
    id: `article-${a.slug}`,
    kind: 'article',
    title: a.title,
    description: a.excerpt,
    href: `/dashboard/library/${a.slug}`,
    category: articleCategory(a),
    agePlane: articlePlane(a),
    publishedAt: a.date || undefined,
    metadata: isVideo ? 'Video' : `${a.readMinutes} min read`,
    isVideo,
    videoThumb: a.videoIds?.length ? `https://i.ytimg.com/vi/${a.videoIds[0]}/hqdefault.jpg` : undefined,
    _search: {
      title: a.title.toLowerCase(),
      category: a.categories.join(' ').toLowerCase(),
      tags: a.tags.join(' ').toLowerCase(),
      description: (a.excerpt || '').toLowerCase(),
    },
  }
}

export function resolveCoverUrl(coverPath: string | null): string | undefined {
  if (!coverPath) return undefined
  if (coverPath.startsWith('/') || coverPath.startsWith('http')) return coverPath
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  return base ? `${base}/storage/v1/object/public/resources/${coverPath}` : undefined
}

export function resourceToItem(r: Resource): ExploreItem {
  const label = resourceTypeLabel(r.type)
  return {
    id: `resource-${r.slug}`,
    kind: 'resource',
    title: r.title,
    description: r.description,
    image: resolveCoverUrl(r.coverPath),
    href: `/dashboard/resources/${r.slug}`,
    category: label,
    publishedAt: r.publishedAt || r.createdAt || undefined,
    metadata: label,
    _search: {
      title: r.title.toLowerCase(),
      category: label.toLowerCase(),
      tags: (r.highlights || []).join(' ').toLowerCase(),
      description: (r.description || '').toLowerCase(),
    },
  }
}

function newsletterToItem(n: Newsletter): ExploreItem {
  return {
    id: `newsletter-${n.slug}`,
    kind: 'newsletter',
    title: n.title,
    image: n.coverImage,
    href: n.pdfPath,
    external: true,
    category: "Tomorrow's Child",
    publishedAt: n.date,
    metadata: n.issueLabel,
    _search: {
      title: `${n.title} ${n.issueLabel}`.toLowerCase(),
      category: "tomorrow's child magazine",
      tags: '',
      description: '',
    },
  }
}

function activityToItem(a: HomeActivity): ExploreItem {
  return {
    id: `activity-${a.id}`,
    kind: 'activity',
    title: a.name,
    description: a.description,
    image: a.image,
    category: a.category,
    metadata: [a.duration, a.ages].filter(Boolean).join(' · '),
    activity: a,
    _search: {
      title: a.name.toLowerCase(),
      category: a.category.toLowerCase(),
      tags: '',
      description: a.description.toLowerCase(),
    },
  }
}

/** Static corpus (articles + newsletters + activities). DB resources are
 *  merged in by the page when/if they load — Explore works without them. */
export function getStaticItems(): ExploreItem[] {
  return [
    ...getAllArticleMeta().map(articleToItem),
    ...getAllNewsletters().map(newsletterToItem),
    ...getAllHomeActivities().map(activityToItem),
  ]
}

// ── Need-based topics ──

export interface ExploreTopic {
  key: string
  title: string
  blurb: string
  image: string
  keywords: RegExp
  categories: string[]
  /** Matches HomeActivity.category for "What You Can Try" */
  activityAreas?: RegExp
  abigailPrompt: string
  /** Optional My Child connection */
  childLink?: { label: string; href: string }
}

export const EXPLORE_TOPICS: ExploreTopic[] = [
  {
    key: 'behavior',
    title: 'Behavior & Big Feelings',
    blurb: 'Montessori approaches behavior by helping children develop regulation, independence and connection — not through rewards or punishments.',
    image: '/images/environment/girl-painting.jpg',
    keywords: /behavior|tantrum|meltdown|emotion|feeling|discipline|limit|grace|courtesy|conflict|hitting|anger|calm/i,
    categories: ['Montessori Parenting', 'Montessori Family Life', 'Grace and Courtesy', 'Parenting on the Same Page'],
    activityAreas: /practical|sensor/i,
    abigailPrompt: 'I need help with behavior and big feelings.',
    childLink: { label: 'Log what you notice', href: '/dashboard/children?tab=moments&log=1' },
  },
  {
    key: 'independence',
    title: 'Independence',
    blurb: '"Help me do it myself" — building capability and confidence through real work and real trust.',
    image: '/images/environment/living-room-setup.jpg',
    keywords: /independen|self-|by myself|help me do|practical life|responsibilit|capable|confidence|chores/i,
    categories: ['Montessori Parenting', 'Montessori Family Life'],
    activityAreas: /practical/i,
    abigailPrompt: 'How can I build more independence at home?',
    childLink: { label: 'Log what you notice', href: '/dashboard/children?tab=moments&log=1' },
  },
  {
    key: 'learning',
    title: 'Learning',
    blurb: 'How reading, writing, math and curiosity actually develop — and how to support them at home.',
    image: '/images/environment/girl-reading.jpg',
    keywords: /read|writ|math|literacy|number|letter|curriculum|learn|academic|language|science/i,
    categories: ['Montessori Education', 'Montessori Curriculum'],
    activityAreas: /language|math|writing|number/i,
    abigailPrompt: 'What should my child be learning right now?',
    childLink: { label: "See your child's Growth", href: '/dashboard/children?tab=growth' },
  },
  {
    key: 'routines',
    title: 'Routines',
    blurb: 'Mornings, meals, bedtime, transitions — calm days are built on predictable rhythms.',
    image: '/images/environment/floor-bed.jpg',
    keywords: /routine|morning|bedtime|sleep|meal|dinner|transition|schedule|rhythm|toilet|dressing/i,
    categories: ['Montessori Family Life', 'Montessori Parenting'],
    activityAreas: /practical/i,
    abigailPrompt: 'Help me improve our daily routines.',
  },
  {
    key: 'home',
    title: 'Montessori at Home',
    blurb: 'Preparing spaces that invite concentration and independence — no classroom required.',
    image: '/images/environment/playroom.jpg',
    keywords: /home|environment|shelf|shelves|space|room|prepared|setup|organiz|materials/i,
    categories: ['Montessori Family Life', 'Family Resources'],
    activityAreas: /practical|sensor/i,
    abigailPrompt: 'How should I set up our home the Montessori way?',
  },
  {
    key: 'development',
    title: 'Development',
    blurb: 'What to expect — and what to notice — at every age, from sensitive periods to the four planes.',
    image: '/images/environment/baby-playing.jpg',
    keywords: /development|milestone|sensitive period|plane|age|brain|growth|toddler|infant|adolescen/i,
    categories: ['Infant-Toddler (0 to 3)', 'Toddler (18 months-3 years)', 'Primary (3-6)', 'Lower Elementary (6-9)', 'Upper Elementary (9-12)', 'Early Adolescence (12-15)'],
    abigailPrompt: 'What should I know about my child\'s development right now?',
    childLink: { label: "See your child's Growth", href: '/dashboard/children?tab=growth' },
  },
  {
    key: 'school',
    title: 'School & Montessori',
    blurb: 'Choosing a school, partnering with teachers, and understanding what happens in the classroom.',
    image: '/images/environment/girls-art.jpg',
    keywords: /school|classroom|teacher|guide|enroll|tour|kindergarten|transition to|partner/i,
    categories: ['Montessori Education', 'Dear Cathie'],
    abigailPrompt: 'How do I partner well with my child\'s Montessori school?',
  },
  {
    key: 'montessori-101',
    title: 'Montessori 101',
    blurb: 'New to Montessori? Start with the ideas that make it different — and why they work.',
    image: '/images/environment/reading-nook.jpg',
    keywords: /what is montessori|montessori method|maria montessori|philosophy|absorbent mind|myth|misconception|begin|start|101|introduction/i,
    categories: ['Montessori Education', 'Montessori Parenting'],
    abigailPrompt: 'What makes Montessori different?',
  },
]

export function getTopic(key: string): ExploreTopic | undefined {
  return EXPLORE_TOPICS.find(t => t.key === key)
}

function topicScore(topic: ExploreTopic, item: ExploreItem): number {
  let score = 0
  if (topic.keywords.test(item._search.title)) score += 4
  if (topic.categories.some(c => item._search.category.includes(c.toLowerCase()))) score += 2
  if (topic.keywords.test(item._search.tags)) score += 2
  if (topic.keywords.test(item._search.description)) score += 1
  return score
}

export interface TopicContent {
  startHere?: ExploreItem
  tryActivities: HomeActivity[]
  learn: ExploreItem[]
  watch: ExploreItem[]
}

export function getTopicContent(
  topic: ExploreTopic,
  items: ExploreItem[],
  child: Child | undefined,
): TopicContent {
  const scored = items
    .filter(i => i.kind !== 'activity' && i.kind !== 'newsletter')
    .map(item => ({ item, score: topicScore(topic, item) }))
    .filter(x => x.score >= 3)
    .sort((a, b) => b.score - a.score)

  const articlesFirst = scored.filter(x => !x.item.isVideo).map(x => x.item)
  const watch = scored.filter(x => x.item.isVideo).map(x => x.item).slice(0, 3)

  // Activities: prefer area matches from the child's age pool, then area
  // matches from the full pool, then the age pool itself.
  const childPool = child ? getHomeActivities(child) : []
  const fullPool = getAllHomeActivities()
  const areaMatch = (pool: HomeActivity[]) =>
    topic.activityAreas ? pool.filter(a => topic.activityAreas!.test(a.category)) : pool
  const fromChild = areaMatch(childPool)
  const fromAll = areaMatch(fullPool)
  const finalActivities = (
    fromChild.length > 0 ? fromChild
    : fromAll.length > 0 ? fromAll
    : (childPool.length > 0 ? childPool : fullPool)
  ).slice(0, 4)

  return {
    startHere: articlesFirst[0],
    tryActivities: finalActivities,
    learn: articlesFirst.slice(1, 7),
    watch,
  }
}

// ── Search (deterministic, in-memory) ──

export function searchItems(query: string, items: ExploreItem[]): ExploreItem[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const words = q.split(/\s+/).filter(w => w.length >= 2)
  if (words.length === 0) return []

  return items
    .map(item => {
      let score = 0
      for (const w of words) {
        if (item._search.title.includes(w)) score += 5
        if (item._search.category.includes(w)) score += 2
        if (item._search.tags.includes(w)) score += 2
        if (item._search.description.includes(w)) score += 1
      }
      // Whole-query phrase bonus
      if (words.length > 1 && item._search.title.includes(q)) score += 4
      return { item, score }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 40)
    .map(x => x.item)
}

export type SearchFilter = 'all' | 'articles' | 'activities' | 'guides' | 'videos' | 'newsletters'

export function filterResults(results: ExploreItem[], filter: SearchFilter): ExploreItem[] {
  switch (filter) {
    case 'articles': return results.filter(i => i.kind === 'article' && !i.isVideo)
    case 'activities': return results.filter(i => i.kind === 'activity')
    case 'guides': return results.filter(i => i.kind === 'resource')
    case 'videos': return results.filter(i => !!i.isVideo)
    case 'newsletters': return results.filter(i => i.kind === 'newsletter')
    default: return results
  }
}

// ── Curated home rows ──

/** For [Child]: age-plane articles + sensitive-period-relevant picks. */
export function getForChildItems(child: Child, items: ExploreItem[]): ExploreItem[] {
  const plane = getAgePlane(child.date_of_birth)
  const peaks = getActiveSensitivePeriods(child).filter(p => p.isPeak)
  const peakWords = new RegExp(peaks.map(p => p.name.split(' ')[0]).join('|') || '$^', 'i')

  const scored = items
    .filter(i => i.kind === 'article')
    .map(item => {
      let score = 0
      if (item.agePlane === plane) score += 3
      if (peaks.length > 0 && peakWords.test(item._search.title)) score += 2
      return { item, score }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || (b.item.publishedAt || '').localeCompare(a.item.publishedAt || ''))
    .map(x => x.item)

  return scored.slice(0, 6)
}

/** New from the Foundation: real publish dates, articles + resources. */
export function getNewItems(items: ExploreItem[]): ExploreItem[] {
  return items
    .filter(i => (i.kind === 'article' || i.kind === 'resource') && i.publishedAt)
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
    .slice(0, 5)
}

/** Watch: identifiable video content only — no invented durations. */
export function getWatchItems(items: ExploreItem[]): ExploreItem[] {
  return items
    .filter(i => i.isVideo)
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
    .slice(0, 5)
}
