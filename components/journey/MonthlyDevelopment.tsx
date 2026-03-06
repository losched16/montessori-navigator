'use client'

import { useState } from 'react'
import type { MonthlyGuide } from '@/lib/monthly-development'

const CATEGORY_ICONS: Record<string, { emoji: string; label: string; color: string }> = {
  sensory: { emoji: '👁️', label: 'Sensory', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  motor: { emoji: '🏃', label: 'Motor', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  language: { emoji: '💬', label: 'Language', color: 'bg-green-50 text-green-700 border-green-200' },
  practical_life: { emoji: '🤲', label: 'Practical Life', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  cognitive: { emoji: '🧠', label: 'Cognitive', color: 'bg-rose-50 text-rose-700 border-rose-200' },
}

interface Props {
  guide: MonthlyGuide
  childName?: string
}

export default function MonthlyDevelopment({ guide, childName }: Props) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['milestones']))

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }

  const Section = ({ id, icon, title, children }: { id: string; icon: string; title: string; children: React.ReactNode }) => {
    const isOpen = openSections.has(id)
    return (
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-3">
        <button
          onClick={() => toggleSection(id)}
          className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg">{icon}</span>
            <span className="text-sm font-bold text-navy-600 uppercase tracking-wide">{title}</span>
          </div>
          <span className="text-gray-300 text-lg">{isOpen ? '▾' : '▸'}</span>
        </button>
        {isOpen && (
          <div className="border-t border-gray-100 p-4">
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-5 sm:p-6 text-white mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">👶</span>
          <div className="text-xs uppercase tracking-wider text-white/60 font-medium">Development Guide</div>
        </div>
        <h2 className="text-lg sm:text-xl font-bold mb-1">{guide.monthLabel}</h2>
        <p className="text-white/70 text-sm italic">{guide.tagline}</p>
        {childName && (
          <div className="mt-3 px-3 py-1.5 bg-white/10 rounded-lg inline-block">
            <span className="text-xs text-white/80">Showing guide for <strong>{childName}</strong></span>
          </div>
        )}
      </div>

      {/* Brain & Body Development */}
      <Section id="development" icon="🧠" title="Brain & Body Development">
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Brain Development</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{guide.brainDevelopment}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Body Development</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{guide.bodyDevelopment}</p>
          </div>
        </div>
      </Section>

      {/* Motor Milestones */}
      <Section id="milestones" icon="💪" title="Motor Milestones">
        <div className="space-y-4">
          {guide.grossMotor.shouldBeAbleTo.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wider">Should be able to</h4>
              </div>
              <ul className="space-y-1.5 pl-4">
                {guide.grossMotor.shouldBeAbleTo.map((item, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                    <span className="text-green-400 mt-1 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {guide.grossMotor.probablyAbleTo.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Probably able to</h4>
              </div>
              <ul className="space-y-1.5 pl-4">
                {guide.grossMotor.probablyAbleTo.map((item, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                    <span className="text-amber-400 mt-1 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {guide.grossMotor.mayEvenBeAbleTo.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wider">May even be able to</h4>
              </div>
              <ul className="space-y-1.5 pl-4">
                {guide.grossMotor.mayEvenBeAbleTo.map((item, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                    <span className="text-purple-400 mt-1 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Hand development */}
        {guide.handDevelopment.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">✋ Hand Development</h4>
            <ul className="space-y-1.5">
              {guide.handDevelopment.map((item, i) => (
                <li key={i} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                  <span className="text-warm-400 mt-1 shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* Communication */}
      <Section id="communication" icon="💬" title="Communication & Language">
        <div className="space-y-4">
          {guide.communication.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">What you may notice</h4>
              <ul className="space-y-1.5">
                {guide.communication.map((item, i) => (
                  <li key={i} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
                    <span className="text-blue-400 mt-1 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {guide.communicationTips.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-warm-600 uppercase tracking-wider mb-2">💡 Tips for parents</h4>
              <div className="space-y-2">
                {guide.communicationTips.map((tip, i) => (
                  <div key={i} className="bg-warm-50 border border-warm-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-warm-600 font-bold text-sm shrink-0">{i + 1}.</span>
                      <p className="text-sm text-warm-800 leading-relaxed">{tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Social-Emotional */}
      <Section id="social" icon="💛" title="Social & Emotional">
        <ul className="space-y-1.5">
          {guide.socialEmotional.map((item, i) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
              <span className="text-amber-400 mt-1 shrink-0">•</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* Activities */}
      <Section id="activities" icon="🎯" title="Activities to Try">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {guide.activities.map((activity, i) => {
            const cat = CATEGORY_ICONS[activity.category]
            return (
              <div key={i} className="border border-gray-100 rounded-xl p-3.5">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl shrink-0">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="text-sm font-semibold text-navy-600">{activity.name}</h5>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-2">{activity.description}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border ${cat?.color || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {cat?.emoji} {cat?.label}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      {/* Independence */}
      <Section id="independence" icon="🌟" title="Growing Independence">
        <ul className="space-y-1.5">
          {guide.independenceGains.map((item, i) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
              <span className="text-warm-400 mt-1 shrink-0">✦</span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      {/* Environment Tips */}
      <Section id="environment" icon="🏠" title="Preparing Your Home">
        <ul className="space-y-2">
          {guide.environmentTips.map((tip, i) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed flex items-start gap-2">
              <span className="text-indigo-400 mt-1 shrink-0">▸</span>
              {tip}
            </li>
          ))}
        </ul>
      </Section>

      {/* What to Watch For (celebrate) */}
      <Section id="watchFor" icon="👀" title="What to Watch For">
        <p className="text-xs text-gray-500 italic mb-3">
          Exciting developments to look for and celebrate this month.
          Every child develops at their own unique pace.
        </p>
        <div className="space-y-1.5">
          {guide.watchFor.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-700 leading-relaxed">
              <span className="text-amber-400 mt-0.5 shrink-0">🌱</span>
              {item}
            </div>
          ))}
        </div>
      </Section>
    </div>
  )
}
