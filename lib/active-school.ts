// Active school — which school the school portal (/school) is working on.
//
// Most staff belong to one school, but super admins granted support access
// (see /admin/customers → "Manage this school") can belong to many. The choice
// lives in the ACTIVE_SCHOOL_COOKIE cookie so client pages and API routes
// agree on it. The cookie is only a preference: every read re-checks it
// against the user's actual school_staff rows and falls back to their first
// school, so it can never grant access on its own.
//
// Browser-safe. Server routes use lib/active-school-server.ts.

export const ACTIVE_SCHOOL_COOKIE = 'mfa_active_school'

export interface SchoolMembership {
  school_id: string
  role: string
  is_support: boolean
}

export function pickMembership(
  rows: SchoolMembership[],
  preferredSchoolId: string | null | undefined,
): SchoolMembership | null {
  if (!rows.length) return null
  return rows.find(r => r.school_id === preferredSchoolId) || rows[0]
}

export function readActiveSchoolCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${ACTIVE_SCHOOL_COOKIE}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function setActiveSchoolCookie(schoolId: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${ACTIVE_SCHOOL_COOKIE}=${encodeURIComponent(schoolId)}; path=/; max-age=31536000; samesite=lax`
}

/** All of the user's school memberships (oldest first). */
export async function listMemberships(supabase: any, userId: string): Promise<SchoolMembership[]> {
  const { data } = await supabase
    .from('school_staff')
    .select('school_id, role, is_support')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  return (data || []).map((r: any) => ({ ...r, is_support: !!r.is_support }))
}

/** The membership for the school the portal is currently working on. */
export async function getActiveMembership(supabase: any, userId: string): Promise<SchoolMembership | null> {
  return pickMembership(await listMemberships(supabase, userId), readActiveSchoolCookie())
}
