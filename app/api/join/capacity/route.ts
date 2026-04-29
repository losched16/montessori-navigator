import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getInviteUsage } from '@/lib/school-invite-limits'

export const dynamic = 'force-dynamic'

// GET /api/join/capacity?slug=SCHOOL_SLUG
// Public endpoint used by /join/[slug] to decide whether a new family can
// enroll. Returns whether the school is at its trial cap so we can show a
// "school's trial is full" message instead of letting the signup proceed
// and silently fail at insert time.
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) {
    return NextResponse.json({ canEnroll: false, reason: 'missing_slug' }, { status: 400 })
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: school } = await service
    .from('schools')
    .select('id, subscription_status')
    .eq('slug', slug)
    .maybeSingle()

  if (!school) {
    return NextResponse.json({ canEnroll: false, reason: 'school_not_found' }, { status: 404 })
  }

  // Schools that are canceled/inactive can't take new enrollments
  const status = school.subscription_status as string | null
  if (status === 'canceled' || status === 'inactive') {
    return NextResponse.json({ canEnroll: false, reason: 'subscription_inactive' })
  }

  const usage = await getInviteUsage(service, school.id, status)

  if (usage.reachedLimit) {
    return NextResponse.json({
      canEnroll: false,
      reason: 'trial_cap_reached',
      isTrial: usage.isTrial,
      limit: usage.limit,
      used: usage.used,
    })
  }

  return NextResponse.json({
    canEnroll: true,
    isTrial: usage.isTrial,
    limit: usage.limit,
    used: usage.used,
  })
}
