import Link from 'next/link'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { listPublishedResources, resourceTypeLabel } from '@/lib/resources'

// Parent-facing resource library — mirrors /school/resources but filtered to
// audience IN ('parent', 'both'). Same layout patterns so a single design
// language across both sides of the platform.

export const dynamic = 'force-dynamic'

export default async function ParentResourcesPage() {
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const resources = await listPublishedResources(service, 'parent')

  return (
    <div className="max-w-5xl pb-20 sm:pb-0">
      <h1 className="text-xl font-bold text-navy-700 mb-2">Resources</h1>
      <p className="text-sm text-navy-600/70 mb-6">
        Guides, articles, and tools from The Montessori Foundation — to help you understand what your child is doing, what to do at home, and how to be the partner your school is hoping for.
      </p>

      {resources.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">📚</div>
          <h2 className="text-base font-semibold text-navy-700 mb-2">No resources yet</h2>
          <p className="text-sm text-navy-600/70">Check back soon — new resources are added regularly.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {resources.map(resource => (
            <Link
              key={resource.slug}
              href={`/dashboard/resources/${resource.slug}`}
              className="group bg-white border border-gray-100 rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-md hover:border-warm-200 flex flex-col"
            >
              <div
                className="aspect-[4/3] rounded-xl mb-4 flex items-center justify-center text-5xl"
                style={{
                  background:
                    resource.type === 'playbook'
                      ? 'linear-gradient(135deg, #ede7f6 0%, #d4cae6 100%)'
                      : resource.type === 'workbook'
                        ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
                        : resource.type === 'newsletter'
                          ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                          : resource.type === 'article'
                            ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
                            : 'linear-gradient(135deg, #d4f0f0 0%, #b8e0e0 100%)',
                }}
              >
                {resource.type === 'playbook' ? '📘'
                  : resource.type === 'workbook' ? '📒'
                  : resource.type === 'newsletter' ? '📨'
                  : resource.type === 'article' ? '📄'
                  : resource.type === 'template' ? '📋'
                  : '📖'}
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
      )}

      <p className="mt-8 text-xs text-navy-600/50">
        More resources added regularly.
      </p>
    </div>
  )
}
