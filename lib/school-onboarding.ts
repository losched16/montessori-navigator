// Welcome / onboarding state for school admins.
//
// "What should I do next?" is computed entirely from real data — there is no
// manual checking. The user finishes a step by actually doing it (sending an
// invite, opening a playbook, etc) and the checklist updates on the next page
// load. This means the list never lies and we don't have to keep two sources
// of truth in sync.
//
// State stored in schools.onboarding_state (JSONB):
//   - welcomed_at         when the admin clicked through the welcome page
//   - viewed_resources    array of resource slugs they've opened
//
// Everything else (profile customized, first invite sent, co-admin added,
// parent role) is detected from the relevant tables.

export interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: string
  href: string
  completed: boolean
  /** Short human-readable confirmation when completed (e.g. "Invited 3 families"). */
  doneLabel?: string
}

export interface OnboardingState {
  welcomedAt: string | null
  steps: OnboardingStep[]
  completedCount: number
  totalCount: number
  isComplete: boolean
}

interface RawState {
  welcomed_at?: string | null
  viewed_resources?: string[]
}

const PLAYBOOK_SLUG = 'new-family-onboarding-playbook'
const WORKBOOK_SLUG = 'family-onboarding-workbook'

/**
 * Compute the full onboarding state for a school.
 *
 * @param supabase  Service-role or RLS-bound Supabase client.
 * @param schoolId  The school's UUID.
 * @param userId    The current user's auth UUID — used to detect parent role.
 */
export async function getOnboardingState(
  supabase: any,
  schoolId: string,
  userId: string,
): Promise<OnboardingState> {
  // Pull all the signals in parallel — keeps this fast even on slow links.
  const [
    schoolRes,
    staffCountRes,
    pendingStaffInviteRes,
    familyInviteRes,
    activeFamilyRes,
    parentRowRes,
  ] = await Promise.all([
    supabase
      .from('schools')
      .select('address, website, phone, credentials, onboarding_state')
      .eq('id', schoolId)
      .maybeSingle(),
    supabase
      .from('school_staff')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId),
    supabase
      .from('invitations')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('type', 'school_staff')
      .eq('status', 'pending'),
    supabase
      .from('invitations')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('type', 'school_family'),
    supabase
      .from('school_families')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'active'),
    supabase
      .from('parents')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  const school = schoolRes.data
  const raw: RawState = (school?.onboarding_state as RawState) || {}

  // --- Step 1: profile customization
  // We consider the profile "customized" if the admin has filled in at least
  // one optional field beyond the school name (which is required at signup).
  const profileFieldsFilled = [
    school?.address,
    school?.website,
    school?.phone,
    school?.credentials,
  ].filter(v => typeof v === 'string' && v.trim().length > 0).length
  const profileCustomized = profileFieldsFilled > 0

  // --- Step 2: read the New Family Onboarding Playbook
  const viewedResources: string[] = Array.isArray(raw.viewed_resources)
    ? raw.viewed_resources
    : []
  const playbookRead = viewedResources.includes(PLAYBOOK_SLUG)
  const workbookOpened = viewedResources.includes(WORKBOOK_SLUG)

  // --- Step 4: first family invitation sent
  // Counts both invitation rows AND active enrollments via share-link join
  // (which doesn't go through invitations). Either way, a family is now in.
  const familyInviteCount = familyInviteRes.count || 0
  const activeFamilyCount = activeFamilyRes.count || 0
  const firstInviteSent = familyInviteCount > 0 || activeFamilyCount > 0

  // --- Step 5: added a co-admin
  // school_staff includes the original admin, so 2+ means a co-admin exists.
  // Pending school_staff invitations also count — they took the action even
  // if the invitee hasn't accepted yet.
  const staffCount = staffCountRes.count || 0
  const pendingStaffInvites = pendingStaffInviteRes.count || 0
  const coadminAdded = staffCount > 1 || pendingStaffInvites > 0

  // --- Step 6: tried the parent experience
  // We detect this as "the admin has a parent record linked to their account".
  // The dual-role context switcher only appears when this is true.
  const triedParentView = !!parentRowRes.data

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Personalize your school profile',
      description:
        'Add your address, website, and accreditation so families recognize you and trust the source.',
      icon: '🏫',
      href: '/school/settings',
      completed: profileCustomized,
      doneLabel: profileCustomized ? 'Profile filled in' : undefined,
    },
    {
      id: 'playbook',
      title: 'Read the New Family Onboarding Playbook',
      description:
        'A real example of what excellent new-family onboarding looks like at a Montessori school. Borrow what fits.',
      icon: '📘',
      href: `/school/resources/${PLAYBOOK_SLUG}`,
      completed: playbookRead,
      doneLabel: playbookRead ? 'Playbook opened' : undefined,
    },
    {
      id: 'workbook',
      title: 'Open the Family Onboarding Workbook',
      description:
        'Use it with your leadership team to design your school’s own onboarding flow.',
      icon: '📒',
      href: `/school/resources/${WORKBOOK_SLUG}`,
      completed: workbookOpened,
      doneLabel: workbookOpened ? 'Workbook opened' : undefined,
    },
    {
      id: 'invite',
      title: 'Send your first family invitation',
      description:
        'Start with yourself, a teacher, or a family who would love to test it. Watch what they experience.',
      icon: '✉️',
      href: '/school/invite',
      completed: firstInviteSent,
      doneLabel: firstInviteSent
        ? activeFamilyCount > 0
          ? `${activeFamilyCount} ${activeFamilyCount === 1 ? 'family' : 'families'} enrolled`
          : `${familyInviteCount} ${familyInviteCount === 1 ? 'invite' : 'invites'} sent`
        : undefined,
    },
    {
      id: 'coadmin',
      title: 'Add a co-admin',
      description:
        'Don’t be the single point of failure. Invite someone else from your leadership team.',
      icon: '👥',
      href: '/school/staff',
      completed: coadminAdded,
      doneLabel: coadminAdded
        ? staffCount > 1
          ? `${staffCount} admins`
          : 'Invitation sent'
        : undefined,
    },
    {
      id: 'parent',
      title: 'Try the parent experience',
      description:
        'See exactly what your families see. Best way to support them is to feel what they feel.',
      icon: '👨‍👩‍👧',
      href: '/auth/signup',
      completed: triedParentView,
      doneLabel: triedParentView ? 'Parent account linked' : undefined,
    },
  ]

  const completedCount = steps.filter(s => s.completed).length

  return {
    welcomedAt: raw.welcomed_at ?? null,
    steps,
    completedCount,
    totalCount: steps.length,
    isComplete: completedCount === steps.length,
  }
}

/**
 * Mark that the admin has completed the welcome page (clicked through).
 * Idempotent — calling it after it's already been set is a no-op.
 */
export async function markWelcomeSeen(supabase: any, schoolId: string): Promise<void> {
  const { data: school } = await supabase
    .from('schools')
    .select('onboarding_state')
    .eq('id', schoolId)
    .maybeSingle()
  const current = (school?.onboarding_state as RawState) || {}
  if (current.welcomed_at) return

  await supabase
    .from('schools')
    .update({
      onboarding_state: {
        ...current,
        welcomed_at: new Date().toISOString(),
      },
    })
    .eq('id', schoolId)
}

/**
 * Record that the admin has viewed a school resource by slug.
 * Used to auto-check the playbook and workbook items in the checklist.
 */
export async function recordResourceView(
  supabase: any,
  schoolId: string,
  slug: string,
): Promise<void> {
  const { data: school } = await supabase
    .from('schools')
    .select('onboarding_state')
    .eq('id', schoolId)
    .maybeSingle()
  const current = (school?.onboarding_state as RawState) || {}
  const seen = new Set(Array.isArray(current.viewed_resources) ? current.viewed_resources : [])
  if (seen.has(slug)) return
  seen.add(slug)

  await supabase
    .from('schools')
    .update({
      onboarding_state: {
        ...current,
        viewed_resources: Array.from(seen),
      },
    })
    .eq('id', schoolId)
}
