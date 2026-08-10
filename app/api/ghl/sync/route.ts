import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { syncContactToGHL } from '@/lib/ghl'

export const dynamic = 'force-dynamic'

// POST /api/ghl/sync
//
// Upserts the current user into GHL, tagged by their actual role(s) derived
// from the database — 'parent' if they have a parent record, 'school-admin'
// if they're on school_staff (with the school name as company). Someone who
// is both gets both tags. Called fire-and-forget from the dashboard + school
// layouts (once per session) so new signups flow into GHL automatically for
// segmented marketing. Nothing is taken from the client — email and roles come
// from the session + DB, so it can't be used to inject arbitrary contacts.
export async function POST() {
  const cookieStore = cookies()
  const ssr = createServerClient(
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

  const { data: { user } } = await ssr.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const tags: string[] = []
  let name: string | null = null
  let email: string | null = user.email || null
  let companyName: string | null = null

  const { data: parent } = await service
    .from('parents')
    .select('display_name, email')
    .eq('user_id', user.id)
    .maybeSingle()
  if (parent) {
    tags.push('parent')
    name = parent.display_name || name
    email = parent.email || email
  }

  const { data: staff } = await service
    .from('school_staff')
    .select('school_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  if (staff) {
    tags.push('school-admin')
    const { data: school } = await service
      .from('schools')
      .select('name')
      .eq('id', staff.school_id)
      .maybeSingle()
    companyName = school?.name || null
  }

  if (!email || tags.length === 0) {
    return NextResponse.json({ ok: false, reason: 'no email or role' })
  }

  const ok = await syncContactToGHL({ email, name, tags, companyName })
  return NextResponse.json({ ok })
}
