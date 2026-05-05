// Super-admin role helpers.
//
// Super admins are platform-level — they can manage content (and eventually
// other things) across all schools and parents. This is separate from
// school_staff (which is scoped to one school) and parents (which is the
// parent role).
//
// To grant super_admin: insert a row into super_admins keyed by auth user id.
// Bootstrap is done via SQL in supabase-migration-content-portal.sql.

export async function isSuperAdmin(supabase: any, userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false
  const { data } = await supabase
    .from('super_admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}
