import Link from 'next/link'
import { SCHOOL_RESOURCES, resourceTypeLabel } from '@/lib/school-resources'

// School Resources library — playbooks, workbooks, templates the Foundation
// publishes for member schools. This is the index. Each resource also has a
// detail page at /school/resources/[slug] that shows the description, what's
// inside, and inline-renders the PDF.

export default function SchoolResourcesPage() {
  return (
    <div className="max-w-5xl pb-20 sm:pb-0">
      <h1 className="text-xl font-bold text-navy-600 mb-2">Resources</h1>
      <p className="text-sm text-navy-600/70 mb-6">
        Playbooks, workbooks, and templates from The Montessori Foundation to help you build a thriving school community.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {SCHOOL_RESOURCES.map(resource => (
          <Link
            key={resource.slug}
            href={`/school/resources/${resource.slug}`}
            className="group bg-white border border-gray-100 rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-md hover:border-warm-200 flex flex-col"
          >
            {/* Decorative cover */}
            <div
              className="aspect-[4/3] rounded-xl mb-4 flex items-center justify-center text-5xl"
              style={{
                background:
                  resource.type === 'playbook'
                    ? 'linear-gradient(135deg, #ede7f6 0%, #d4cae6 100%)'
                    : resource.type === 'workbook'
                      ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                      : 'linear-gradient(135deg, #d4f0f0 0%, #b8e0e0 100%)',
              }}
            >
              {resource.type === 'playbook' ? '📘' : resource.type === 'workbook' ? '📒' : '📄'}
            </div>

            <div className="text-[10px] font-bold tracking-widest uppercase text-warm-600 mb-1.5">
              {resourceTypeLabel(resource.type)}
            </div>
            <h2 className="text-base font-semibold text-navy-700 mb-2 leading-snug">
              {resource.title}
            </h2>
            <p className="text-sm text-navy-600/70 leading-relaxed flex-1">
              {resource.description}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 text-warm-600 font-medium text-sm">
              Open <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Foot note */}
      <p className="mt-8 text-xs text-navy-600/50">
        More resources coming soon. Have a request?{' '}
        <a href="mailto:hello@montessori.org" className="underline hover:text-navy-700">
          Tell us what you need.
        </a>
      </p>
    </div>
  )
}
