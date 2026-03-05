'use client'

import type { MonthlyGuide } from '@/lib/monthly-development'

interface Props {
  guides: MonthlyGuide[]
  selectedId: string
  onSelect: (id: string) => void
  highlightedId?: string  // The child's current month
}

export default function MonthSelector({ guides, selectedId, onSelect, highlightedId }: Props) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📅</span>
        <h3 className="text-sm font-bold text-navy-600 uppercase tracking-wide">Month by Month</h3>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
        {guides.map(guide => {
          const isSelected = guide.id === selectedId
          const isHighlighted = guide.id === highlightedId
          return (
            <button
              key={guide.id}
              onClick={() => onSelect(guide.id)}
              className={`relative flex flex-col items-center px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition shrink-0 min-w-[52px] ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : isHighlighted
                    ? 'bg-indigo-50 border-2 border-indigo-300 text-indigo-700'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {isHighlighted && !isSelected && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white" />
              )}
              <span className="text-base mb-0.5">{guide.monthNumber <= 12 ? '👶' : guide.monthNumber <= 24 ? '🧒' : '👧'}</span>
              <span className="leading-tight">{guide.monthNumber <= 14 ? `${guide.monthNumber}m` : guide.monthLabel.replace(' Months', 'm').replace('Months', 'm')}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
