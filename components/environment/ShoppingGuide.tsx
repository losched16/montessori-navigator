'use client'

import { useState } from 'react'
import type { RecommendedItem } from '@/lib/environment-guide'

const CATEGORY_LABELS: Record<string, string> = {
  furniture: 'Furniture',
  material: 'Materials',
  tool: 'Tools',
  storage: 'Storage & Organization',
  safety: 'Safety',
  decor: 'Decor & Display',
}

const PRICE_COLORS = {
  '$': 'text-green-600',
  '$$': 'text-amber-600',
  '$$$': 'text-red-500',
}

export default function ShoppingGuide({ items }: { items: RecommendedItem[] }) {
  const [expandedDiy, setExpandedDiy] = useState<number | null>(null)

  if (items.length === 0) return null

  // Group by category
  const grouped = items.reduce<Record<string, RecommendedItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🛒</span>
        <h3 className="text-sm font-bold text-navy-600 uppercase tracking-wide">Shopping Guide</h3>
      </div>

      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{CATEGORY_LABELS[category] || category}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categoryItems.map((item, i) => {
              const globalIndex = items.indexOf(item)
              return (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition">
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-sm font-semibold text-navy-600">{item.name}</h5>
                        <span className={`text-xs font-bold ${PRICE_COLORS[item.priceRange]}`}>{item.priceRange}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mb-2">{item.description}</p>
                      <div className="flex items-center gap-3">
                        <a
                          href={`https://www.amazon.com/s?k=${encodeURIComponent(item.searchQuery)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-warm-600 hover:text-warm-700 font-medium"
                        >
                          Search on Amazon →
                        </a>
                        {item.diyAlternative && (
                          <button
                            onClick={() => setExpandedDiy(expandedDiy === globalIndex ? null : globalIndex)}
                            className="text-xs text-purple-500 hover:text-purple-600 font-medium"
                          >
                            {expandedDiy === globalIndex ? 'Hide DIY' : 'DIY Option'}
                          </button>
                        )}
                      </div>
                      {item.diyAlternative && expandedDiy === globalIndex && (
                        <div className="mt-2 p-2 bg-purple-50 rounded-lg text-xs text-purple-800 leading-relaxed">
                          ✂️ {item.diyAlternative}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
