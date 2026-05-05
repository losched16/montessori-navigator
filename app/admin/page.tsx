'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface Stats {
  total: number
  published: number
  drafts: number
  schoolFacing: number
  parentFacing: number
}

export default function AdminLanding() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<Array<{ id: string; slug: string; title: string; type: string; audience: string; updated_at: string }>>([])
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: all } = await supabase
        .from('resources')
        .select('id, slug, title, type, audience, is_published, updated_at')
        .order('updated_at', { ascending: false })

      const list = all || []
      setStats({
        total: list.length,
        published: list.filter((r: any) => r.is_published).length,
        drafts: list.filter((r: any) => !r.is_published).length,
        schoolFacing: list.filter((r: any) => r.audience === 'school' || r.audience === 'both').length,
        parentFacing: list.filter((r: any) => r.audience === 'parent' || r.audience === 'both').length,
      })
      setRecent(list.slice(0, 5) as any)
    }
    load()
  }, [])

  return (
    <div className="max-w-5xl">
      <h1 className="text-xl font-bold text-navy-700 mb-2">Content Portal</h1>
      <p className="text-sm text-navy-600/70 mb-6">
        Manage all the content that appears in the parent and school resource libraries.
      </p>

      {/* Quick action */}
      <div className="mb-8">
        <Link
          href="/admin/resources/new"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-warm-500 hover:bg-warm-600 text-white font-medium rounded-lg transition text-sm"
        >
          + New resource
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <Stat label="Total" value={stats.total} />
          <Stat label="Published" value={stats.published} accent="emerald" />
          <Stat label="Drafts" value={stats.drafts} accent="amber" />
          <Stat label="For schools" value={stats.schoolFacing} />
          <Stat label="For parents" value={stats.parentFacing} />
        </div>
      )}

      {/* Recent */}
      <section className="bg-white border border-gray-100 rounded-2xl">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-navy-700">Recently updated</h2>
          <Link href="/admin/resources" className="text-xs text-warm-600 hover:text-warm-700 font-medium">
            See all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-6 text-sm text-navy-600/70 text-center">
            No resources yet. <Link href="/admin/resources/new" className="text-warm-600 hover:underline">Add the first one →</Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map(r => (
              <li key={r.id}>
                <Link
                  href={`/admin/resources/${r.id}`}
                  className="flex items-center gap-4 px-5 sm:px-6 py-3 hover:bg-gray-50 transition"
                >
                  <span className="text-xl">
                    {r.type === 'playbook' ? '📘' :
                     r.type === 'workbook' ? '📒' :
                     r.type === 'newsletter' ? '📨' :
                     r.type === 'article' ? '📄' :
                     r.type === 'template' ? '📋' : '📄'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-navy-700 truncate">{r.title}</div>
                    <div className="text-xs text-navy-600/60 mt-0.5 capitalize">
                      {r.type} · {r.audience} · updated {new Date(r.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: 'emerald' | 'amber' }) {
  const accentClass =
    accent === 'emerald' ? 'text-emerald-600' :
    accent === 'amber' ? 'text-amber-600' :
    'text-navy-700'
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className={`text-2xl font-bold ${accentClass}`}>{value}</div>
      <div className="text-xs text-navy-600/70 mt-1">{label}</div>
    </div>
  )
}
