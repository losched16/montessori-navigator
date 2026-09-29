import type { SupabaseClient } from '@supabase/supabase-js'

// SERVER-ONLY (expects a service-role client).
//
// One place that makes a user the admin of a school: sets schools.admin_user_id
// and ensures a school_staff row with role 'admin'. Used by the Stripe webhook
// (auto-link on checkout), /api/school/claim, and the post-checkout welcome
// page, so every path leaves the same state behind.

const PLACEHOLDER_ADMIN = '00000000-0000-0000-0000-000000000000'

export type LinkResult = 'linked' | 'already_linked' | 'has_other_admin' | 'school_not_found'

export async function linkSchoolAdmin(service: SupabaseClient, schoolId: string, userId: string): Promise<LinkResult> {
  const { data: school } = await service.from('schools').select('id, admin_user_id').eq('id', schoolId).maybeSingle()
  if (!school) return 'school_not_found'

  const current = school.admin_user_id && school.admin_user_id !== PLACEHOLDER_ADMIN ? school.admin_user_id : null
  if (current && current !== userId) return 'has_other_admin'

  if (current !== userId) {
    const { error } = await service.from('schools').update({ admin_user_id: userId }).eq('id', schoolId)
    if (error) throw new Error(`link admin: ${error.message}`)
  }

  const { data: staff } = await service
    .from('school_staff')
    .select('id, role')
    .eq('school_id', schoolId)
    .eq('user_id', userId)
    .maybeSingle()
  if (!staff) {
    const { error } = await service.from('school_staff').insert({ school_id: schoolId, user_id: userId, role: 'admin' })
    if (error) throw new Error(`link staff: ${error.message}`)
  } else if (staff.role !== 'admin') {
    await service.from('school_staff').update({ role: 'admin' }).eq('id', staff.id)
  }

  return current === userId && staff?.role === 'admin' ? 'already_linked' : 'linked'
}

// Existing account for an email, only if that email has been verified — so a
// checkout typed with someone else's address can't attach them unconfirmed.
export async function findVerifiedUserByEmail(service: SupabaseClient, email: string | null | undefined): Promise<string | null> {
  const target = (email || '').trim().toLowerCase()
  if (!target) return null
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 })
    if (error) return null
    const users = data?.users || []
    const match = users.find(u => (u.email || '').toLowerCase() === target)
    if (match) return match.email_confirmed_at ? match.id : null
    if (users.length < 200) return null
  }
  return null
}
