'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Bookmark, BookmarkCheck, NotebookPen, MessageCircle, BookOpen, Eye, ChevronRight, Play } from 'lucide-react'
import { renderMarkdown } from '@/lib/simple-markdown'
import type { AbigailAttachments } from '@/lib/abigail'
import type { HomeActivity } from '@/lib/family-home'
import YouTubeEmbed from '@/components/youtube-embed'
import ActivityDetailSheet from '@/components/family/ActivityDetailSheet'
import AbigailMark from './AbigailMark'

interface AssistantMessageProps {
  content: string
  saved: boolean
  onToggleSave: () => void
  onAskFollowUp: () => void
  childFirstName?: string
  attachments?: AbigailAttachments
  followUps?: string[]
  onSendFollowUp?: (text: string) => void
}

// Abigail's response as a guidance document, not a chat bubble: mark on top,
// structured markdown beneath, then connection cards and a quiet action row.
export default function AssistantMessage({
  content, saved, onToggleSave, onAskFollowUp, childFirstName,
  attachments, followUps, onSendFollowUp,
}: AssistantMessageProps) {
  const [openActivity, setOpenActivity] = useState<HomeActivity | null>(null)

  // Split out [VIDEO:id] markers; text parts render as safe markdown.
  const parts = content.split(/\[VIDEO:([a-zA-Z0-9_-]+)\]/)

  const actionButton = 'tap-scale inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-full text-[13px] font-medium transition'

  return (
    <div className="flex gap-3">
      <AbigailMark size={28} className="mt-1" />
      <div className="min-w-0 flex-1">
        {parts.map((part, i) => {
          if (i % 2 === 1) {
            // Video block — framed, not dropped raw into prose
            return (
              <div key={i} className="my-4 rounded-[16px] bg-[color:var(--mfa-surface-warm)] p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.15em] uppercase text-[color:var(--mfa-clay)] mb-2">
                  <Play size={13} aria-hidden="true" />
                  Watch
                </div>
                <YouTubeEmbed videoId={part} title="Montessori Foundation video" />
              </div>
            )
          }
          if (!part.trim()) return null
          return (
            <div
              key={i}
              className="abigail-md"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(part) }}
            />
          )
        })}

        {/* Something to try — activity connection */}
        {attachments?.activity && (
          <button
            onClick={() => setOpenActivity(attachments.activity!)}
            className="tap-scale w-full text-left mt-4 rounded-[16px] bg-white border border-[color:var(--mfa-border)] p-3 flex items-center gap-3 hover:shadow-md transition"
          >
            <div className="relative w-[72px] h-[54px] rounded-xl overflow-hidden bg-[color:var(--mfa-surface-warm)] shrink-0">
              <Image src={attachments.activity.image} alt="" fill sizes="72px" className="object-cover" loading="lazy" />
            </div>
            <span className="flex-1 min-w-0">
              <span className="block text-[10.5px] font-bold tracking-[0.14em] uppercase text-[color:var(--mfa-sage)]">
                {attachments.activityIsFallback ? 'Something you could try' : attachments.activity.category}
              </span>
              <span className="block text-[14.5px] font-semibold text-[color:var(--mfa-ink)] truncate">
                {attachments.activity.name}
              </span>
              <span className="block text-[12px] text-[color:var(--mfa-ink-muted)]">
                {attachments.activity.duration}{attachments.activity.ages ? ` · ${attachments.activity.ages}` : ''}
              </span>
            </span>
            <span className="inline-flex items-center gap-0.5 text-[13px] font-semibold text-[color:var(--mfa-purple)] shrink-0">
              View
              <ChevronRight size={14} aria-hidden="true" />
            </span>
          </button>
        )}

        {/* Learn more — Foundation content connection */}
        {attachments?.article && (
          <Link
            href={`/dashboard/library/${attachments.article.slug}`}
            className="tap-scale block mt-3 rounded-[16px] bg-[color:var(--mfa-surface-warm)] border border-[color:var(--mfa-border)] p-3.5 hover:shadow-md transition"
          >
            <span className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.14em] uppercase text-[color:var(--mfa-clay)] mb-1">
              <BookOpen size={13} aria-hidden="true" />
              Learn more
            </span>
            <span className="block text-[14.5px] font-semibold text-[color:var(--mfa-ink)] leading-snug mb-0.5">
              {attachments.article.title}
            </span>
            <span className="text-[12px] text-[color:var(--mfa-ink-muted)]">
              {attachments.article.author} · {Math.max(2, Math.round((attachments.article.content || '').split(/\s+/).length / 220))} min read
            </span>
          </Link>
        )}

        {/* Notice next — the observation loop */}
        {attachments?.observePrompt && childFirstName && (
          <div className="mt-3 rounded-[16px] bg-[color:var(--mfa-surface-sage)] p-3.5">
            <span className="flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.14em] uppercase text-[color:var(--mfa-forest)] mb-1">
              <Eye size={13} aria-hidden="true" />
              Notice what happens next
            </span>
            <p className="text-[14px] leading-snug text-[color:var(--mfa-ink)] mb-2">
              {attachments.observePrompt}
            </p>
            <Link
              href="/dashboard/children?tab=moments&log=1"
              className="tap-scale inline-flex items-center gap-0.5 min-h-[40px] text-[13.5px] font-semibold text-[color:var(--mfa-forest)]"
            >
              Log a Moment
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </div>
        )}

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          <button
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={saved ? 'Guidance saved. Tap to unsave' : 'Save guidance'}
            className={`${actionButton} ${
              saved
                ? 'text-[color:var(--mfa-purple)] bg-[color:var(--mfa-purple-soft)]'
                : 'text-[color:var(--mfa-ink-secondary)] hover:bg-[color:var(--mfa-surface-warm)]'
            }`}
          >
            {saved ? <BookmarkCheck size={15} aria-hidden="true" /> : <Bookmark size={15} aria-hidden="true" />}
            {saved ? 'Saved' : 'Save Guidance'}
          </button>
          {childFirstName && (
            <Link
              href="/dashboard/children?tab=moments&log=1"
              className={`${actionButton} text-[color:var(--mfa-ink-secondary)] hover:bg-[color:var(--mfa-surface-warm)]`}
            >
              <NotebookPen size={15} aria-hidden="true" />
              Log a Moment
            </Link>
          )}
          <button
            onClick={onAskFollowUp}
            aria-label="Ask a follow-up question"
            className={`${actionButton} text-[color:var(--mfa-ink-secondary)] hover:bg-[color:var(--mfa-surface-warm)]`}
          >
            <MessageCircle size={15} aria-hidden="true" />
            Ask follow-up
          </button>
        </div>

        {/* Follow-up chips (latest response only) */}
        {followUps && followUps.length > 0 && onSendFollowUp && (
          <div className="flex flex-wrap gap-2 mt-3">
            {followUps.map(text => (
              <button
                key={text}
                onClick={() => onSendFollowUp(text)}
                className="tap-scale inline-flex items-center min-h-[40px] px-3.5 rounded-full border border-[color:var(--mfa-border)] bg-white text-[13.5px] font-medium text-[color:var(--mfa-purple)] hover:bg-[color:var(--mfa-purple-soft)] transition"
              >
                {text}
              </button>
            ))}
          </div>
        )}

        <ActivityDetailSheet
          activity={openActivity}
          childName={childFirstName || 'your child'}
          onClose={() => setOpenActivity(null)}
        />
      </div>
    </div>
  )
}
