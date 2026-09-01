import { redirect } from 'next/navigation'

// The Journey experience now lives inside My Child (Phase 2). The legacy
// standalone page duplicated it with engagement metrics (streaks, counts)
// that were deliberately retired; the baby/toddler development guide it also
// hosted remains at /dashboard/development. Nothing unique remains here.
export default function JourneyRedirect() {
  redirect('/dashboard/children?tab=journey')
}
