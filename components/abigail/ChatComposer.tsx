'use client'

import { forwardRef } from 'react'
import { ArrowUp } from 'lucide-react'

interface ChatComposerProps {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  disabled: boolean
  childName?: string
}

// Substantial app-like composer: large rounded textarea + 48px send button.
// Lives sticky at the bottom of the chat column, above the bottom nav.
const ChatComposer = forwardRef<HTMLTextAreaElement, ChatComposerProps>(
  function ChatComposer({ value, onChange, onSend, disabled, childName }, ref) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (!disabled && value.trim()) onSend()
      }
    }

    return (
      <div className="border-t border-[color:var(--mfa-border)] bg-white px-3 sm:px-6 pt-3 pb-3 shrink-0">
        <div className="max-w-[800px] mx-auto">
          {childName && (
            <div className="mb-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[color:var(--mfa-purple-soft)] text-[11px] font-semibold text-[color:var(--mfa-purple)]">
                About {childName}
              </span>
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={ref}
              value={value}
              onChange={e => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Abigail anything..."
              aria-label="Message Abigail"
              rows={1}
              className="flex-1 resize-none px-4 py-3.5 border border-[color:var(--mfa-border)] rounded-[20px] text-[16px] bg-[color:var(--mfa-canvas)] text-[color:var(--mfa-ink)] placeholder:text-[color:var(--mfa-ink-muted)] focus:ring-2 focus:ring-[color:var(--mfa-purple)] focus:border-transparent outline-none max-h-36"
              style={{ minHeight: '52px' }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement
                t.style.height = 'auto'
                t.style.height = Math.min(t.scrollHeight, 144) + 'px'
              }}
            />
            <button
              onClick={onSend}
              disabled={!value.trim() || disabled}
              aria-label="Send message"
              className="tap-scale w-12 h-12 shrink-0 inline-flex items-center justify-center rounded-full bg-[color:var(--mfa-purple)] text-white transition disabled:opacity-35"
            >
              <ArrowUp size={22} strokeWidth={2.4} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    )
  }
)

export default ChatComposer
