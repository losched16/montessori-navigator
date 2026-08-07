import { createClient } from '@supabase/supabase-js'

// Super-admin role helpers.
//
// Super admins are platform-level — they can manage content (and eventually
// other things) across all schools and parents. This is separate from
// school_staff (scoped to one school) and parents (the parent role).
//
// IMPORTANT: this check uses the SERVICE-ROLE client, which bypasses RLS.
// We must NOT gate super-admin status behind RLS on the super_admins table —
// the table's read policy is inherently self-referential ("you may read
// super_admins only if you are in super_admins"), which makes Postgres raise
// infinite-recursion and every check silently fail. Service role sidesteps
// that. This function is therefore SERVER-ONLY (needs SUPABASE_SERVICE_ROLE_KEY)
// and must never be imported into a client component — call /api/admin/me from
// the browser instead.

export async function isSuperAdmin(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false
  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const { data } = await service
    .from('super_admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}
