'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getArticleBySlug, getArticlesByCategory, type Article } from '@/lib/articles'

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const article = getArticleBySlug(slug)

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <div className="text-4xl mb-4">📄</div>
        <h1 className="text-xl font-semibold text-navy-600 mb-2">Article Not Found</h1>
        <p className="text-gray-500 mb-6">The article you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/dashboard/library" className="text-sm text-teal-600 hover:underline">
          ← Back to Library
        </Link>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getCategoryColor = (category: string): string => {
    if (category.includes('Parenting') || category.includes('Family Life')) return 'bg-purple-50 text-purple-600'
    if (category.includes('Education') || category.includes('Curriculum')) return 'bg-blue-50 text-blue-600'
    if (category.includes('Book')) return 'bg-amber-50 text-amber-600'
    if (category.includes('Video') || category.includes('Webinar')) return 'bg-red-50 text-red-600'
    if (category.includes('Tomorrow')) return 'bg-teal-50 text-teal-600'
    if (category.includes('Grandparent')) return 'bg-pink-50 text-pink-600'
    return 'bg-gray-50 text-gray-600'
  }

  // Get related articles from the same categories (excluding current)
  const relatedArticles: Article[] = []
  const seenSlugs = new Set([article.slug])
  for (const cat of article.categories) {
    if (cat === 'MFA') continue
    for (const related of getArticlesByCategory(cat)) {
      if (!seenSlugs.has(related.slug)) {
        seenSlugs.add(related.slug)
        relatedArticles.push(related)
      }
      if (relatedArticles.length >= 3) break
    }
    if (relatedArticles.length >= 3) break
  }

  // Convert plain text content to formatted paragraphs
  const renderContent = (content: string) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim())
    return paragraphs.map((para, i) => {
      const trimmed = para.trim()
      // Check if it looks like a heading (short, no period at end, starts with uppercase)
      if (trimmed.length < 100 && !trimmed.endsWith('.') && !trimmed.startsWith('•') && /^[A-Z]/.test(trimmed) && !trimmed.includes('•')) {
        return (
          <h3 key={i} className="text-lg font-semibold text-navy-600 mt-8 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            {trimmed}
          </h3>
        )
      }
      // Bullet list items
      if (trimmed.includes('\n•') || trimmed.startsWith('•')) {
        const items = trimmed.split('\n').filter(l => l.trim())
        return (
          <ul key={i} className="space-y-1.5 my-4 ml-2">
            {items.map((item, j) => (
              <li key={j} className="text-[15px] text-gray-700 leading-relaxed flex items-start gap-2">
                {item.startsWith('•') ? (
                  <>
                    <span className="text-teal-500 mt-1 shrink-0">•</span>
                    <span>{item.substring(1).trim()}</span>
                  </>
                ) : (
                  <span>{item}</span>
                )}
              </li>
            ))}
          </ul>
        )
      }
      return (
        <p key={i} className="text-[15px] text-gray-700 leading-[1.8] mb-4">
          {trimmed}
        </p>
      )
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/dashboard/library" className="hover:text-teal-600 transition">Library</Link>
        <span>→</span>
        <span className="text-gray-600 truncate">{article.title}</span>
      </div>

      {/* Article Header */}
      <article>
        <div className="mb-6">
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {article.categories.filter(c => c !== 'MFA').map(cat => (
              <span key={cat} className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(cat)}`}>
                {cat}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-navy-600 leading-tight mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            {article.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>By {article.author}</span>
            {article.date && (
              <>
                <span className="text-gray-300">·</span>
                <span>{formatDate(article.date)}</span>
              </>
            )}
          </div>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {article.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[11px]">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-100 mb-8" />

        {/* Content */}
        <div className="prose-custom">
          {renderContent(article.content)}
        </div>

        {/* Source attribution */}
        <div className="mt-10 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 italic">
            Originally published on montessori.org by the Montessori Foundation &amp; Montessori Family Alliance.
          </p>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="mt-10 pt-8 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wide mb-4">Related Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {relatedArticles.map(related => (
              <Link
                key={related.slug}
                href={`/dashboard/library/${related.slug}`}
                className="p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition group"
              >
                <h4 className="text-sm font-medium text-navy-600 leading-snug group-hover:text-teal-600 transition line-clamp-2 mb-1">
                  {related.title}
                </h4>
                <p className="text-[11px] text-gray-400">{related.author}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back to library */}
      <div className="mt-8 pb-8">
        <Link href="/dashboard/library" className="text-sm text-teal-600 hover:underline">
          ← Back to Library
        </Link>
      </div>
    </div>
  )
}
