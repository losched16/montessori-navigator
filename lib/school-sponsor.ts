'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

// The school that covers a parent's membership: the school their family is
// actively enrolled at, as long as that school's access is live. Parents who
// subscribe on their own get null. Fetched once per page load and shared by
// every component that asks (Home, Menu, Settings).

export interface SchoolSponsor {
  id: string
  name: string
  logoUrl: string | null
}

const LIVE = new Set(['active', 'trialing', 'past_due'])
let cached: Promise<SchoolSponsor | null> | null = null

async function loadSponsor(): Promise<SchoolSponsor | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).maybeSingle()
  if (!parent) return null
  const { data: members } = await supabase.from('family_members').select('family_id').eq('parent_id', parent.id)
  const familyIds = (members || []).map(m => m.family_id)
  if (familyIds.length === 0) return null

  const { data: enrollments } = await supabase
    .from('school_families')
    .select('joined_at, schools!inner(id, name, logo_url, subscription_status, is_comped)')
    .in('family_id', familyIds)
    .eq('status', 'active')
    .order('joined_at', { ascending: true })

  const school = (enrollments || [])
    .map((e: any) => e.schools)
    .find((s: any) => s && (s.is_comped || LIVE.has(s.subscription_status)))
  return school ? { id: school.id, name: school.name, logoUrl: school.logo_url || null } : null
}

export function useSchoolSponsor() {
  const [sponsor, setSponsor] = useState<SchoolSponsor | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let alive = true
    if (!cached) cached = loadSponsor().catch(() => null)
    cached.then(s => { if (alive) { setSponsor(s); setLoading(false) } })
    return () => { alive = false }
  }, [])
  return { sponsor, loading }
}

// After a school admin changes their logo, so the next read isn't stale.
export function clearSchoolSponsorCache() {
  cached = null
}
