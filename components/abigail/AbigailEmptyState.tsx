'use client'

import { Sprout, Heart, Repeat, CloudSun, BookOpen, Home as HomeIcon, Compass, Star, Clock3, type LucideIcon } from 'lucide-react'
import type { Child } from '@/lib/supabase'
import { getSuggestedPrompts, type SuggestedPrompt } from '@/lib/abigail'
import AbigailMark from './AbigailMark'

const ICONS: Record<SuggestedPrompt['icon'], LucideIcon> = {
  sprout: Sprout, heart: Heart, repeat: Repeat, cloud: CloudSun,
  book: BookOpen, home: HomeIcon, compass: Compass, star: Star,
}

const TONES: Record<SuggestedPrompt['tone'], string> = {
  sage: 'bg-[color:var(--mfa-surface-sage)]',
  warm: 'bg-[color:var(--mfa-clay-soft)]',
  purple: 'bg-[color:var(--mfa-purple-soft)]',
  cream: 'bg-[color:var(--mfa-surface-warm)]',
}

const ICON_TONES: Record<SuggestedPrompt['tone'], string> = {
  sage: 'text-[color:var(--mfa-forest)]',
  warm: 'text-[color:var(--mfa-clay)]',
  purple: 'text-[color:var(--mfa-purple)]',
  cream: 'text-[color:var(--mfa-ochre)]',
}

// Empty conversation state: quiet invitation + four contextual prompt cards.
export default function AbigailEmptyState({ child, onPickPrompt, onHistory, hasThreads }: {
  child: Child | undefined
  onPickPrompt: (text: string) => void
  onHistory: () => void
  hasThreads: boolean
}) {
  const prompts = getSuggestedPrompts(child)
  const first = child?.name.trim().split(/\s+/)[0]

  return (
    <div className="flex flex-col items-center text-center px-4 pt-10 sm:pt-16 pb-6 max-w-lg mx-auto">
      <AbigailMark size={48} className="mb-4" />
      <h2 className="font-[family-name:var(--mfa-serif)] text-[27px] sm:text-[30px] font-semibold text-[color:var(--mfa-ink)] tracking-tight mb-2">
        What can I help with?
      </h2>
      <p className="text-[14.5px] leading-relaxed text-[color:var(--mfa-ink-secondary)] mb-7 max-w-sm">
        {first
          ? `Ask me anything about ${first}, Montessori parenting, development, routines, or what to try next.`
          : 'Ask me anything about Montessori parenting, development, routines, or getting started at home.'}
      </p>

      <div className="grid grid-cols-2 gap-3 w-full">
        {prompts.map(prompt => {
          const Icon = ICONS[prompt.icon]
          return (
            <button
              key={prompt.text}
              onClick={() => onPickPrompt(prompt.text)}
              className={`tap-scale text-left p-4 rounded-[20px] min-h-[112px] flex flex-col justify-between gap-2 ${TONES[prompt.tone]} hover:shadow-md transition`}
            >
              <Icon size={20} className={ICON_TONES[prompt.tone]} aria-hidden="true" />
              <span className="text-[14px] font-medium leading-snug text-[color:var(--mfa-ink)]">
                {prompt.text}
              </span>
            </button>
          )
        })}
      </div>

      {hasThreads && (
        <button
          onClick={onHistory}
          className="tap-scale sm:hidden mt-6 inline-flex items-center gap-1.5 min-h-[44px] text-[14px] font-medium text-[color:var(--mfa-ink-secondary)]"
        >
          <Clock3 size={16} aria-hidden="true" />
          Conversation History
        </button>
      )}
    </div>
  )
}
