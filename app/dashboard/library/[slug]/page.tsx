'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getArticleBySlug, getArticlesByCategory, type Article } from '@/lib/articles'
import YouTubeEmbed from '@/components/youtube-embed'

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const article = getArticleBySlug(slug)

  if (!article) {
    return (
      <div className="mfa-editorial max-w-[680px] mx-auto text-center py-24">
        <div className="text-6xl mb-5 opacity-30">📄</div>
        <h1 className="serif text-[32px] font-bold text-[color:var(--ink)] mb-3 tracking-tight">Article Not Found</h1>
        <p className="text-[17px] text-[color:var(--ink-secondary)] mb-8">The article you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/dashboard/library" className="text-[15px] font-semibold text-[color:var(--ink)] hover:underline">
          ‹ Back to Library
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
    if (category.includes('Tomorrow')) return 'bg-warm-50 text-warm-700'
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
          <h3 key={i} className="serif text-[26px] font-bold text-[color:var(--ink)] mt-12 mb-4 tracking-tight leading-[1.15]">
            {trimmed}
          </h3>
        )
      }
      // Bullet list items
      if (trimmed.includes('\n•') || trimmed.startsWith('•')) {
        const items = trimmed.split('\n').filter(l => l.trim())
        return (
          <ul key={i} className="space-y-2 my-6 ml-2">
            {items.map((item, j) => (
              <li key={j} className="serif text-[19px] text-[color:var(--ink)] leading-[1.5] flex items-start gap-3">
                {item.startsWith('•') ? (
                  <>
                    <span className="text-[color:var(--accent-warm)] mt-1 shrink-0">•</span>
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
        <p key={i} className="serif text-[19px] text-[color:var(--ink)] leading-[1.62] mb-5">
          {trimmed}
        </p>
      )
    })
  }

  return (
    <div className="mfa-editorial bg-white -m-4 sm:-m-6 pb-24 sm:pb-16">
      {/* Subtle back affordance */}
      <div className="max-w-[720px] mx-auto px-5 sm:px-6 pt-6 sm:pt-10">
        <Link
          href="/dashboard/library"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--ink-secondary)] hover:text-[color:var(--ink)] transition"
        >
          <span className="text-[16px] leading-none">‹</span> Library
        </Link>
      </div>

      {/* Article header — editorial scale */}
      <header className="max-w-[720px] mx-auto px-5 sm:px-6 mt-8 sm:mt-12">
        {/* Category kicker — only one, uppercase */}
        {article.categories.filter(c => c !== 'MFA')[0] && (
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--accent-warm)] mb-4">
            {article.categories.filter(c => c !== 'MFA')[0]}
          </div>
        )}

        <h1 className="serif text-[40px] sm:text-[60px] leading-[0.98] font-bold text-[color:var(--ink)] mb-6 tracking-tight">
          {article.title}
        </h1>

        <div className="flex items-center gap-3 text-[14px] font-medium text-[color:var(--ink-secondary)] border-t border-[color:var(--separator)] pt-5">
          <span className="text-[color:var(--ink)]">{article.author}</span>
          {article.date && (
            <>
              <span className="text-[color:var(--separator)]">·</span>
              <span>{formatDate(article.date)}</span>
            </>
          )}
        </div>
      </header>

      <article className="max-w-[680px] mx-auto px-5 sm:px-6 mt-10 sm:mt-14">
        {/* Video embeds */}
        {article.videoIds && article.videoIds.length > 0 && (
          <div className="space-y-4 mb-10">
            {article.videoIds.map(id => (
              <YouTubeEmbed key={id} videoId={id} title={article.title} />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="prose-custom">
          {renderContent(article.content)}
        </div>

        {/* Tags — moved to footer position, more subdued */}
        {article.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[color:var(--separator)] flex flex-wrap gap-1.5">
            {article.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-gray-50 text-[color:var(--ink-secondary)] rounded-full text-[11px] font-medium">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Source attribution */}
        <div className="mt-10 pt-6 border-t border-[color:var(--separator)]">
          <p className="text-[12px] text-[color:var(--ink-muted)] italic">
            Originally published on montessori.org by the Montessori Foundation &amp; Montessori Family Alliance.
          </p>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="max-w-[720px] mx-auto px-5 sm:px-6 mt-16 sm:mt-24">
          <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-[color:var(--ink)] border-t border-[color:var(--separator)] pt-5 mb-6">
            More to read
          </div>
          <div className="divide-y divide-[color:var(--separator)]">
            {relatedArticles.map(related => (
              <Link
                key={related.slug}
                href={`/dashboard/library/${related.slug}`}
                className="group flex flex-col gap-1 py-5 first:pt-1"
              >
                <h4 className="serif text-[20px] sm:text-[22px] font-bold text-[color:var(--ink)] leading-[1.15] group-hover:opacity-70 transition tracking-tight line-clamp-3">
                  {related.title}
                </h4>
                <p className="text-[13px] text-[color:var(--ink-muted)] font-medium">{related.author}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
