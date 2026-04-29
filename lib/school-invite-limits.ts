// Invite-limit policy for schools.
//
// During the 14-day free trial, schools can invite at most 3 people total
// (across staff invitations + family invitations, counting both pending and
// accepted invitations). This prevents abuse — a school can't sign up,
// invite their entire community on day 1, and then cancel the trial.
//
// After the subscription converts to paid (subscription_status === 'active'),
// schools can invite up to their billed `family_count` seats. We do not cap
// staff invites once paid (admins are operational, not the unit being sold).

export const TRIAL_INVITE_CAP = 3

export interface InviteUsage {
  used: number
  limit: number | null    // null = unlimited
  isTrial: boolean
  reachedLimit: boolean
}

/**
 * Computes how many invitation slots a school has used and how many remain.
 *
 * "Used" counts every unique person currently consuming a seat:
 *   - active school_families enrollments (families who joined via any path:
 *     email invite, share link, or direct ?school= signup)
 *   - extra school_staff members beyond the original admin
 *   - pending invitations (haven't been accepted yet, but seat is reserved)
 *
 * This is the right metric for trial abuse prevention because the share-link
 * (/join/[slug]) signup doesn't create an invitation row — it goes straight
 * to school_families. Counting invitations alone would let trial schools
 * bypass the limit by sharing the slug link.
 *
 * @param supabase  Supabase client. Should be the service role client so we
 *                  can count regardless of RLS.
 * @param schoolId  The school's UUID.
 * @param subscriptionStatus  schools.subscription_status (trialing/active/etc).
 */
export async function getInviteUsage(
  supabase: any,
  schoolId: string,
  subscriptionStatus: string | null,
): Promise<InviteUsage> {
  const isTrial = subscriptionStatus === 'trialing'
  const limit = isTrial ? TRIAL_INVITE_CAP : null

  const [
    { count: familyCount },
    { count: staffCount },
    { count: pendingInvitesCount },
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
      .from('invitations')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .in('type', ['school_family', 'school_staff'])
      .eq('status', 'pending'),
  ])

  // The original admin (school creator) is in school_staff but doesn't count
  // toward the trial seat cap. Subtract 1, never going below 0.
  const extraStaff = Math.max(0, (staffCount || 0) - 1)
  const used = (familyCount || 0) + extraStaff + (pendingInvitesCount || 0)
  const reachedLimit = limit !== null && used >= limit

  return { used, limit, isTrial, reachedLimit }
}
