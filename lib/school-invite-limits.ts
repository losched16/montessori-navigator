// Invite-limit policy for schools.
//
// During the 14-day free trial, schools can have at most 3 ACTIVE members
// beyond the original admin. "Active" means someone who has actually signed
// up and joined — pending invitations don't consume a seat. This lets trial
// schools send invites freely; only people who actually accept count toward
// the cap.
//
// The original admin doesn't count, and the admin's own parent self-account
// (created by /api/school/become-parent for the dual-role view) also doesn't
// count — it lives in the parents/families tables but is never linked to
// the school via school_families.
//
// After the subscription converts to paid (subscription_status === 'active'),
// schools can invite unlimited members. We do not cap staff invites once
// paid (admins are operational, not the unit being sold).

export const TRIAL_INVITE_CAP = 3

export interface InviteUsage {
  used: number
  limit: number | null    // null = unlimited
  isTrial: boolean
  reachedLimit: boolean
}

/**
 * Computes how many active-member slots a school has used and how many remain.
 *
 * "Used" counts every unique person who has actually joined and is consuming
 * a seat right now:
 *   - active school_families enrollments (families who joined via any path:
 *     email invite, share link, or direct ?school= signup)
 *   - extra school_staff members beyond the original admin
 *
 * Pending invitations are NOT counted — they only become a slot when the
 * invitee actually signs up.
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
  ])

  // The original admin (school creator) is in school_staff but doesn't count
  // toward the trial seat cap. Subtract 1, never going below 0.
  const extraStaff = Math.max(0, (staffCount || 0) - 1)
  const used = (familyCount || 0) + extraStaff
  const reachedLimit = limit !== null && used >= limit

  return { used, limit, isTrial, reachedLimit }
}
