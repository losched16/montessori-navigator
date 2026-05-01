'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { OnboardingState } from '@/lib/school-onboarding'

// Persistent checklist that lives at the top of the school dashboard. All
// items auto-detect from real data (see lib/school-onboarding.ts) — there is
// no manual checking. As the admin actually does each step (sends an invite,
// opens a playbook, customizes their profile) the next page load reflects it.
//
// Once 100% complete the widget collapses into a small badge they can re-expand.
// We don't permanently dismiss it because new resources or steps may be added
// later.

export default function OnboardingChecklist() {
  const [state, setState] = useState<OnboardingState | null>(null)
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/school/onboarding')
        if (res.ok) {
          const data: OnboardingState = await res.json()
          setState(data)
          // Default-collapse the widget once everything is done. Manual
          // re-expand still works.
          if (data.isComplete) setCollapsed(true)
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  if (loading || !state) return null

  const pct = Math.round((state.completedCount / state.totalCount) * 100)

  // Collapsed pill — minimal footprint once done
  if (collapsed && state.isComplete) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 hover:bg-emerald-100 transition"
      >
        <span>✓</span> Setup complete · view checklist
      </button>
    )
  }

  return (
    <section className="mb-8 bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-warm-600 mb-1">
              Setup checklist
            </div>
            <h2 className="text-base font-semibold text-navy-700">
              {state.isComplete
                ? 'You’re all set up. Beautiful.'
                : 'Make Family Alliance work for your school'}
            </h2>
            <p className="text-xs text-navy-600/70 mt-1">
              Items check off automatically as you complete them — no manual marking needed.
            </p>
          </div>
          {state.isComplete && (
            <button
              onClick={() => setCollapsed(true)}
              className="text-xs text-navy-600/60 hover:text-navy-700 whitespace-nowrap"
            >
              Hide
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-warm-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-xs font-medium text-navy-600 whitespace-nowrap">
            {state.completedCount} / {state.totalCount}
          </div>
        </div>
      </div>

      {/* Steps */}
      <ul className="divide-y divide-gray-100">
        {state.steps.map(step => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={`flex items-start gap-4 px-5 sm:px-6 py-4 transition ${
                step.completed
                  ? 'bg-emerald-50/40 hover:bg-emerald-50/60'
                  : 'hover:bg-gray-50'
              }`}
            >
              {/* Status indicator */}
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  step.completed
                    ? 'bg-emerald-500 text-white'
                    : 'border-2 border-gray-300 text-transparent'
                }`}
              >
                {step.completed ? '✓' : ''}
              </div>

              {/* Icon */}
              <div className="flex-shrink-0 text-xl leading-none mt-0.5">{step.icon}</div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3
                    className={`text-sm font-medium ${
                      step.completed ? 'text-navy-700/70 line-through' : 'text-navy-700'
                    }`}
                  >
                    {step.title}
                  </h3>
                  {step.completed && step.doneLabel && (
                    <span className="text-xs text-emerald-700 whitespace-nowrap">
                      {step.doneLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-navy-600/70 leading-relaxed mt-0.5">
                  {step.description}
                </p>
              </div>

              {/* Affordance */}
              {!step.completed && (
                <div className="flex-shrink-0 text-warm-600 text-sm font-medium self-center">
                  →
                </div>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
