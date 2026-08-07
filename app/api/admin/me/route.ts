import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isSuperAdmin } from '@/lib/super-admin'

export const dynamic = 'force-dynamic'

// GET /api/admin/me
// Server-side super-admin check for the /admin layout gate. Authenticates the
// user from their session cookie, then checks super_admins via the service-role
// client (bypasses RLS). Returns { authenticated, isSuperAdmin } so the layout
// can distinguish "log in" from "not allowed".
export async function GET() {
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
  if (!user) {
    return NextResponse.json({ authenticated: false, isSuperAdmin: false })
  }

  const ok = await isSuperAdmin(user.id)
  return NextResponse.json({ authenticated: true, isSuperAdmin: ok })
}
