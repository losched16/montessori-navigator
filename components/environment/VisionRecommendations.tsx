'use client'

import { useState } from 'react'

interface Recommendation {
  title: string
  description: string
  priority: 'essential' | 'recommended' | 'nice_to_have'
  estimated_cost: 'free' | '$' | '$$' | '$$$'
}

interface Props {
  recommendations: Recommendation[]
  strengths: string[]
  safetyConcerns: string[]
  roomDescription: string
}

const PRIORITY_CONFIG = {
  essential: { label: 'Essential', color: 'bg-warm-100 text-warm-800 border-warm-200', icon: '⭐' },
  recommended: { label: 'Recommended', color: 'bg-blue-50 text-blue-800 border-blue-100', icon: '👍' },
  nice_to_have: { label: 'Nice to Have', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '💡' },
}

const COST_LABELS: Record<string, string> = {
  free: 'Free',
  '$': 'Under $25',
  '$$': '$25–$100',
  '$$$': '$100+',
}

export default function VisionRecommendations({ recommendations, strengths, safetyConcerns, roomDescription }: Props) {
  const [showAll, setShowAll] = useState(false)

  const essentials = recommendations.filter(r => r.priority === 'essential')
  const recommended = recommendations.filter(r => r.priority === 'recommended')
  const niceToHave = recommendations.filter(r => r.priority === 'nice_to_have')

  const displayRecs = showAll ? recommendations : recommendations.slice(0, 4)

  return (
    <div className="space-y-4">
      {/* Room description */}
      <div className="bg-navy-50 rounded-xl p-4 border border-navy-100">
        <h4 className="text-sm font-semibold text-navy-700 mb-1">Room Analysis</h4>
        <p className="text-sm text-navy-600">{roomDescription}</p>
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <h4 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center gap-1.5">
            <span>✓</span> What Your Room Does Well
          </h4>
          <ul className="space-y-1">
            {strengths.map((s, i) => (
              <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Safety concerns */}
      {safetyConcerns.length > 0 && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-1.5">
            <span>⚠️</span> Safety Concerns
          </h4>
          <ul className="space-y-1">
            {safetyConcerns.map((c, i) => (
              <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h4 className="text-sm font-semibold text-navy-700 mb-3 flex items-center gap-1.5">
          <span>🔧</span> Transformation Recommendations
          <span className="text-xs font-normal text-gray-400 ml-1">
            ({essentials.length} essential · {recommended.length} recommended · {niceToHave.length} nice-to-have)
          </span>
        </h4>

        <div className="space-y-2">
          {displayRecs.map((rec, i) => {
            const config = PRIORITY_CONFIG[rec.priority]
            return (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{config.icon}</span>
                      <h5 className="text-sm font-medium text-gray-800">{rec.title}</h5>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{rec.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {COST_LABELS[rec.estimated_cost] || rec.estimated_cost}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {recommendations.length > 4 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="mt-2 text-sm text-warm-600 hover:text-warm-700 font-medium"
          >
            Show {recommendations.length - 4} more recommendations →
          </button>
        )}
      </div>
    </div>
  )
}
