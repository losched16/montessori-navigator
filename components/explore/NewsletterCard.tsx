'use client'

import type { Newsletter } from '@/lib/newsletters'

// Tomorrow's Child cover card — 3:4 real cover art, issue label beneath.
// Opens the PDF exactly as the existing newsletters system does.
export default function NewsletterCard({ newsletter, width = 128, onOpen }: {
  newsletter: Newsletter
  /** Fixed px width for carousels; 'full' fills its grid cell */
  width?: number | 'full'
  /** Analytics hook — fired on open, alongside navigation */
  onOpen?: (newsletter: Newsletter) => void
}) {
  return (
    <a
      href={newsletter.pdfPath}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onOpen?.(newsletter)}
      aria-label={`Tomorrow's Child — ${newsletter.issueLabel} (opens PDF)`}
      className={`tap-scale group ${width === 'full' ? 'block w-full' : 'shrink-0 snap-start'}`}
      style={width === 'full' ? undefined : { width }}
    >
      <span className="block rounded-[14px] overflow-hidden border border-[color:var(--mfa-border)] bg-[color:var(--mfa-surface-warm)] shadow-sm group-hover:shadow-md transition">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={newsletter.coverImage}
          alt={`Tomorrow's Child cover, ${newsletter.issueLabel}`}
          className="w-full aspect-[3/4] object-cover object-top"
          loading="lazy"
        />
      </span>
      <span className="block text-[12px] font-medium text-[color:var(--mfa-ink-secondary)] text-center mt-1.5 group-hover:text-[color:var(--mfa-purple)] transition">
        {newsletter.issueLabel}
      </span>
    </a>
  )
}
