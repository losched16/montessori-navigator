'use client'

import type { SafetyGuideline } from '@/lib/environment-guide'

const SEVERITY_STYLES = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', icon: '🚨', color: 'text-red-700', label: 'Critical' },
  important: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚠️', color: 'text-amber-700', label: 'Important' },
  tip: { bg: 'bg-gray-50', border: 'border-gray-200', icon: '💡', color: 'text-gray-600', label: 'Tip' },
}

export default function SafetyChecklist({ guidelines }: { guidelines: SafetyGuideline[] }) {
  if (guidelines.length === 0) return null

  // Sort by severity: critical first, then important, then tip
  const sorted = [...guidelines].sort((a, b) => {
    const order = { critical: 0, important: 1, tip: 2 }
    return order[a.severity] - order[b.severity]
  })

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🛡️</span>
        <h3 className="text-sm font-bold text-navy-600 uppercase tracking-wide">Safety Checklist</h3>
      </div>
      <div className="space-y-2">
        {sorted.map((guideline, i) => {
          const style = SEVERITY_STYLES[guideline.severity]
          return (
            <div key={i} className={`${style.bg} border ${style.border} rounded-lg p-3 flex items-start gap-3`}>
              <span className="text-base shrink-0">{style.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${style.color}`}>{guideline.text}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
