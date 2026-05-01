import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  SCHOOL_RESOURCES,
  getSchoolResource,
  resourceTypeLabel,
} from '@/lib/school-resources'

// Detail page for a single resource. Shows description + "what's inside",
// renders the PDF inline (browser native viewer), and exposes Download / Open
// in new tab buttons. Inline PDF preview means admins can skim without
// committing to a download — important for the workbook (so they know what
// they're customizing before printing).

export function generateStaticParams() {
  return SCHOOL_RESOURCES.map(r => ({ slug: r.slug }))
}

interface Props {
  params: { slug: string }
}

export default function SchoolResourceDetailPage({ params }: Props) {
  const resource = getSchoolResource(params.slug)
  if (!resource) notFound()

  return (
    <div className="max-w-5xl pb-20 sm:pb-0">
      {/* Breadcrumb */}
      <nav className="mb-4 text-xs text-navy-600/60">
        <Link href="/school/resources" className="hover:text-navy-700">Resources</Link>
        <span className="mx-1.5">/</span>
        <span className="text-navy-700">{resource.title}</span>
      </nav>

      {/* Header card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
        <div className="text-[10px] font-bold tracking-widest uppercase text-warm-600 mb-2">
          {resourceTypeLabel(resource.type)}
        </div>
        <h1 className="text-2xl font-bold text-navy-700 mb-3 leading-tight">
          {resource.title}
        </h1>
        <p className="text-sm text-navy-600/80 leading-relaxed mb-5">
          {resource.description}
        </p>

        {resource.highlights && resource.highlights.length > 0 && (
          <div className="bg-warm-50 border border-warm-100 rounded-xl p-4 mb-5">
            <div className="text-xs font-semibold text-warm-700 uppercase tracking-wide mb-2">
              What&apos;s inside
            </div>
            <ul className="space-y-1.5">
              {resource.highlights.map((h, i) => (
                <li key={i} className="text-sm text-navy-700 flex items-start gap-2">
                  <span className="text-warm-600 mt-0.5">✓</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <a
            href={resource.pdfPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-warm-500 hover:bg-warm-600 text-white text-sm font-medium rounded-lg transition"
          >
            <span>📖</span> Open in new tab
          </a>
          <a
            href={resource.pdfPath}
            download
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:border-gray-300 text-navy-700 text-sm font-medium rounded-lg transition hover:bg-gray-50"
          >
            <span>⬇</span> Download PDF
          </a>
        </div>
      </div>

      {/* Inline PDF preview */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 text-xs font-medium text-navy-600/60 uppercase tracking-wide">
          Preview
        </div>
        <iframe
          src={resource.pdfPath}
          title={resource.title}
          className="w-full"
          style={{ height: '85vh', border: 'none', display: 'block' }}
        />
      </div>
    </div>
  )
}
