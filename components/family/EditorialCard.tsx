'use client'

import Link from 'next/link'
import { BookOpen, ChevronRight } from 'lucide-react'
import type { Article } from '@/lib/articles'

// One learning recommendation — a single Foundation article, not a grid.
export default function EditorialCard({ article }: { article: Article }) {
  const category = article.categories.filter(c => c !== 'MFA' && !c.startsWith('TC '))[0] || 'Montessori'
  const minutes = Math.max(2, Math.round((article.content || '').split(/\s+/).length / 220))

  return (
    <Link
      href={`/dashboard/library/${article.slug}`}
      className="tap-scale block rounded-[20px] bg-[color:var(--mfa-surface-warm)] border border-[color:var(--mfa-border)] p-6 hover:shadow-md transition group"
    >
      <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-[color:var(--mfa-clay)] mb-2.5">
        <BookOpen size={14} aria-hidden="true" />
        {category}
      </div>
      <h3 className="font-[family-name:var(--mfa-serif)] text-[21px] leading-snug font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-2 group-hover:opacity-80 transition">
        {article.title}
      </h3>
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-[color:var(--mfa-ink-muted)]">
          {article.author} · {minutes} min read
        </span>
        <span className="inline-flex items-center gap-0.5 text-[14px] font-semibold text-[color:var(--mfa-purple)]">
          Read
          <ChevronRight size={15} aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}
