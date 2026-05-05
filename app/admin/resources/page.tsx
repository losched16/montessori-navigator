'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface AdminResource {
  id: string
  slug: string
  title: string
  type: string
  audience: string
  is_published: boolean
  updated_at: string
}

const TYPE_ICONS: Record<string, string> = {
  playbook: '📘',
  workbook: '📒',
  template: '📋',
  guide: '📖',
  article: '📄',
  newsletter: '📨',
}

export default function AdminResourcesList() {
  const [resources, setResources] = useState<AdminResource[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'school' | 'parent' | 'drafts'>('all')
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('resources')
        .select('id, slug, title, type, audience, is_published, updated_at')
        .order('updated_at', { ascending: false })
      setResources((data as any) || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = resources.filter(r => {
    if (filter === 'all') return true
    if (filter === 'drafts') return !r.is_published
    if (filter === 'school') return r.audience === 'school' || r.audience === 'both'
    if (filter === 'parent') return r.audience === 'parent' || r.audience === 'both'
    return true
  })

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy-700 mb-1">Resources</h1>
          <p className="text-sm text-navy-600/70">
            Playbooks, workbooks, articles, and other content. Click any item to edit.
          </p>
        </div>
        <Link
          href="/admin/resources/new"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-warm-500 hover:bg-warm-600 text-white font-medium rounded-lg transition text-sm"
        >
          + New
        </Link>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', 'school', 'parent', 'drafts'] as const).map(key => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition ${
              filter === key
                ? 'bg-warm-500 text-white'
                : 'bg-white border border-gray-200 text-navy-600 hover:bg-gray-50'
            }`}
          >
            {key === 'all' ? 'All' :
             key === 'school' ? 'For schools' :
             key === 'parent' ? 'For parents' : 'Drafts'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-navy-600 py-8 text-center">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-sm text-navy-600/70">
          {resources.length === 0
            ? <>No resources yet. <Link href="/admin/resources/new" className="text-warm-600 hover:underline">Add the first one →</Link></>
            : 'No resources match this filter.'}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {filtered.map(r => (
              <li key={r.id}>
                <Link
                  href={`/admin/resources/${r.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition"
                >
                  <span className="text-xl">{TYPE_ICONS[r.type] || '📄'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-medium text-navy-700 truncate">{r.title}</span>
                      {!r.is_published && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-navy-600/60 mt-0.5 capitalize">
                      {r.type} · {r.audience === 'both' ? 'Schools + Parents' : r.audience === 'school' ? 'Schools' : 'Parents'}
                      {' · '}
                      {r.slug}
                    </div>
                  </div>
                  <span className="text-warm-600 text-sm">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
