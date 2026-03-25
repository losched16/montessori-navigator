import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: any) { try { cookieStore.set({ name, value, ...options }) } catch (e) {} },
          remove(name: string, options: any) { try { cookieStore.set({ name, value: '', ...options }) } catch (e) {} },
        },
      }
    )

    const { data: invitation } = await supabase
      .from('invitations')
      .select('type, status, expires_at, family_id, school_id')
      .eq('token', token)
      .single()

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    let familyName = null
    let schoolName = null

    if (invitation.family_id) {
      const { data: family } = await supabase
        .from('families')
        .select('name')
        .eq('id', invitation.family_id)
        .single()
      familyName = family?.name
    }

    if (invitation.school_id) {
      const { data: school } = await supabase
        .from('schools')
        .select('name, logo_url')
        .eq('id', invitation.school_id)
        .single()
      schoolName = school?.name
    }

    return NextResponse.json({
      type: invitation.type,
      status: invitation.status,
      expires_at: invitation.expires_at,
      familyName,
      schoolName,
      expired: new Date(invitation.expires_at) < new Date(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
  }
}
