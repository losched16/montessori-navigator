'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  /** Accessible label when no visible title is rendered */
  ariaLabel?: string
}

// Mobile bottom sheet that becomes a centered dialog on sm+ screens.
// Focus moves into the panel on open; Escape and backdrop click close it.
export default function BottomSheet({ open, onClose, title, children, ariaLabel }: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      // Minimal focus trap: keep Tab inside the panel
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previouslyFocused.current?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title || ariaLabel || 'Dialog'}
    >
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full sm:max-w-md max-h-[85vh] overflow-y-auto bg-white rounded-t-[24px] sm:rounded-[24px] shadow-xl outline-none pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4"
      >
        {/* Grab handle (mobile affordance) */}
        <div className="sm:hidden pt-3 flex justify-center" aria-hidden="true">
          <div className="w-9 h-1 rounded-full bg-[color:var(--mfa-border)]" />
        </div>
        <div className="flex items-center justify-between px-5 pt-3 sm:pt-5">
          {title ? (
            <h2 className="font-[family-name:var(--mfa-serif)] text-[20px] font-semibold text-[color:var(--mfa-ink)]">{title}</h2>
          ) : <span />}
          <button
            onClick={onClose}
            aria-label="Close"
            className="tap-scale w-11 h-11 -mr-2 inline-flex items-center justify-center rounded-full text-[color:var(--mfa-ink-secondary)] hover:bg-[color:var(--mfa-surface-warm)]"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="px-5 pt-1">{children}</div>
      </div>
    </div>
  )
}
