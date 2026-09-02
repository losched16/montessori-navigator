'use client'

export type ChildTab = 'overview' | 'journey' | 'moments' | 'growth'

const TABS: Array<{ key: ChildTab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'journey', label: 'Journey' },
  { key: 'moments', label: 'Moments' },
  { key: 'growth', label: 'Growth' },
]

// My Child tab bar: purple text + underline for the active tab.
export default function ChildTabs({ active, onChange }: {
  active: ChildTab
  onChange: (tab: ChildTab) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="My Child sections"
      className="flex gap-1 border-b border-[color:var(--mfa-border)] mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide"
    >
      {TABS.map(tab => {
        const selected = tab.key === active
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.key)}
            className={`tap-scale relative shrink-0 px-3 min-h-[48px] text-[14.5px] transition ${
              selected
                ? 'font-semibold text-[color:var(--mfa-navy)]'
                : 'font-medium text-[color:var(--mfa-ink-secondary)] hover:text-[color:var(--mfa-navy)]'
            }`}
          >
            {tab.label}
            {selected && (
              <span className="absolute left-2 right-2 bottom-0 h-[3px] rounded-t-full bg-[color:var(--mfa-gold)]" aria-hidden="true" />
            )}
          </button>
        )
      })}
    </div>
  )
}
