import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// GET /api/invite/info?token=...
//
// Public: the invitee usually isn't signed in (often has no account yet). The
// invitations table's RLS only shows a row to its creator or to a signed-in
// parent whose email matches, so reading it as the visitor returned nothing
// and every new spouse / family saw "Invitation not found". This looks the
// invitation up with the service role and returns only what the page needs to
// render. The token is the credential (unguessable UUID), same as the link.
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')?.trim()
    if (!token || token.length > 100) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    const service = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: invitation } = await service
      .from('invitations')
      .select('type, status, expires_at, family_id, school_id, email')
      .eq('token', token)
      .maybeSingle()

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    let familyName: string | null = null
    let schoolName: string | null = null

    if (invitation.family_id) {
      const { data: family } = await service.from('families').select('name').eq('id', invitation.family_id).maybeSingle()
      familyName = family?.name ?? null
    }
    if (invitation.school_id) {
      const { data: school } = await service.from('schools').select('name').eq('id', invitation.school_id).maybeSingle()
      schoolName = school?.name ?? null
    }

    return NextResponse.json({
      type: invitation.type,
      status: invitation.status,
      expires_at: invitation.expires_at,
      email: invitation.email,
      familyName,
      schoolName,
      expired: new Date(invitation.expires_at) < new Date(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
