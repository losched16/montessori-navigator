'use client'

import Link from 'next/link'
import { getArticleBySlug } from '@/lib/articles'
import type { RelatedArticleRef } from '@/lib/environment-guide'

export default function RelatedArticles({ articleRefs }: { articleRefs: RelatedArticleRef[] }) {
  const articles = articleRefs
    .map(ref => {
      const article = getArticleBySlug(ref.slug)
      return article ? { article, relevance: ref.relevance } : null
    })
    .filter(Boolean) as Array<{ article: ReturnType<typeof getArticleBySlug> & {}; relevance: string }>

  if (articles.length === 0) return null

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📖</span>
        <h3 className="text-sm font-bold text-navy-600 uppercase tracking-wide">Related Reading</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {articles.map(({ article, relevance }) => (
          <Link
            key={article.slug}
            href={`/dashboard/library/${article.slug}`}
            className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition group"
          >
            <h4 className="text-sm font-medium text-navy-600 leading-snug group-hover:text-teal-600 transition line-clamp-2 mb-1">
              {article.videoIds && article.videoIds.length > 0 && (
                <span className="inline-block mr-1.5 text-red-500 align-middle">▶</span>
              )}
              {article.title}
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-1">{relevance}</p>
            <p className="text-[10px] text-gray-400">{article.author}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
