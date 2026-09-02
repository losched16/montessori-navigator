'use client'

import { Search, X } from 'lucide-react'

// Prominent Explore search field — the front door to everything.
export default function ExploreSearch({ value, onChange }: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--mfa-ink-muted)] pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="What do you need help with?"
        aria-label="Search Montessori articles, activities, guides and videos"
        className="w-full h-[56px] pl-12 pr-12 rounded-[20px] bg-white border border-[color:var(--mfa-border)] text-[16px] text-[color:var(--mfa-ink)] placeholder:text-[color:var(--mfa-ink-muted)] focus:ring-2 focus:ring-[color:var(--mfa-navy)] focus:border-transparent outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="tap-scale absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 inline-flex items-center justify-center rounded-full text-[color:var(--mfa-ink-secondary)] hover:bg-[color:var(--mfa-surface-warm)]"
        >
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
