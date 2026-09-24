import { redirect } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase-server'
import { isSuperAdmin } from '@/lib/super-admin'

// SERVER-ONLY. Content Studio uses the platform's existing internal-user role
// (super_admins) — a signed-in parent or school admin is not enough.

// For server components: signed-out → login (and back); signed-in but not a
// super admin → their normal dashboard, without revealing the page exists.
export async function requireStudioUser(nextPath: string) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`)
  if (!(await isSuperAdmin(user.id))) redirect('/dashboard')
  return { user, supabase }
}

// For route handlers: returns a JSON-able error instead of redirecting.
export async function authorizeStudioRequest() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', status: 401 as const }
  if (!(await isSuperAdmin(user.id))) return { error: 'Forbidden', status: 403 as const }
  return { user, supabase }
}

// Service role — used only for storage signing and pipeline bookkeeping,
// never to read or write submissions on a user's behalf.
export function studioServiceClient() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}
