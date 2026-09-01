'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, Play, ChevronLeft, ChevronRight, ArrowLeft, Newspaper } from 'lucide-react'
import { getAllArticleMeta, getAllCategories, getAllTags, type ArticleMeta } from '@/lib/articles-metadata'
import { listLibraryResources, resourceTypeLabel } from '@/lib/resources'
import { createClient } from '@/lib/supabase'
import BottomSheet from '@/components/ui/BottomSheet'
import Button from '@/components/ui/Button'

// Full Library — the advanced browse/search layer beneath Explore.
// All power-user behavior (search, category/tag filters, sorting,
// pagination, DB-backed resources, ?category= deep links) is preserved.

// Article-shaped row plus an optional href — DB-backed library items link to
// their resource detail page rather than the imported-article reader.
type LibArticle = ArticleMeta & { _href?: string }

const ARTICLES = getAllArticleMeta()
const CATEGORIES = getAllCategories()
const TAGS = getAllTags()

// Simplified category groupings for the filter UI
const CATEGORY_GROUPS: Record<string, string[]> = {
  'Montessori Parenting': ['Montessori Parenting', 'Montessori Family Life', 'Parenting on the Same Page'],
  'Montessori Education': ['Montessori Education', 'Montessori Curriculum'],
  'Age Groups': ['Infant-Toddler (0 to 3)', 'Toddler (18 months-3 years)', 'Primary (3-6)', 'Lower Elementary (6-9)', 'Upper Elementary (9-12)', 'Early Adolescence (12-15)', 'Montessori Middle School', 'Montessori Secondary / High School'],
  'Family Resources': ['Family Resources', 'Montessori Grandparenting', 'Grace and Courtesy', 'Dear Cathie'],
  'Book Reviews': ['Book Reviews'],
  'Video & Webinars': ['Video', 'Webinars / MFA'],
  "Tomorrow's Child": ["Tomorrow's Child"],
}

type SortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc'

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest First', oldest: 'Oldest First', title_asc: 'Title A–Z', title_desc: 'Title Z–A',
}

const selectClasses = 'w-full px-3.5 py-2.5 min-h-[48px] border border-[color:var(--mfa-border)] rounded-xl text-[15px] bg-white text-[color:var(--mfa-ink)] focus:ring-2 focus:ring-[color:var(--mfa-purple)] focus:border-transparent outline-none'

export default function LibraryPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [sort, setSort] = useState<SortOption>('newest')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const perPage = 12

  // DB-backed articles flagged for the Library (added via /admin), merged in
  // with the imported Foundation articles.
  const [dbArticles, setDbArticles] = useState<LibArticle[]>([])

  // Allow deep links from Explore/More (?category=Montessori Parenting)
  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('category')
    if (cat && (cat === "Tomorrow's Child" || CATEGORY_GROUPS[cat] || CATEGORIES.includes(cat))) {
      setSelectedCategory(cat)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    listLibraryResources(supabase)
      .then(rs => setDbArticles(rs.map(r => ({
        slug: r.slug,
        title: r.title,
        author: 'The Montessori Foundation',
        date: (r.publishedAt || r.createdAt || '').slice(0, 10),
        categories: [resourceTypeLabel(r.type)],
        tags: [],
        excerpt: r.description,
        readMinutes: 3,
        _href: `/dashboard/resources/${r.slug}`,
      } as LibArticle))))
      .catch(() => {})
  }, [])

  const filteredArticles = useMemo(() => {
    let results: LibArticle[] = [...dbArticles, ...ARTICLES]

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase()
      results = results.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q) ||
        a.categories.some(c => c.toLowerCase().includes(q)) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      if (selectedCategory === "Tomorrow's Child") {
        results = results.filter(a =>
          a.categories.some(c => c === "Tomorrow's Child" || c.startsWith('TC '))
        )
      } else {
        const groupCats = CATEGORY_GROUPS[selectedCategory]
        if (groupCats) {
          results = results.filter(a => a.categories.some(c => groupCats.includes(c)))
        } else {
          results = results.filter(a => a.categories.includes(selectedCategory))
        }
      }
    }

    // Filter by tag
    if (selectedTag !== 'all') {
      results = results.filter(a => a.tags.includes(selectedTag))
    }

    // Sort
    switch (sort) {
      case 'newest':
        results.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
        break
      case 'oldest':
        results.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
        break
      case 'title_asc':
        results.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'title_desc':
        results.sort((a, b) => b.title.localeCompare(a.title))
        break
    }

    return results
  }, [search, selectedCategory, selectedTag, sort, dbArticles])

  const totalPages = Math.ceil(filteredArticles.length / perPage)
  const paginatedArticles = filteredArticles.slice((page - 1) * perPage, page * perPage)

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (v: any) => void, value: any) => {
    setter(value)
    setPage(1)
  }

  const activeFilterCount = (selectedCategory !== 'all' ? 1 : 0) + (selectedTag !== 'all' ? 1 : 0) + (sort !== 'newest' ? 1 : 0)

  const clearFilters = () => {
    setSelectedCategory('all'); setSelectedTag('all'); setSort('newest'); setPage(1)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const filterControls = (
    <>
      <label className="block">
        <span className="block text-[12px] font-medium text-[color:var(--mfa-ink-secondary)] mb-1">Category</span>
        <select
          value={selectedCategory}
          onChange={e => handleFilterChange(setSelectedCategory, e.target.value)}
          className={selectClasses}
        >
          <option value="all">All Categories</option>
          {Object.keys(CATEGORY_GROUPS).map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="block text-[12px] font-medium text-[color:var(--mfa-ink-secondary)] mb-1">Tag</span>
        <select
          value={selectedTag}
          onChange={e => handleFilterChange(setSelectedTag, e.target.value)}
          className={selectClasses}
        >
          <option value="all">All Tags</option>
          {TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="block text-[12px] font-medium text-[color:var(--mfa-ink-secondary)] mb-1">Sort</span>
        <select
          value={sort}
          onChange={e => handleFilterChange(setSort, e.target.value as SortOption)}
          className={selectClasses}
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map(s => (
            <option key={s} value={s}>{SORT_LABELS[s]}</option>
          ))}
        </select>
      </label>
    </>
  )

  return (
    <div className="max-w-[1000px] mx-auto pb-24 sm:pb-10">
      {/* ── Header ── */}
      <div className="pt-2 mb-6">
        <Link
          href="/dashboard/explore"
          className="tap-scale inline-flex items-center gap-1.5 min-h-[44px] text-[14px] font-medium text-[color:var(--mfa-ink-secondary)] hover:text-[color:var(--mfa-ink)]"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Explore
        </Link>
        <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--mfa-clay)] mb-2 mt-1">
          The Montessori Foundation
        </div>
        <h1 className="font-[family-name:var(--mfa-serif)] text-[34px] sm:text-[44px] leading-[1.02] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-2">
          Full Library
        </h1>
        <p className="text-[15.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] max-w-lg">
          Search and browse the complete Montessori Foundation collection — {ARTICLES.length.toLocaleString()} articles and resources.
        </p>
      </div>

      {/* ── Search + filters ── */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--mfa-ink-muted)] pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search articles..."
              aria-label="Search the Library"
              value={search}
              onChange={e => handleFilterChange(setSearch, e.target.value)}
              className="w-full h-[52px] pl-11 pr-4 rounded-[16px] bg-white border border-[color:var(--mfa-border)] text-[15.5px] text-[color:var(--mfa-ink)] placeholder:text-[color:var(--mfa-ink-muted)] focus:ring-2 focus:ring-[color:var(--mfa-purple)] focus:border-transparent outline-none [&::-webkit-search-cancel-button]:hidden"
            />
          </div>
          {/* Mobile: filters live in a sheet */}
          <button
            onClick={() => setFiltersOpen(true)}
            aria-label={`Filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
            className="tap-scale sm:hidden shrink-0 h-[52px] px-4 inline-flex items-center gap-2 rounded-[16px] bg-white border border-[color:var(--mfa-border)] text-[14px] font-medium text-[color:var(--mfa-ink-secondary)]"
          >
            <SlidersHorizontal size={17} aria-hidden="true" />
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[color:var(--mfa-purple)] text-white text-[11px] font-bold inline-flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop: inline filter controls */}
        <div className="hidden sm:grid grid-cols-3 gap-3">
          {filterControls}
        </div>

        <div className="flex items-center justify-between text-[13px] text-[color:var(--mfa-ink-muted)]">
          <span>
            Showing {paginatedArticles.length} of {filteredArticles.length} articles
            {search && <span> matching &ldquo;{search}&rdquo;</span>}
          </span>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="tap-scale min-h-[44px] text-[13px] font-medium text-[color:var(--mfa-purple)]">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Tomorrow's Child compact shortcut (Explore has the premium row) ── */}
      {selectedCategory === 'all' && !search.trim() && (
        <Link
          href="/dashboard/explore?collection=tomorrows-child"
          className="tap-scale flex items-center gap-3.5 rounded-[16px] bg-[color:var(--mfa-surface-warm)] border border-[color:var(--mfa-border)] p-4 mb-6 hover:shadow-md transition"
        >
          <span className="w-9 h-9 rounded-full bg-white text-[color:var(--mfa-clay)] inline-flex items-center justify-center shrink-0" aria-hidden="true">
            <Newspaper size={17} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[14.5px] font-semibold text-[color:var(--mfa-ink)]">Tomorrow&apos;s Child magazine</span>
            <span className="block text-[12.5px] text-[color:var(--mfa-ink-secondary)]">Browse every issue in Explore</span>
          </span>
          <ChevronRight size={16} className="text-[color:var(--mfa-purple)] shrink-0" aria-hidden="true" />
        </Link>
      )}

      {/* ── Article grid ── */}
      {paginatedArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-8">
          {paginatedArticles.map(article => (
            <Link
              key={article.slug}
              href={article._href || `/dashboard/library/${article.slug}`}
              className="tap-scale bg-white border border-[color:var(--mfa-border)] rounded-[16px] p-5 hover:shadow-md transition group"
            >
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {article.categories.filter(c => c !== 'MFA').slice(0, 2).map(cat => (
                  <span key={cat} className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[color:var(--mfa-surface-sage)] text-[color:var(--mfa-forest)]">
                    {cat}
                  </span>
                ))}
              </div>
              <h3 className="font-[family-name:var(--mfa-serif)] text-[19px] font-semibold text-[color:var(--mfa-ink)] leading-[1.18] mb-2 group-hover:opacity-75 transition line-clamp-3 tracking-tight">
                {article.videoIds && article.videoIds.length > 0 && (
                  <Play size={13} className="inline-block mr-1.5 text-[color:var(--mfa-clay)] align-baseline" aria-label="Video" />
                )}
                {article.title}
              </h3>
              <p className="text-[13.5px] text-[color:var(--mfa-ink-secondary)] leading-[1.5] line-clamp-3 mb-3">
                {article.excerpt}
              </p>
              <div className="flex items-center justify-between text-[11.5px] text-[color:var(--mfa-ink-muted)] font-medium">
                <span className="truncate">{article.author}</span>
                <span className="shrink-0 ml-2">{formatDate(article.date)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[color:var(--mfa-border)] rounded-[20px] p-12 text-center mb-8">
          <h3 className="font-[family-name:var(--mfa-serif)] text-[22px] font-semibold text-[color:var(--mfa-ink)] mb-2">
            No articles found
          </h3>
          <p className="text-[14.5px] text-[color:var(--mfa-ink-secondary)] mb-4">Try adjusting your search or filters.</p>
          <Button variant="secondary" size="md" onClick={clearFilters}>Clear filters</Button>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="tap-scale min-h-[44px] px-3.5 inline-flex items-center gap-1 text-[14px] font-medium border border-[color:var(--mfa-border)] rounded-xl bg-white text-[color:var(--mfa-ink-secondary)] hover:bg-[color:var(--mfa-surface-warm)] disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft size={15} aria-hidden="true" /> Prev
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 7) pageNum = i + 1
              else if (page <= 4) pageNum = i + 1
              else if (page >= totalPages - 3) pageNum = totalPages - 6 + i
              else pageNum = page - 3 + i
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  aria-current={page === pageNum ? 'page' : undefined}
                  className={`tap-scale w-11 h-11 text-[14px] rounded-xl transition ${
                    page === pageNum
                      ? 'bg-[color:var(--mfa-purple)] text-white font-semibold'
                      : 'text-[color:var(--mfa-ink-secondary)] hover:bg-[color:var(--mfa-surface-warm)]'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
            className="tap-scale min-h-[44px] px-3.5 inline-flex items-center gap-1 text-[14px] font-medium border border-[color:var(--mfa-border)] rounded-xl bg-white text-[color:var(--mfa-ink-secondary)] hover:bg-[color:var(--mfa-surface-warm)] disabled:opacity-30 disabled:pointer-events-none"
          >
            Next <ChevronRight size={15} aria-hidden="true" />
          </button>
        </nav>
      )}

      {/* Mobile filter sheet */}
      <BottomSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <div className="pb-4 space-y-4">
          {filterControls}
          <div className="flex gap-2.5 pt-1">
            {activeFilterCount > 0 && (
              <Button variant="secondary" size="md" onClick={clearFilters} className="flex-1">Clear</Button>
            )}
            <Button size="md" onClick={() => setFiltersOpen(false)} className="flex-1">Done</Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
