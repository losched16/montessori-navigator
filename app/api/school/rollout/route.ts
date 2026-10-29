import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase-server'
import { getInviteUsage, STAFF_BUFFER } from '@/lib/school-invite-limits'
import { rolloutTarget } from '@/lib/school-onboarding'

export const dynamic = 'force-dynamic'

// GET /api/school/rollout
// Everything the "Roll out to your families" guide shows about the caller's
// own school: its name, join link slug, how many families it covers, and live
// progress (invited / joined / waiting). Service role, scoped to the caller's
// school via school_staff — nothing is taken from the request.
export async function GET() {
  const { data: { user } } = await createServerSupabase().auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const service = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: staff } = await service.from('school_staff').select('school_id').eq('user_id', user.id).limit(1).maybeSingle()
  if (!staff) return NextResponse.json({ error: 'Only school staff can view this' }, { status: 403 })

  const { data: school } = await service
    .from('schools')
    .select('id, name, slug, family_count, subscription_status, is_comped')
    .eq('id', staff.school_id)
    .maybeSingle()
  if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 })

  const [{ data: enrolled }, { data: invites }, usage] = await Promise.all([
    service.from('school_families').select('family_id').eq('school_id', school.id).eq('status', 'active'),
    service.from('invitations').select('email, status').eq('school_id', school.id).eq('type', 'school_family'),
    getInviteUsage(service, school.id, school.subscription_status),
  ])
  const joined = (enrolled || []).length

  // Families who joined through the school link (or a different invitation)
  // never mark their emailed invitation as accepted, so "pending" overstates
  // who is still outstanding. Treat an invitation as waiting only if nobody in
  // an enrolled family has that email.
  const joinedEmails = new Set<string>()
  const familyIds = (enrolled || []).map(e => e.family_id)
  if (familyIds.length > 0) {
    const { data: members } = await service.from('family_members').select('parents(email)').in('family_id', familyIds)
    for (const m of members || []) {
      const p: any = Array.isArray((m as any).parents) ? (m as any).parents[0] : (m as any).parents
      if (p?.email) joinedEmails.add(String(p.email).toLowerCase())
    }
  }

  const invitedEmails = new Set((invites || []).map(i => String(i.email).toLowerCase()))
  const waiting = new Set(
    (invites || [])
      .filter(i => i.status === 'pending' && !joinedEmails.has(String(i.email).toLowerCase()))
      .map(i => String(i.email).toLowerCase()),
  )
  const isTrial = school.subscription_status === 'trialing'

  return NextResponse.json({
    schoolName: school.name,
    slug: school.slug,
    families: school.family_count || 0,
    staffBuffer: STAFF_BUFFER,
    isTrial,
    seatLimit: usage.limit,
    seatsUsed: usage.used,
    joined,
    invited: invitedEmails.size,
    waiting: waiting.size,
    goal: rolloutTarget(school.family_count, isTrial),
  })
}
