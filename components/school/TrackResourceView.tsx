'use client'

import { useEffect } from 'react'

// Tiny client-only side-effect: when a school admin opens a resource detail
// page, log it to their school's onboarding state so the playbook/workbook
// items in the dashboard checklist auto-complete.
//
// We render this as a child of the (server) resource detail page so the
// rest of the page can stay server-rendered.

export default function TrackResourceView({ slug }: { slug: string }) {
  useEffect(() => {
    fetch('/api/school/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'resource_view', slug }),
    }).catch(() => {
      // Silent — view tracking is best-effort. If it fails, the worst case
      // is the checklist item doesn't auto-complete and the user sees the
      // resource as "still to read" until they revisit.
    })
  }, [slug])

  return null
}
