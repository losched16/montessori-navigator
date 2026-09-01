'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Parent } from '@/lib/supabase'
import { ChildProvider } from '@/lib/child-context'
import AppShell from '@/components/app/AppShell'

function DashboardInner({ children }: { children: React.ReactNode }) {
  const [, setParent] = useState<Parent | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadParent = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: parentData } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      // Check whether this user is also a school admin/staff. Used to decide
      // routing when there's no parent record, and to bypass the subscription
      // gate for admins trying the parent experience.
      const { data: staffEntry } = await supabase
        .from('school_staff')
        .select('school_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()
      const isSchoolStaff = !!staffEntry

      if (!parentData) {
        // School-staff-only user landed on /dashboard — send them to /school
        // instead of forcing them through parent onboarding.
        if (isSchoolStaff) {
          router.push('/school')
          return
        }
        router.push('/onboarding')
        return
      }

      // Subscription gate: parents must have an active or trialing subscription
      // (Skip gate for school-affiliated parents — they have access via school)
      //
      // Also skip for school staff: an admin who set up a parent view to feel
      // what their families feel doesn't need a separate subscription — their
      // school account already covers it. Without this bypass, admins who
      // click "Try parent experience" land in /dashboard and immediately
      // get bounced to /pricing.
      const status = parentData.subscription_status || 'inactive'
      const activeStatuses = ['trialing', 'active']
      if (isSchoolStaff) {
        setParent(parentData)
        return
      }
      if (!activeStatuses.includes(status)) {
        // Check if they're part of a school (school admin paid on their behalf)
        const { data: famMembers } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('parent_id', parentData.id)
        const familyIds = (famMembers || []).map(f => f.family_id)

        // Orphan parent (no family at all) — send to onboarding, which can
        // create the family. Don't bounce to /pricing because they may be a
        // school invitee whose enrollment is pending until they have a family.
        if (familyIds.length === 0) {
          router.push('/onboarding')
          return
        }

        let hasActiveSchool = false
        const { data: schoolFams } = await supabase
          .from('school_families')
          .select('school_id, schools!inner(subscription_status)')
          .in('family_id', familyIds)
          .eq('status', 'active')
        hasActiveSchool = (schoolFams || []).some((sf: any) =>
          ['active', 'trialing', 'past_due'].includes(sf.schools?.subscription_status)
        )
        if (!hasActiveSchool) {
          router.push('/pricing')
          return
        }
      }

      setParent(parentData)

      // Sync this parent into GHL for marketing segmentation — once per browser
      // session, fire-and-forget. The endpoint derives tags from the DB.
      if (typeof window !== 'undefined' && !sessionStorage.getItem('ghl_synced')) {
        sessionStorage.setItem('ghl_synced', '1')
        fetch('/api/ghl/sync', { method: 'POST' }).catch(() => {})
      }
    }
    loadParent()
  }, [])

  return <AppShell>{children}</AppShell>
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChildProvider>
      <DashboardInner>{children}</DashboardInner>
    </ChildProvider>
  )
}
