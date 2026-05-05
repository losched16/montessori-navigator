import Link from 'next/link'
import ResourceForm from '@/components/admin/ResourceForm'

export default function NewResourcePage() {
  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/resources"
        className="inline-flex items-center gap-1 text-xs text-navy-600/60 hover:text-navy-700 mb-4"
      >
        ← Back to resources
      </Link>
      <h1 className="text-xl font-bold text-navy-700 mb-6">New resource</h1>
      <ResourceForm />
    </div>
  )
}
