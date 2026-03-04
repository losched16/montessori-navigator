'use client'

import { useState } from 'react'
import type { SetupTip } from '@/lib/environment-guide'

const PRIORITY_STYLES = {
  essential: { bg: 'bg-teal-50', border: 'border-l-teal-500', label: 'Essential', labelColor: 'text-teal-700' },
  recommended: { bg: 'bg-blue-50', border: 'border-l-blue-400', label: 'Recommended', labelColor: 'text-blue-600' },
  nice_to_have: { bg: 'bg-gray-50', border: 'border-l-gray-300', label: 'Nice to Have', labelColor: 'text-gray-500' },
}

export default function SetupGuide({ tips }: { tips: SetupTip[] }) {
  const [showAll, setShowAll] = useState(false)

  if (tips.length === 0) return null

  const essential = tips.filter(t => t.priority === 'essential')
  const recommended = tips.filter(t => t.priority === 'recommended')
  const niceToHave = tips.filter(t => t.priority === 'nice_to_have')

  const visibleTips = showAll ? tips : [...essential, ...recommended]
  const hiddenCount = niceToHave.length

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🛠️</span>
        <h3 className="text-sm font-bold text-navy-600 uppercase tracking-wide">Setup Guide</h3>
      </div>
      <div className="space-y-2">
        {(showAll ? [...essential, ...recommended, ...niceToHave] : [...essential, ...recommended]).map((tip, i) => {
          const style = PRIORITY_STYLES[tip.priority]
          return (
            <div key={i} className={`${style.bg} border-l-4 ${style.border} rounded-r-lg p-3 flex items-start gap-3`}>
              <span className="text-lg shrink-0">{tip.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-relaxed">{tip.text}</p>
                <span className={`text-[10px] font-medium uppercase tracking-wide ${style.labelColor} mt-1 inline-block`}>{style.label}</span>
              </div>
            </div>
          )
        })}
      </div>
      {!showAll && hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 text-xs text-teal-600 hover:text-teal-700 font-medium"
        >
          Show {hiddenCount} more tip{hiddenCount > 1 ? 's' : ''} →
        </button>
      )}
    </div>
  )
}
