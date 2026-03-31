'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { getAllArticles, getAllCategories, getAllTags, type Article } from '@/lib/articles'
import { getAllNewsletters } from '@/lib/newsletters'

const ARTICLES = getAllArticles()
const LATEST_NEWSLETTERS = getAllNewsletters().slice(0, 6)
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

export default function LibraryPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [sort, setSort] = useState<SortOption>('newest')
  const [page, setPage] = useState(1)
  const perPage = 12

  const filteredArticles = useMemo(() => {
    let results = [...ARTICLES]

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
          a.categories.some(c => c === "Tomorrow's Child" || c.startsWith("TC "))
        )
      } else {
        const groupCats = CATEGORY_GROUPS[selectedCategory]
        if (groupCats) {
          results = results.filter(a =>
            a.categories.some(c => groupCats.includes(c))
          )
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
  }, [search, selectedCategory, selectedTag, sort])

  const totalPages = Math.ceil(filteredArticles.length / perPage)
  const paginatedArticles = filteredArticles.slice((page - 1) * perPage, page * perPage)

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (v: any) => void, value: any) => {
    setter(value)
    setPage(1)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getCategoryColor = (category: string): string => {
    if (category.includes('Parenting') || category.includes('Family Life')) return 'bg-purple-50 text-purple-600'
    if (category.includes('Education') || category.includes('Curriculum')) return 'bg-blue-50 text-blue-600'
    if (category.includes('Book')) return 'bg-amber-50 text-amber-600'
    if (category.includes('Video') || category.includes('Webinar')) return 'bg-red-50 text-red-600'
    if (category.includes('Tomorrow')) return 'bg-warm-50 text-warm-700'
    if (category.includes('Grandparent')) return 'bg-pink-50 text-pink-600'
    return 'bg-gray-50 text-gray-600'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-600">Library</h1>
        <p className="text-gray-500 text-sm mt-1">
          {ARTICLES.length} articles from the Montessori Foundation &amp; Family Alliance
        </p>
      </div>

      {/* Tomorrow's Child Featured Section */}
      {selectedCategory === 'all' && !search.trim() && (
        <div className="mb-6">
          {/* TC Banner */}
          <div className="bg-gradient-to-r from-navy-700 to-navy-500 rounded-[22px] sm:rounded-xl p-5 sm:p-6 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Newsletter</p>
                <h2 className="text-lg sm:text-xl font-bold text-white">Tomorrow&apos;s Child</h2>
                <p className="text-white/70 text-sm mt-1">The Montessori Foundation&apos;s newsletter for parents &amp; educators</p>
              </div>
              <button
                onClick={() => handleFilterChange(setSelectedCategory, "Tomorrow's Child")}
                className="tap-scale hidden sm:inline-flex px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition"
              >
                Browse All Issues
              </button>
            </div>
          </div>

          {/* Newsletter Cards */}
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:overflow-visible sm:pb-0">
            {LATEST_NEWSLETTERS.map(nl => (
              <a
                key={nl.slug}
                href={nl.pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-scale snap-start shrink-0 w-[140px] sm:w-auto"
              >
                <div className={`bg-gradient-to-br ${nl.coverColor} rounded-[18px] sm:rounded-xl p-4 h-[180px] sm:h-[160px] flex flex-col justify-between hover:shadow-md transition`}>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-white/60 font-medium">Tomorrow&apos;s Child</p>
                  </div>
                  <div>
                    <p className="text-base sm:text-sm font-bold text-white leading-tight">{nl.issueLabel}</p>
                    <p className="text-[10px] text-white/50 mt-1 flex items-center gap-1">
                      <span>📄</span> Read PDF
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => handleFilterChange(setSearch, e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={e => handleFilterChange(setSelectedCategory, e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
          >
            <option value="all">All Categories</option>
            {Object.keys(CATEGORY_GROUPS).map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>

          {/* Tag filter */}
          <select
            value={selectedTag}
            onChange={e => handleFilterChange(setSelectedTag, e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
          >
            <option value="all">All Tags</option>
            {TAGS.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => handleFilterChange(setSort, e.target.value as SortOption)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title_asc">Title A–Z</option>
            <option value="title_desc">Title Z–A</option>
          </select>
        </div>

        {/* Results count */}
        <div className="mt-3 text-xs text-gray-400">
          Showing {paginatedArticles.length} of {filteredArticles.length} articles
          {search && <span> matching &ldquo;{search}&rdquo;</span>}
        </div>
      </div>

      {/* Article Grid */}
      {paginatedArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {paginatedArticles.map(article => (
            <Link
              key={article.slug}
              href={`/dashboard/library/${article.slug}`}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition group"
            >
              {/* Categories */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {article.categories.filter(c => c !== 'MFA').slice(0, 2).map(cat => (
                  <span key={cat} className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getCategoryColor(cat)}`}>
                    {cat}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-navy-600 leading-snug mb-2 group-hover:text-warm-600 transition line-clamp-2">
                {article.videoIds && article.videoIds.length > 0 && (
                  <span className="inline-block mr-1.5 text-red-500 align-middle">▶</span>
                )}
                {article.title}
              </h3>

              {/* Excerpt */}
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-3">
                {article.excerpt}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>{article.author}</span>
                <span>{formatDate(article.date)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
          <div className="text-3xl mb-3">📚</div>
          <h3 className="font-medium text-navy-600 mb-1">No articles found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 7) {
                pageNum = i + 1
              } else if (page <= 4) {
                pageNum = i + 1
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i
              } else {
                pageNum = page - 3 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 text-sm rounded-lg transition ${
                    page === pageNum
                      ? 'bg-warm-500 text-white font-medium'
                      : 'text-gray-500 hover:bg-gray-50'
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
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
