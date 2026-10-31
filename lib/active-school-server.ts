import { cookies } from 'next/headers'
import { ACTIVE_SCHOOL_COOKIE, listMemberships, pickMembership, type SchoolMembership } from '@/lib/active-school'

// Server-side counterpart of getActiveMembership (lib/active-school.ts):
// resolves the school an API request acts on from the user's school_staff
// rows and the active-school cookie. Pass adminOnly to consider only rows
// with role 'admin'.
export async function getActiveMembershipServer(
  supabase: any,
  userId: string,
  opts: { adminOnly?: boolean } = {},
): Promise<SchoolMembership | null> {
  let rows = await listMemberships(supabase, userId)
  if (opts.adminOnly) rows = rows.filter(r => r.role === 'admin')
  return pickMembership(rows, cookies().get(ACTIVE_SCHOOL_COOKIE)?.value)
}
