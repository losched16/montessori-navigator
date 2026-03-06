'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useChild } from '@/lib/child-context'
import { DAY1_ACTIONS, START_HERE_FEATURES, RHYTHM_CATEGORIES, getFeaturesByPriority } from '@/lib/start-here-data'
import {
  getProgress,
  markFeatureExplored,
  markDay1Done,
  unmarkDay1Done,
  markComplete,
  dismissFromNav,
  showInNav,
  getCompletionPct,
  type StartHereProgress,
} from '@/lib/start-here-progress'

// ---------------------------------------------------------------------------
// Progress Ring SVG
// ---------------------------------------------------------------------------
function ProgressRing({ percent, size = 72 }: { percent: number; size?: number }) {
  const strokeWidth = 5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#5eead4" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-white">{percent}%</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Priority label styling
// ---------------------------------------------------------------------------
const PRIORITY_STYLES = {
  essential: { border: 'border-l-warm-500', label: 'Essential', labelColor: 'text-warm-700 bg-warm-50' },
  recommended: { border: 'border-l-blue-400', label: 'Recommended', labelColor: 'text-blue-700 bg-blue-50' },
  explore: { border: 'border-l-gray-300', label: 'Explore', labelColor: 'text-gray-600 bg-gray-100' },
}

const RHYTHM_STYLES: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  warm: { bg: 'bg-warm-50', border: 'border-warm-300', text: 'text-warm-800', badge: 'bg-warm-100 text-warm-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-700' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800', badge: 'bg-violet-100 text-violet-700' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-700' },
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export default function StartHerePage() {
  const [progress, setProgress] = useState<StartHereProgress>(getProgress())
  const [parentName, setParentName] = useState<string>('')
  const [openRhythm, setOpenRhythm] = useState<Set<string>>(new Set(['daily']))
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set())
  const { children } = useChild()
  const supabase = createClient()

  const refreshProgress = useCallback(() => {
    setProgress(getProgress())
  }, [])

  useEffect(() => {
    const loadParent = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: parent } = await supabase.from('parents').select('display_name').eq('user_id', user.id).single()
      if (parent?.display_name) setParentName(parent.display_name)
    }
    loadParent()
  }, [])

  const completionPct = getCompletionPct()
  const isCompleted = progress.completedAt !== null

  // Handlers
  const handleDay1Toggle = (id: string) => {
    if (progress.day1Completed.includes(id)) {
      unmarkDay1Done(id)
    } else {
      markDay1Done(id)
    }
    refreshProgress()
  }

  const handleTryFeature = (featureId: string) => {
    markFeatureExplored(featureId)
    refreshProgress()
  }

  const handleMarkComplete = () => {
    markComplete()
    refreshProgress()
  }

  const handleDismissNav = () => {
    dismissFromNav()
    refreshProgress()
  }

  const handleShowNav = () => {
    showInNav()
    refreshProgress()
  }

  const toggleRhythm = (id: string) => {
    setOpenRhythm(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleFeature = (id: string) => {
    setExpandedFeatures(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const essentialFeatures = getFeaturesByPriority('essential')
  const recommendedFeatures = getFeaturesByPriority('recommended')
  const exploreFeatures = getFeaturesByPriority('explore')

  return (
    <div className="max-w-3xl mx-auto pb-20 sm:pb-0">

      {/* ================================================================ */}
      {/* HERO BANNER                                                      */}
      {/* ================================================================ */}
      {isCompleted ? (
        <div className="bg-gradient-to-br from-emerald-500 to-warm-500 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center gap-4">
            <div className="text-3xl">🎉</div>
            <div>
              <h1 className="text-lg font-bold">You&apos;re all set!</h1>
              <p className="text-white/70 text-sm mt-0.5">You&apos;ve explored Navigator. Come back any time for rhythm reminders.</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleShowNav}
              className="px-3 py-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              Show in sidebar again
            </button>
            <Link
              href="/dashboard"
              className="px-3 py-1.5 text-xs font-medium bg-white text-warm-700 rounded-lg hover:bg-white/90 transition"
            >
              Go to Dashboard →
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-navy-700 to-navy-500 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🚀</span>
                <div className="text-xs uppercase tracking-wider text-white/50 font-medium">Start Here</div>
              </div>
              <h1 className="text-lg sm:text-xl font-bold">
                Welcome{parentName ? ` ${parentName}` : ''}!
              </h1>
              <p className="text-white/60 text-sm mt-1 leading-relaxed max-w-lg">
                This page walks you through every feature so you can get
                the most out of Navigator from day one. Follow the steps
                below and explore at your own pace.
              </p>
            </div>
            <ProgressRing percent={completionPct} />
          </div>

          {/* Stat pills */}
          <div className="flex gap-3 mt-4">
            <div className="px-3 py-1.5 bg-white/10 rounded-lg text-xs">
              <span className="font-bold">{progress.day1Completed.length}/4</span>
              <span className="text-white/50 ml-1">Day 1</span>
            </div>
            <div className="px-3 py-1.5 bg-white/10 rounded-lg text-xs">
              <span className="font-bold">{progress.featuresExplored.length}/12</span>
              <span className="text-white/50 ml-1">Features</span>
            </div>
            {children.length > 0 && (
              <div className="px-3 py-1.5 bg-white/10 rounded-lg text-xs">
                <span className="font-bold">{children.length}</span>
                <span className="text-white/50 ml-1">{children.length === 1 ? 'Child' : 'Children'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* DAY 1 QUICK START                                                */}
      {/* ================================================================ */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">⚡</span>
          <h2 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">Your First Session</h2>
        </div>
        <p className="text-xs text-emerald-600 mb-4">Do these 4 things today. ~15 minutes total. You&apos;ll feel the value immediately.</p>

        <div className="space-y-3">
          {DAY1_ACTIONS.map(action => {
            const isDone = progress.day1Completed.includes(action.id)
            return (
              <div
                key={action.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition ${
                  isDone ? 'bg-emerald-100/50' : 'bg-white'
                }`}
              >
                <button
                  onClick={() => handleDay1Toggle(action.id)}
                  className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-200 text-emerald-800 hover:bg-emerald-300'
                  }`}
                >
                  {isDone ? '✓' : action.step}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-semibold ${isDone ? 'text-emerald-600 line-through' : 'text-emerald-900'}`}>
                      {action.icon} {action.title}
                    </h3>
                    <span className="text-[10px] text-emerald-500 font-medium">~{action.estimatedMinutes} min</span>
                  </div>
                  <p className={`text-xs leading-relaxed mt-0.5 ${isDone ? 'text-emerald-500' : 'text-emerald-700'}`}>
                    {action.description}
                  </p>
                  {!isDone && (
                    <Link
                      href={action.href}
                      className="inline-block mt-1.5 text-xs text-warm-700 font-medium hover:underline"
                    >
                      Go to {action.title.split(' ').slice(-1)} →
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* FEATURE WALKTHROUGHS                                             */}
      {/* ================================================================ */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🗺️</span>
          <h2 className="text-sm font-bold text-navy-600 uppercase tracking-wide">Feature Guide</h2>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          Explore each feature at your own pace. Click a card to learn more, then &quot;Try it&quot; to jump in.
        </p>

        {/* Essential */}
        <div className="mb-2">
          <div className="text-[10px] font-bold text-warm-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-warm-500 rounded" />
            Start with these
          </div>
          <div className="space-y-2 mb-5">
            {essentialFeatures.map(feature => (
              <FeatureCardItem
                key={feature.id}
                feature={feature}
                isExplored={progress.featuresExplored.includes(feature.id)}
                isExpanded={expandedFeatures.has(feature.id)}
                onToggle={() => toggleFeature(feature.id)}
                onTryIt={() => handleTryFeature(feature.id)}
              />
            ))}
          </div>
        </div>

        {/* Recommended */}
        <div className="mb-2">
          <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-blue-400 rounded" />
            Add when comfortable
          </div>
          <div className="space-y-2 mb-5">
            {recommendedFeatures.map(feature => (
              <FeatureCardItem
                key={feature.id}
                feature={feature}
                isExplored={progress.featuresExplored.includes(feature.id)}
                isExpanded={expandedFeatures.has(feature.id)}
                onToggle={() => toggleFeature(feature.id)}
                onTryIt={() => handleTryFeature(feature.id)}
              />
            ))}
          </div>
        </div>

        {/* Explore */}
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-gray-300 rounded" />
            Use as needed
          </div>
          <div className="space-y-2">
            {exploreFeatures.map(feature => (
              <FeatureCardItem
                key={feature.id}
                feature={feature}
                isExplored={progress.featuresExplored.includes(feature.id)}
                isExpanded={expandedFeatures.has(feature.id)}
                onToggle={() => toggleFeature(feature.id)}
                onTryIt={() => handleTryFeature(feature.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* RHYTHM GUIDE                                                     */}
      {/* ================================================================ */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🎵</span>
          <h2 className="text-sm font-bold text-navy-600 uppercase tracking-wide">Your Montessori Rhythm</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Build habits that compound over time. Here&apos;s what experienced Montessori parents do regularly.
        </p>

        <div className="space-y-3">
          {RHYTHM_CATEGORIES.map(cat => {
            const styles = RHYTHM_STYLES[cat.color]
            const isOpen = openRhythm.has(cat.id)
            return (
              <div key={cat.id} className={`${styles.bg} border ${styles.border} rounded-xl overflow-hidden`}>
                <button
                  onClick={() => toggleRhythm(cat.id)}
                  className="w-full text-left p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{cat.icon}</span>
                    <span className={`text-sm font-bold ${styles.text}`}>{cat.label}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${styles.badge}`}>
                      {cat.items.length} {cat.items.length === 1 ? 'habit' : 'habits'}
                    </span>
                  </div>
                  <span className={`text-lg ${styles.text} opacity-40`}>{isOpen ? '▾' : '▸'}</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 space-y-2">
                    {cat.items.map((item, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 flex items-start gap-3">
                        <span className="text-lg shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-navy-600">{item.action}</span>
                            <span className="text-[10px] text-gray-400">in {item.feature}</span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.whyItMatters}</p>
                          <Link
                            href={item.href}
                            className="inline-block mt-1 text-xs text-warm-700 font-medium hover:underline"
                          >
                            Open {item.feature} →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ================================================================ */}
      {/* COMPLETION FOOTER                                                */}
      {/* ================================================================ */}
      {!isCompleted && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-navy-600">Feeling oriented?</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                You can always find this page at <span className="font-mono text-gray-500">/dashboard/start-here</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDismissNav}
                className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Hide from sidebar
              </button>
              {completionPct >= 50 && (
                <button
                  onClick={handleMarkComplete}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-warm-500 hover:bg-warm-600 rounded-lg transition"
                >
                  Mark as Complete ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Feature Card Item (inline sub-component)
// ---------------------------------------------------------------------------
function FeatureCardItem({
  feature,
  isExplored,
  isExpanded,
  onToggle,
  onTryIt,
}: {
  feature: (typeof START_HERE_FEATURES)[0]
  isExplored: boolean
  isExpanded: boolean
  onToggle: () => void
  onTryIt: () => void
}) {
  const priorityStyle = PRIORITY_STYLES[feature.priority]

  return (
    <div className={`bg-white border border-gray-100 rounded-xl overflow-hidden border-l-4 ${priorityStyle.border}`}>
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-center gap-3 hover:bg-gray-50 transition"
      >
        <span className="text-xl shrink-0">{feature.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-navy-600">{feature.label}</span>
            {isExplored ? (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">✓ Explored</span>
            ) : (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-warm-50 text-warm-700">New</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{feature.tagline}</p>
        </div>
        <span className="text-gray-300 text-sm">{isExpanded ? '▾' : '▸'}</span>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 pt-3">
          <div className="mb-3">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">What you can do</h4>
            <ul className="space-y-1.5">
              {feature.whatYouCanDo.map((item, i) => (
                <li key={i} className="text-xs text-gray-700 leading-relaxed flex items-start gap-2">
                  <span className="text-warm-400 mt-0.5 shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro tip */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-bold">💡 Tip:</span> {feature.proTip}
            </p>
          </div>

          {/* Try it link */}
          <Link
            href={feature.href}
            onClick={onTryIt}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-warm-500 hover:bg-warm-600 rounded-lg transition"
          >
            Try {feature.label} →
          </Link>
        </div>
      )}
    </div>
  )
}
