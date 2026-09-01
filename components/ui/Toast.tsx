'use client'

import { useEffect } from 'react'
import { Check } from 'lucide-react'

interface ToastProps {
  message: string | null
  onDismiss: () => void
  /** Optional second line */
  detail?: string
}

// Lightweight confirmation toast. Render near the page root; set `message`
// to show, it auto-dismisses after 2.5s.
export default function Toast({ message, detail, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onDismiss, 2500)
    return () => clearTimeout(t)
  }, [message, onDismiss])

  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] sm:bottom-8 z-[60] flex items-center gap-2.5 pl-3.5 pr-5 py-3 rounded-2xl bg-[color:var(--mfa-ink)] text-white shadow-lg max-w-[calc(100vw-2rem)]"
    >
      <span className="w-6 h-6 rounded-full bg-[color:var(--mfa-sage)] inline-flex items-center justify-center shrink-0" aria-hidden="true">
        <Check size={14} strokeWidth={3} />
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold leading-tight">{message}</span>
        {detail && <span className="block text-[12.5px] text-white/70 leading-tight mt-0.5">{detail}</span>}
      </span>
    </div>
  )
}
