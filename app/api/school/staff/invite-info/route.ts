import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// GET /api/school/staff/invite-info?token=...
//
// Public (the invitee isn't signed in yet). Looks the invitation up with the
// service role because the invitations table's RLS only shows a row to its
// creator or an already-signed-in matching parent — so the browser-side
// lookup the join page used to do returned nothing for every new staff
// member ("Invitation not found").
//
// Returns only what the join page needs to render: the invited address, the
// school's name, and whether the invite is still usable. The token itself is
// the credential (unguessable UUID), same as the emailed link.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')?.trim()
  if (!token || token.length > 100) {
    return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 })
  }

  const service = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: inv } = await service
    .from('invitations')
    .select('email, status, expires_at, school_id')
    .eq('token', token)
    .eq('type', 'school_staff')
    .maybeSingle()

  if (!inv) return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 })

  let schoolName: string | null = null
  if (inv.school_id) {
    const { data: school } = await service.from('schools').select('name').eq('id', inv.school_id).maybeSingle()
    schoolName = school?.name || null
  }

  return NextResponse.json({
    email: inv.email,
    schoolName,
    status: inv.status,
    expired: new Date(inv.expires_at) < new Date(),
  })
}
