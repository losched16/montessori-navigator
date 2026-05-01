import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import {
  getOnboardingState,
  markWelcomeSeen,
  recordResourceView,
} from '@/lib/school-onboarding'

export const dynamic = 'force-dynamic'

// GET  /api/school/onboarding         → checklist state for the admin's school
// POST /api/school/onboarding
//   body: { event: 'welcome' }                    → mark welcome page seen
//   body: { event: 'resource_view', slug: '…' }   → log a resource open
//
// All operations are scoped to the school the authenticated user admins.
// Resource views and welcome state aren't sensitive but we still gate behind
// the staff role to avoid stray writes from non-admins or unauthenticated
// callers.

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function getAuthedAdmin(req: NextRequest) {
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
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', status: 401 as const }

  const { data: staff } = await supabase
    .from('school_staff')
    .select('school_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!staff) return { error: 'You must be a school admin', status: 403 as const }

  return { user, schoolId: staff.school_id }
}

export async function GET(req: NextRequest) {
  const auth = await getAuthedAdmin(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const service = getServiceClient()
  const state = await getOnboardingState(service, auth.schoolId, auth.user.id)
  return NextResponse.json(state)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthedAdmin(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const body = await req.json().catch(() => ({}))
  const event = body?.event as string | undefined

  const service = getServiceClient()

  if (event === 'welcome') {
    await markWelcomeSeen(service, auth.schoolId)
    return NextResponse.json({ ok: true })
  }

  if (event === 'resource_view') {
    const slug = typeof body?.slug === 'string' ? body.slug : ''
    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }
    await recordResourceView(service, auth.schoolId, slug)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown event' }, { status: 400 })
}
