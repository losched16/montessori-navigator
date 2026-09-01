'use client'

// Minimal product analytics for Family Alliance v1.
//
// There is no analytics provider in the repo today (only the Rewardful
// affiliate snippet and the server-side GHL marketing sync). This module is
// the single place product events go through:
//
//   - trackEvent(name, props) — typed names, fire-and-forget, NEVER throws
//   - transport: GA4 gtag when NEXT_PUBLIC_GA_MEASUREMENT_ID is configured
//     (script injected in app/layout.tsx), otherwise window.plausible or a
//     plain dataLayer push if the site later adds GTM — otherwise a no-op.
//   - NEXT_PUBLIC_ANALYTICS_DEBUG=1 logs events to the console for QA.
//
// PRIVACY CONTRACT (do not weaken): events describe BEHAVIOR, never family
// content. No child names, no dates of birth, no observation text, no chat
// text, no saved-guidance content, no search queries, no emails, no child
// IDs. Categorical metadata only (age_plane, topic keys, categories,
// booleans, counts).

import { useEffect, useRef } from 'react'
import type { Child } from '@/lib/supabase'
import { getAgePlane } from '@/lib/utils'

export type AnalyticsEvent =
  // Home
  | 'home_viewed'
  | 'home_abigail_clicked'
  // Abigail
  | 'abigail_viewed'
  | 'abigail_message_sent'
  | 'abigail_followup_clicked'
  | 'abigail_log_moment_clicked'
  | 'guidance_saved'
  // My Child
  | 'my_child_viewed'
  | 'moment_composer_opened'
  | 'moment_logged'
  | 'growth_area_opened'
  | 'growth_level_updated'
  | 'milestone_updated'
  // Explore
  | 'explore_viewed'
  | 'explore_topic_opened'
  | 'explore_search_used'
  | 'explore_result_opened'
  // Content (generic, fired from any surface via `source`)
  | 'activity_opened'
  | 'article_opened'
  | 'resource_opened'
  | 'tomorrows_child_opened'
  // Cross-cutting
  | 'child_switched'
  | 'saved_guidance_viewed'
  | 'guidance_open_conversation_clicked'

export type AnalyticsProps = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    plausible?: (name: string, opts?: { props?: Record<string, any> }) => void
    dataLayer?: any[]
  }
}

const DEBUG = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === '1'

/** Fire-and-forget product event. Never throws into user flows. */
export function trackEvent(name: AnalyticsEvent, props: AnalyticsProps = {}): void {
  try {
    if (typeof window === 'undefined') return
    // Strip undefined values so providers get clean payloads
    const clean: Record<string, string | number | boolean> = {}
    for (const [k, v] of Object.entries(props)) {
      if (v !== undefined) clean[k] = v
    }
    if (DEBUG) console.info('[analytics]', name, clean)

    if (typeof window.gtag === 'function') {
      window.gtag('event', name, clean)
    } else if (typeof window.plausible === 'function') {
      window.plausible(name, { props: clean })
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...clean })
    }
    // No provider configured: silent no-op by design.
  } catch {
    // Analytics must never break the product.
  }
}

/** The only child-derived fields analytics is allowed to see. */
export function getSafeChildAnalyticsContext(child: Child | null | undefined): {
  has_child: boolean
  age_plane?: string
} {
  if (!child) return { has_child: false }
  return { has_child: true, age_plane: getAgePlane(child.date_of_birth) }
}

/** Bucket a count so exact library sizes aren't reported. */
export function countBucket(n: number): string {
  if (n <= 0) return '0'
  if (n <= 3) return '1-3'
  if (n <= 10) return '4-10'
  return '10+'
}

/**
 * Fire a view-style event once per distinct key for the lifetime of the
 * component (guards against React Strict Mode double-effects in dev and
 * against re-renders). Pass `ready: false` to defer until context loads.
 */
export function useTrackView(
  name: AnalyticsEvent,
  props: AnalyticsProps,
  opts: { key?: string; ready?: boolean } = {},
): void {
  const firedFor = useRef<string | null>(null)
  const key = opts.key ?? 'once'
  const ready = opts.ready !== false
  useEffect(() => {
    if (!ready) return
    if (firedFor.current === key) return
    firedFor.current = key
    trackEvent(name, props)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, key])
}
