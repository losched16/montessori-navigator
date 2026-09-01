'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ChevronRight, Sparkles, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useChild } from '@/lib/child-context'
import { listPublishedResources, type Resource } from '@/lib/resources'
import { getAllNewsletters } from '@/lib/newsletters'
import { getHomeActivities, getAllHomeActivities, type HomeActivity } from '@/lib/family-home'
import {
  getStaticItems, resourceToItem, searchItems, filterResults,
  EXPLORE_TOPICS, getTopic, getTopicContent,
  getForChildItems, getNewItems, getWatchItems,
  type ExploreItem, type SearchFilter,
} from '@/lib/explore'
import ExploreSearch from '@/components/explore/ExploreSearch'
import ExploreSection from '@/components/explore/ExploreSection'
import ExploreTopicCard from '@/components/explore/ExploreTopicCard'
import ExploreItemCard from '@/components/explore/ExploreItemCard'
import NewsletterCard from '@/components/explore/NewsletterCard'
import VideoCard from '@/components/explore/VideoCard'
import ActivityCarousel from '@/components/family/ActivityCarousel'
import ActivityDetailSheet from '@/components/family/ActivityDetailSheet'
import Button from '@/components/ui/Button'

const SEARCH_FILTERS: Array<{ key: SearchFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'articles', label: 'Articles' },
  { key: 'activities', label: 'Activities' },
  { key: 'guides', label: 'Guides' },
  { key: 'videos', label: 'Videos' },
  { key: 'newsletters', label: "Tomorrow's Child" },
]

const NEWSLETTERS = getAllNewsletters()

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="max-w-[1000px] mx-auto pb-24 sm:pb-10" />}>
      <ExploreInner />
    </Suspense>
  )
}

function ExploreInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { selectedChild } = useChild()
  const [searchInput, setSearchInput] = useState(params.get('q') || '')
  const [filter, setFilter] = useState<SearchFilter>('all')
  const [resources, setResources] = useState<Resource[]>([])
  const [openActivity, setOpenActivity] = useState<HomeActivity | null>(null)

  const topicKey = params.get('topic')
  const collection = params.get('collection')
  const childFirst = selectedChild?.name.trim().split(/\s+/)[0]

  // DB-backed resources — Explore degrades gracefully if this fails:
  // static articles, newsletters and activities still render.
  useEffect(() => {
    const supabase = createClient()
    listPublishedResources(supabase, 'parent')
      .then(setResources)
      .catch(() => setResources([]))
  }, [])

  // Sync ?q= (debounced) so search state is deep-linkable. Typing exits
  // topic/collection views.
  useEffect(() => {
    const t = setTimeout(() => {
      const current = new URL(window.location.href)
      const urlQ = current.searchParams.get('q') || ''
      const next = searchInput.trim()
      if (next === urlQ) return
      if (next.length >= 2) {
        router.replace(`/dashboard/explore?q=${encodeURIComponent(next)}`, { scroll: false })
      } else if (urlQ) {
        router.replace('/dashboard/explore', { scroll: false })
      }
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // Scroll to top when entering a topic/collection view
  useEffect(() => {
    if (topicKey || collection) window.scrollTo(0, 0)
  }, [topicKey, collection])

  const items: ExploreItem[] = useMemo(
    () => [...getStaticItems(), ...resources.map(resourceToItem)],
    [resources],
  )

  const searching = searchInput.trim().length >= 2
  const results = useMemo(
    () => (searching ? searchItems(searchInput, items) : []),
    [searching, searchInput, items],
  )
  const filteredResults = useMemo(() => filterResults(results, filter), [results, filter])

  const topic = topicKey ? getTopic(topicKey) : undefined
  const topicContent = useMemo(
    () => (topic ? getTopicContent(topic, items, selectedChild) : null),
    [topic, items, selectedChild?.id],
  )

  const forChild = useMemo(
    () => (selectedChild ? getForChildItems(selectedChild, items) : []),
    [selectedChild?.id, items],
  )
  const newItems = useMemo(() => getNewItems(items), [items])
  const watchItems = useMemo(() => getWatchItems(items), [items])

  const tryActivities = useMemo(() => {
    if (selectedChild) return getHomeActivities(selectedChild)
    return getAllHomeActivities().filter(a => /3|4/.test(a.ages)).slice(0, 6)
  }, [selectedChild?.id])

  const openActivityItem = (item: ExploreItem) => {
    if (item.activity) setOpenActivity(item.activity)
  }

  const carouselRow = 'flex gap-3.5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 snap-x snap-mandatory scrollbar-hide'

  return (
    <div className="max-w-[1000px] mx-auto pb-24 sm:pb-10">
      {/* ── Header + search (always present) ── */}
      <div className="pt-2 pb-5">
        {(topic || collection) && !searching ? (
          <Link
            href="/dashboard/explore"
            className="tap-scale inline-flex items-center gap-1.5 min-h-[44px] text-[14px] font-medium text-[color:var(--mfa-ink-secondary)] hover:text-[color:var(--mfa-ink)] -mt-1 mb-1"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Explore
          </Link>
        ) : (
          <>
            <h1 className="font-[family-name:var(--mfa-serif)] text-[32px] sm:text-[40px] leading-[1.05] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-2">
              Explore Montessori
            </h1>
            <p className="text-[15.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] max-w-lg mb-5">
              Find ideas, guidance and activities for what your family needs today.
            </p>
          </>
        )}
        {!topic && !collection && (
          <ExploreSearch value={searchInput} onChange={v => { setSearchInput(v); setFilter('all') }} />
        )}
      </div>

      {/* ── Search results ── */}
      {searching ? (
        <div className="space-y-4">
          <h2 className="font-[family-name:var(--mfa-serif)] text-[22px] font-semibold text-[color:var(--mfa-ink)] tracking-tight">
            Results for &ldquo;{searchInput.trim()}&rdquo;
          </h2>
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide" role="group" aria-label="Filter results">
            {SEARCH_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={`tap-scale shrink-0 min-h-[44px] px-4 rounded-full text-[14px] font-medium transition ${
                  filter === f.key
                    ? 'bg-[color:var(--mfa-purple-soft)] text-[color:var(--mfa-purple)]'
                    : 'bg-white border border-[color:var(--mfa-border)] text-[color:var(--mfa-ink-secondary)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {filteredResults.length === 0 ? (
            <div className="rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-7 text-center">
              <p className="text-[15px] text-[color:var(--mfa-ink-secondary)] mb-4">
                Nothing found for &ldquo;{searchInput.trim()}&rdquo;. Try a different word — or ask Abigail directly.
              </p>
              <Button variant="soft" size="md" href={`/dashboard/chat?q=${encodeURIComponent(searchInput.trim())}`}>
                <Sparkles size={16} aria-hidden="true" />
                Ask Abigail
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredResults.map(item => (
                <ExploreItemCard key={item.id} item={item} onOpenActivity={openActivityItem} />
              ))}
            </div>
          )}
          <div className="pt-2">
            <Link href="/dashboard/library" className="tap-scale inline-flex items-center gap-1 min-h-[44px] text-[14px] font-medium text-[color:var(--mfa-purple)]">
              Search the full Library
              <ChevronRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>

      /* ── Tomorrow's Child collection ── */
      ) : collection === 'tomorrows-child' ? (
        <div className="space-y-8">
          <div>
            <h1 className="font-[family-name:var(--mfa-serif)] text-[30px] sm:text-[36px] leading-[1.05] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-1.5">
              Tomorrow&apos;s Child
            </h1>
            <p className="text-[15px] text-[color:var(--mfa-ink-secondary)]">
              The Montessori Foundation&apos;s magazine for families.
            </p>
          </div>
          {[...new Set(NEWSLETTERS.map(n => n.year))].sort((a, b) => b - a).map(year => (
            <section key={year} aria-label={`${year} issues`}>
              <h2 className="font-[family-name:var(--mfa-serif)] text-[21px] font-semibold text-[color:var(--mfa-ink)] mb-3">{year}</h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3.5">
                {NEWSLETTERS.filter(n => n.year === year).map(n => (
                  <NewsletterCard key={n.slug} newsletter={n} width="full" />
                ))}
              </div>
            </section>
          ))}
        </div>

      /* ── Topic view ── */
      ) : topic && topicContent ? (
        <div className="space-y-8">
          <div>
            <h1 className="font-[family-name:var(--mfa-serif)] text-[30px] sm:text-[36px] leading-[1.05] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-2">
              {topic.title}
            </h1>
            <p className="text-[15px] leading-relaxed text-[color:var(--mfa-ink-secondary)] max-w-xl">
              {topic.blurb}
            </p>
          </div>

          {topicContent.startHere && (
            <ExploreSection title="Start Here">
              <ExploreItemCard item={topicContent.startHere} onOpenActivity={openActivityItem} />
            </ExploreSection>
          )}

          {topicContent.tryActivities.length > 0 && (
            <ExploreSection title="What You Can Try">
              <ActivityCarousel activities={topicContent.tryActivities} childName={childFirst || 'your child'} />
            </ExploreSection>
          )}

          {topicContent.learn.length > 0 && (
            <ExploreSection title="Learn More">
              <div className="space-y-2.5">
                {topicContent.learn.map(item => (
                  <ExploreItemCard key={item.id} item={item} onOpenActivity={openActivityItem} />
                ))}
              </div>
            </ExploreSection>
          )}

          {topicContent.watch.length > 0 && (
            <ExploreSection title="Watch">
              <div className={carouselRow} role="list" aria-label="Videos">
                {topicContent.watch.map(item => <VideoCard key={item.id} item={item} />)}
              </div>
            </ExploreSection>
          )}

          {/* Abigail connection */}
          <div className="rounded-[20px] bg-[color:var(--mfa-purple-soft)] border border-[color:var(--mfa-border)] p-5 flex items-center gap-4">
            <span className="w-10 h-10 rounded-full bg-[color:var(--mfa-purple)] text-white inline-flex items-center justify-center shrink-0" aria-hidden="true">
              <Sparkles size={18} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold text-[color:var(--mfa-ink)]">Talk it through with Abigail</div>
              <div className="text-[13px] text-[color:var(--mfa-ink-secondary)]">Personal guidance for your family&apos;s situation.</div>
            </div>
            <Link
              href={`/dashboard/chat?q=${encodeURIComponent(topic.abigailPrompt)}`}
              className="tap-scale inline-flex items-center gap-0.5 min-h-[44px] shrink-0 text-[14px] font-semibold text-[color:var(--mfa-purple)]"
            >
              Ask Abigail
              <ChevronRight size={15} aria-hidden="true" />
            </Link>
          </div>

          {/* My Child connection where it belongs */}
          {topic.childLink && selectedChild && (
            <Link
              href={topic.childLink.href}
              className="tap-scale flex items-center justify-between rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-5 hover:shadow-md transition"
            >
              <span className="text-[15px] font-medium text-[color:var(--mfa-ink)]">
                {topic.childLink.label.replace('your child', childFirst || 'your child')}
              </span>
              <ChevronRight size={17} className="text-[color:var(--mfa-purple)]" aria-hidden="true" />
            </Link>
          )}

          {/* Related topics */}
          <ExploreSection title="Related Topics">
            <div className="flex flex-wrap gap-2">
              {EXPLORE_TOPICS.filter(t => t.key !== topic.key).slice(0, 4).map(t => (
                <Link
                  key={t.key}
                  href={`/dashboard/explore?topic=${t.key}`}
                  className="tap-scale inline-flex items-center min-h-[44px] px-4 rounded-full bg-white border border-[color:var(--mfa-border)] text-[14px] font-medium text-[color:var(--mfa-ink-secondary)] hover:text-[color:var(--mfa-purple)] hover:border-[color:var(--mfa-purple)] transition"
                >
                  {t.title}
                </Link>
              ))}
            </div>
          </ExploreSection>
        </div>

      /* ── Discovery home ── */
      ) : (
        <div className="space-y-9">
          <ExploreSection title="What do you need help with?">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {EXPLORE_TOPICS.map(t => <ExploreTopicCard key={t.key} topic={t} />)}
            </div>
          </ExploreSection>

          {selectedChild && forChild.length > 0 && (
            <ExploreSection title={`For ${childFirst}`}>
              <div className={carouselRow} role="list" aria-label={`Recommended for ${childFirst}`}>
                {forChild.map(item => (
                  <div key={item.id} role="listitem" className="w-[290px] shrink-0 snap-start">
                    <ExploreItemCard item={item} onOpenActivity={openActivityItem} />
                  </div>
                ))}
              </div>
            </ExploreSection>
          )}

          <ExploreSection title="Things to Try">
            <ActivityCarousel activities={tryActivities} childName={childFirst || 'your child'} />
          </ExploreSection>

          {newItems.length > 0 && (
            <ExploreSection title="New from the Foundation">
              <div className="space-y-2.5">
                {newItems.map(item => (
                  <ExploreItemCard key={item.id} item={item} onOpenActivity={openActivityItem} />
                ))}
              </div>
            </ExploreSection>
          )}

          {watchItems.length > 0 && (
            <ExploreSection title="Watch">
              <div className={carouselRow} role="list" aria-label="Videos">
                {watchItems.map(item => <VideoCard key={item.id} item={item} />)}
              </div>
            </ExploreSection>
          )}

          <ExploreSection
            title="Tomorrow's Child"
            subtitle="The Montessori Foundation's magazine for families."
            actionLabel="Browse all issues"
            actionHref="/dashboard/explore?collection=tomorrows-child"
          >
            <div className={carouselRow} role="list" aria-label="Tomorrow's Child issues">
              {NEWSLETTERS.slice(0, 6).map(n => (
                <NewsletterCard key={n.slug} newsletter={n} />
              ))}
            </div>
          </ExploreSection>

          <Link
            href="/dashboard/library"
            className="tap-scale flex items-center gap-4 rounded-[20px] bg-white border border-[color:var(--mfa-border)] p-5 hover:shadow-md transition"
          >
            <span className="w-10 h-10 rounded-full bg-[color:var(--mfa-surface-warm)] text-[color:var(--mfa-ochre)] inline-flex items-center justify-center shrink-0" aria-hidden="true">
              <BookOpen size={19} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-semibold text-[color:var(--mfa-ink)]">Open the Full Library</span>
              <span className="block text-[13px] text-[color:var(--mfa-ink-secondary)]">Every article and resource, with filters, tags and sorting.</span>
            </span>
            <ChevronRight size={17} className="text-[color:var(--mfa-purple)] shrink-0" aria-hidden="true" />
          </Link>
        </div>
      )}

      <ActivityDetailSheet
        activity={openActivity}
        childName={childFirst || 'your child'}
        onClose={() => setOpenActivity(null)}
      />
    </div>
  )
}
