'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import ResourceForm from '@/components/admin/ResourceForm'
import type { Resource } from '@/lib/resources'
import { getResourceById, resolvePdfUrl } from '@/lib/resources'

export default function EditResourcePage() {
  const params = useParams<{ id: string }>()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

  useEffect(() => {
    const load = async () => {
      const r = await getResourceById(supabase, params.id)
      setResource(r)
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) {
    return <div className="text-navy-600 py-8 text-center">Loading…</div>
  }

  if (!resource) {
    return (
      <div className="max-w-2xl">
        <Link href="/admin/resources" className="text-xs text-navy-600/60 hover:text-navy-700">
          ← Back to resources
        </Link>
        <div className="bg-white border border-gray-100 rounded-2xl p-8 mt-4 text-center">
          <h1 className="text-base font-semibold text-navy-700 mb-2">Resource not found</h1>
          <p className="text-sm text-navy-600/70">It may have been deleted.</p>
        </div>
      </div>
    )
  }

  const pdfUrl = resolvePdfUrl(resource.pdfPath, supabaseUrl)

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/resources"
        className="inline-flex items-center gap-1 text-xs text-navy-600/60 hover:text-navy-700 mb-4"
      >
        ← Back to resources
      </Link>
      <div className="flex items-baseline justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-navy-700">Edit resource</h1>
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-warm-600 hover:text-warm-700 font-medium whitespace-nowrap"
          >
            Open PDF →
          </a>
        )}
      </div>
      <ResourceForm existing={resource} />
    </div>
  )
}
