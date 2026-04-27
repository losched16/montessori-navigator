'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function SchoolDashboard() {
  const [stats, setStats] = useState({ totalFamilies: 0, activeFamilies: 0, pendingInvites: 0 })
  const [schoolSlug, setSchoolSlug] = useState('')
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

      const { data: school } = await supabase
        .from('schools')
        .select('slug')
        .eq('id', staff.school_id)
        .single()

      if (school) setSchoolSlug(school.slug)

      // Get family stats
      const { data: families, count: totalCount } = await supabase
        .from('school_families')
        .select('id, status', { count: 'exact' })
        .eq('school_id', staff.school_id)

      const activeCount = (families || []).filter(f => f.status === 'active').length

      // Get pending invites
      const { count: pendingCount } = await supabase
        .from('invitations')
        .select('id', { count: 'exact' })
        .eq('school_id', staff.school_id)
        .eq('status', 'pending')

      setStats({
        totalFamilies: totalCount || 0,
        activeFamilies: activeCount,
        pendingInvites: pendingCount || 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="text-navy-600 py-8 text-center">Loading dashboard...</div>
  }

  return (
    <div className="max-w-4xl pb-20 sm:pb-0">
      <h1 className="text-xl font-bold text-navy-600 mb-6">School Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="text-3xl font-bold text-navy-600">{stats.totalFamilies}</div>
          <div className="text-sm text-navy-600 mt-1">Total Families</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="text-3xl font-bold text-warm-600">{stats.activeFamilies}</div>
          <div className="text-sm text-navy-600 mt-1">Active Families</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="text-3xl font-bold text-amber-600">{stats.pendingInvites}</div>
          <div className="text-sm text-navy-600 mt-1">Pending Invitations</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link href="/school/invite" className="bg-white border border-gray-100 rounded-xl p-5 hover:border-warm-200 transition">
          <div className="text-2xl mb-2">✉️</div>
          <h3 className="font-semibold text-navy-600 mb-1">Invite Families</h3>
          <p className="text-sm text-navy-600">Share your invite link or upload a CSV of family emails.</p>
        </Link>
        <Link href="/school/families" className="bg-white border border-gray-100 rounded-xl p-5 hover:border-warm-200 transition">
          <div className="text-2xl mb-2">👨‍👩‍👧</div>
          <h3 className="font-semibold text-navy-600 mb-1">View Families</h3>
          <p className="text-sm text-navy-600">See enrolled families, children count, and join dates.</p>
        </Link>
      </div>

      {/* Invite Link */}
      {schoolSlug && (
        <div className="bg-warm-50 border border-warm-100 rounded-xl p-5">
          <h3 className="font-semibold text-navy-600 mb-2">Your Invite Link</h3>
          <p className="text-sm text-navy-600 mb-3">Share this link with families to invite them to Montessori Family Alliance:</p>
          <div className="bg-white rounded-lg p-3 border border-warm-200 text-sm text-navy-600 font-mono break-all">
            {typeof window !== 'undefined' ? `${window.location.origin}/join/${schoolSlug}` : `/join/${schoolSlug}`}
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-8 bg-white border border-gray-100 rounded-xl p-5">
        <h3 className="font-semibold text-navy-600 mb-2">Privacy</h3>
        <p className="text-sm text-navy-600">
          You can see family names, children count, and enrollment dates. You <strong>cannot</strong> see family conversations,
          observations, development levels, or any private data. Families trust Family Alliance to keep their data private.
        </p>
      </div>
    </div>
  )
}
