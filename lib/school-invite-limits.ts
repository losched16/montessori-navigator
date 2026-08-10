// Invite-limit policy for schools.
//
// TRIAL (subscription_status === 'trialing'):
//   At most TRIAL_INVITE_CAP (3) active members beyond the original admin, so
//   a trial team can test together without rolling out to the whole school.
//
// ACTIVE / COMPED (subscription_status === 'active'):
//   The school gets its billed family seats (schools.family_count) PLUS a
//   STAFF_BUFFER (20) on top — so teachers/staff can be let in beyond the
//   number of families the school pays (or is comped) for. Comped schools are
//   stored as 'active' with is_comped = true and a family_count we set by hand.
//
// "Active" means someone who has actually joined — pending invitations don't
// consume a seat. The original admin and an admin's own parent self-account
// don't count.
//
// If an active school has no family_count set (0/null — shouldn't happen for
// real schools), we treat it as unlimited rather than accidentally blocking.

export const TRIAL_INVITE_CAP = 3
export const STAFF_BUFFER = 20

export interface InviteUsage {
  used: number
  limit: number | null    // null = unlimited
  isTrial: boolean
  reachedLimit: boolean
}

/**
 * Computes how many active-member slots a school has used and its limit.
 *
 * "Used" counts everyone actually consuming a seat right now:
 *   - active school_families enrollments
 *   - extra school_staff beyond the original admin
 * Pending invitations are NOT counted — they only become a seat on accept.
 *
 * The limit is TRIAL_INVITE_CAP during trial, or family_count + STAFF_BUFFER
 * once active/comped (null = unlimited fallback).
 */
export async function getInviteUsage(
  supabase: any,
  schoolId: string,
  subscriptionStatus: string | null,
): Promise<InviteUsage> {
  const isTrial = subscriptionStatus === 'trialing'

  const [
    { count: familyCount },
    { count: staffCount },
    schoolRes,
  ] = await Promise.all([
    supabase
      .from('school_families')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'active'),
    supabase
      .from('school_staff')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId),
    supabase
      .from('schools')
      .select('family_count')
      .eq('id', schoolId)
      .maybeSingle(),
  ])

  // Seats the school pays for / is comped for.
  const seatCount = Number(schoolRes?.data?.family_count) || 0

  let limit: number | null
  if (isTrial) {
    limit = TRIAL_INVITE_CAP
  } else if (subscriptionStatus === 'active' && seatCount > 0) {
    // Billed family seats + a staff buffer so staff can be let in beyond the
    // number of families the school pays for.
    limit = seatCount + STAFF_BUFFER
  } else {
    // Inactive/canceled (blocked elsewhere) or an active school with no seat
    // count set — don't cap here.
    limit = null
  }

  // The original admin (school creator) is in school_staff but doesn't count.
  const extraStaff = Math.max(0, (staffCount || 0) - 1)
  const used = (familyCount || 0) + extraStaff
  const reachedLimit = limit !== null && used >= limit

  return { used, limit, isTrial, reachedLimit }
}
