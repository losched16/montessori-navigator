'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

interface EnrolledFamily {
  id: string
  familyName: string | null
  childrenCount: number
  joinedAt: string
  status: string
}

export default function SchoolFamiliesPage() {
  const [families, setFamilies] = useState<EnrolledFamily[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: staff } = await supabase
        .from('school_staff')
        .select('school_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!staff) return

      // Get enrolled families
      const { data: enrollments } = await supabase
        .from('school_families')
        .select('id, family_id, status, joined_at')
        .eq('school_id', staff.school_id)
        .order('joined_at', { ascending: false })

      if (!enrollments) { setLoading(false); return }

      // Get family details (name and children count)
      const familyIds = enrollments.map(e => e.family_id)

      const { data: familyData } = await supabase
        .from('families')
        .select('id, name')
        .in('id', familyIds)

      const { data: childrenData } = await supabase
        .from('children')
        .select('id, family_id')
        .in('family_id', familyIds)

      const familyMap = new Map((familyData || []).map(f => [f.id, f]))
      const childCountMap = new Map<string, number>()
      ;(childrenData || []).forEach(c => {
        childCountMap.set(c.family_id, (childCountMap.get(c.family_id) || 0) + 1)
      })

      const enriched: EnrolledFamily[] = enrollments.map(e => ({
        id: e.id,
        familyName: familyMap.get(e.family_id)?.name || 'Unnamed Family',
        childrenCount: childCountMap.get(e.family_id) || 0,
        joinedAt: e.joined_at,
        status: e.status,
      }))

      setFamilies(enriched)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="text-navy-600 py-8 text-center">Loading families...</div>
  }

  return (
    <div className="max-w-4xl pb-20 sm:pb-0">
      <h1 className="text-xl font-bold text-navy-600 mb-6">Enrolled Families</h1>

      {families.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">👨‍👩‍👧</div>
          <h2 className="font-semibold text-navy-600 mb-2">No families yet</h2>
          <p className="text-sm text-navy-600">
            Share your invite link or upload a CSV to invite families.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header row */}
          <div className="hidden sm:grid grid-cols-4 gap-4 px-4 py-2 text-xs text-navy-600 font-medium uppercase tracking-wide">
            <div>Family</div>
            <div>Children</div>
            <div>Joined</div>
            <div>Status</div>
          </div>

          {families.map(family => (
            <div key={family.id} className="bg-white border border-gray-100 rounded-xl p-4 sm:grid sm:grid-cols-4 sm:gap-4 sm:items-center">
              <div className="font-medium text-navy-600">{family.familyName}</div>
              <div className="text-sm text-navy-600">
                <span className="sm:hidden text-navy-600">Children: </span>
                {family.childrenCount} {family.childrenCount === 1 ? 'child' : 'children'}
              </div>
              <div className="text-sm text-navy-600">
                <span className="sm:hidden text-navy-600">Joined: </span>
                {new Date(family.joinedAt).toLocaleDateString()}
              </div>
              <div>
                <span className={`inline-flex text-xs px-2 py-0.5 rounded-full ${
                  family.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {family.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
