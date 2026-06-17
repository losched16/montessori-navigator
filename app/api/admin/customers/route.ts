import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { isSuperAdmin } from '@/lib/super-admin'

export const dynamic = 'force-dynamic'

// GET /api/admin/customers
//
// Returns everything the /admin/customers dashboard needs in one shot:
//   - top-level counts (total parents, total schools, active vs trial, etc.)
//   - a list of schools with their family + pending-invite counts and a
//     nested list of every family enrolled at that school
//   - a list of "standalone" parents — paying individuals with no school link
//
// Service role throughout so we can see across all customers regardless of
// RLS. Endpoint is gated to super admins only.

async function authedSuperAdmin() {
  const cookieStore = cookies()
  const ssr = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: any) { try { cookieStore.set({ name, value, ...options }) } catch (e) {} },
        remove(name: string, options: any) { try { cookieStore.set({ name, value: '', ...options }) } catch (e) {} },
      },
    },
  )
  const { data: { user } } = await ssr.auth.getUser()
  if (!user) return { error: 'Not authenticated', status: 401 as const }
  const allowed = await isSuperAdmin(ssr, user.id)
  if (!allowed) return { error: 'Forbidden', status: 403 as const }
  return { user }
}

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

const ACTIVE_STATUSES = new Set(['active', 'trialing', 'past_due'])

export async function GET(_req: NextRequest) {
  const auth = await authedSuperAdmin()
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const service = getServiceClient()

  // Pull all the raw data in parallel
  const [
    schoolsRes,
    staffRes,
    enrollmentsRes,
    familiesRes,
    childrenRes,
    invitesRes,
    parentsRes,
  ] = await Promise.all([
    service.from('schools').select('id, name, slug, subscription_status, created_at, trial_ends_at, current_period_end, family_count'),
    service.from('school_staff').select('id, school_id, user_id, created_at'),
    service.from('school_families').select('id, school_id, family_id, status, joined_at'),
    service.from('families').select('id, name'),
    service.from('children').select('id, family_id, created_at'),
    service.from('invitations').select('id, school_id, type, email, status, created_at, expires_at'),
    service.from('parents').select('id, user_id, display_name, email, subscription_status, created_at, stripe_customer_id'),
  ])

  const schools = schoolsRes.data || []
  const staff = staffRes.data || []
  const enrollments = enrollmentsRes.data || []
  const families = familiesRes.data || []
  const children = childrenRes.data || []
  const invites = invitesRes.data || []
  const parents = parentsRes.data || []

  // Build lookups
  const familyById = new Map(families.map((f: any) => [f.id, f]))
  const childCountByFamily = new Map<string, number>()
  children.forEach((c: any) => {
    childCountByFamily.set(c.family_id, (childCountByFamily.get(c.family_id) || 0) + 1)
  })

  // family_members → primary parent per family (for naming)
  const memberRes = await service
    .from('family_members')
    .select('family_id, parent_id, role')
    .eq('role', 'primary')
  const primaryParentByFamily = new Map<string, string>()
  ;(memberRes.data || []).forEach((m: any) => {
    if (!primaryParentByFamily.has(m.family_id)) {
      primaryParentByFamily.set(m.family_id, m.parent_id)
    }
  })

  const parentById = new Map(parents.map((p: any) => [p.id, p]))

  // Family ids that are linked to schools — used to identify standalone parents
  const schoolLinkedFamilyIds = new Set(enrollments.map((e: any) => e.family_id))

  // Helper: human-readable family label using fallback chain
  const GENERIC = new Set(['my family', 'unnamed family', "'s family", ''])
  function familyLabel(familyId: string): string {
    const fam = familyById.get(familyId) as any
    const rawName = (fam?.name as string | null | undefined) || ''
    const isGeneric = GENERIC.has(rawName.trim().toLowerCase())
    if (!isGeneric) return rawName
    const primaryParentId = primaryParentByFamily.get(familyId)
    if (primaryParentId) {
      const p = parentById.get(primaryParentId) as any
      if (p?.display_name?.trim()) return `${p.display_name.trim()}'s Family`
      if (p?.email) return `${p.email.split('@')[0]}'s Family`
    }
    return 'Unnamed Family'
  }

  // Build per-school detail
  const schoolList = schools.map((s: any) => {
    const enrolledHere = enrollments.filter((e: any) => e.school_id === s.id)
    const activeFamilies = enrolledHere.filter((e: any) => e.status === 'active')
    const pendingForSchool = invites.filter((i: any) =>
      i.school_id === s.id && i.type === 'school_family' && i.status === 'pending'
    )
    const staffForSchool = staff.filter((st: any) => st.school_id === s.id)

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      subscriptionStatus: s.subscription_status,
      isActive: ACTIVE_STATUSES.has(s.subscription_status),
      createdAt: s.created_at,
      trialEndsAt: s.trial_ends_at,
      currentPeriodEnd: s.current_period_end,
      seatsBilled: s.family_count,
      activeFamilyCount: activeFamilies.length,
      pendingInviteCount: pendingForSchool.length,
      adminCount: staffForSchool.length,
      families: activeFamilies
        .sort((a: any, b: any) => (b.joined_at || '').localeCompare(a.joined_at || ''))
        .map((e: any) => ({
          enrollmentId: e.id,
          familyId: e.family_id,
          label: familyLabel(e.family_id),
          childrenCount: childCountByFamily.get(e.family_id) || 0,
          joinedAt: e.joined_at,
          status: e.status,
        })),
      pendingInvites: pendingForSchool
        .sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''))
        .map((i: any) => ({
          inviteId: i.id,
          email: i.email,
          createdAt: i.created_at,
          expiresAt: i.expires_at,
        })),
    }
  }).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))

  // Standalone parents — paying individuals with no school link
  const standaloneParents = parents
    .filter((p: any) => {
      // A parent is "standalone" if none of their families are enrolled at any school
      // (We need to check via family_members.)
      // For perf, just check whether their parent_id maps to any school_family.
      // Pull all family ids for this parent from family_members:
      return true // we'll filter below using member data
    })
  // Need family_members for all parents to know if they're linked to a school
  const allMembers = await service.from('family_members').select('parent_id, family_id')
  const familiesByParent = new Map<string, string[]>()
  ;(allMembers.data || []).forEach((m: any) => {
    const arr = familiesByParent.get(m.parent_id) || []
    arr.push(m.family_id)
    familiesByParent.set(m.parent_id, arr)
  })

  const standaloneList = standaloneParents
    .filter((p: any) => {
      const fams = familiesByParent.get(p.id) || []
      return !fams.some(fid => schoolLinkedFamilyIds.has(fid))
    })
    .map((p: any) => {
      const fams = familiesByParent.get(p.id) || []
      const totalChildren = fams.reduce((sum, fid) => sum + (childCountByFamily.get(fid) || 0), 0)
      return {
        id: p.id,
        displayName: p.display_name,
        email: p.email,
        subscriptionStatus: p.subscription_status,
        isActive: ACTIVE_STATUSES.has(p.subscription_status),
        hasPaidSubscription: !!p.stripe_customer_id,
        createdAt: p.created_at,
        familiesCount: fams.length,
        childrenCount: totalChildren,
      }
    })
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))

  // Top-level stats
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const activeSchoolCount = schoolList.filter(s => s.isActive).length
  const activeFamilyTotalCount = schoolList.reduce((sum, s) => sum + s.activeFamilyCount, 0)
  const totalParentCount = parents.length
  const totalChildrenCount = children.length
  const parentsWithChildren = new Set(
    children
      .map((c: any) => {
        // map child → family_id → primary parent
        const primary = primaryParentByFamily.get(c.family_id)
        return primary
      })
      .filter(Boolean) as string[],
  ).size
  const pendingInviteTotalCount = invites.filter((i: any) => i.status === 'pending').length

  const newSchoolsLast30 = schools.filter((s: any) => (s.created_at || '') >= thirtyDaysAgo).length
  const newParentsLast30 = parents.filter((p: any) => (p.created_at || '') >= thirtyDaysAgo).length

  return NextResponse.json({
    stats: {
      totalSchools: schools.length,
      activeSchools: activeSchoolCount,
      totalParents: totalParentCount,
      parentsWithChildren,
      activationRate: totalParentCount > 0
        ? Math.round((parentsWithChildren / totalParentCount) * 100)
        : 0,
      activeFamilies: activeFamilyTotalCount,
      pendingInvites: pendingInviteTotalCount,
      totalChildren: totalChildrenCount,
      newSchoolsLast30,
      newParentsLast30,
    },
    schools: schoolList,
    standaloneParents: standaloneList,
  })
}
