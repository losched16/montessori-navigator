import Link from 'next/link'
import { ACTIVITY_PAGES, TOPIC_PAGES, COMPARE_PAGES } from '@/lib/seo-content'

export const metadata = {
  title: 'Montessori Guides for Parents — Free Resources',
  description: 'Free Montessori guides for parents. Age-specific activities, discipline guidance, school comparisons, and practical implementation advice grounded in authentic Montessori pedagogy.',
}

export default function GuidesIndex() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#1a0e2e] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          Montessori Parent Guides
        </h1>
        <p className="text-gray-500 leading-relaxed">
          Free, in-depth guides grounded in authentic Montessori pedagogy. Written by the Montessori Foundation to help you understand your child&apos;s development and implement Montessori at home.
        </p>
      </div>

      {/* Activities by age */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-[#1a0e2e] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
          Activities by Age
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {ACTIVITY_PAGES.map(page => (
            <Link
              key={page.slug}
              href={`/guides/activities/${page.slug}`}
              className="p-4 bg-white border border-gray-100 rounded-xl hover:border-[#4a2c82]/20 hover:shadow-sm transition"
            >
              <div className="text-sm font-semibold text-[#1a0e2e]">{page.ageLabel}</div>
              <div className="text-xs text-gray-400 mt-0.5">{page.sensitivePeriods.length} active sensitive periods</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Topic guides */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-[#1a0e2e] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
          Topic Guides
        </h2>
        <div className="space-y-2">
          {TOPIC_PAGES.map(page => (
            <Link
              key={page.slug}
              href={`/guides/topics/${page.slug}`}
              className="block p-4 bg-white border border-gray-100 rounded-xl hover:border-[#4a2c82]/20 hover:shadow-sm transition"
            >
              <div className="text-sm font-semibold text-[#1a0e2e]">{page.heroTitle}</div>
              <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{page.intro}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Comparisons */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-[#1a0e2e] mb-4" style={{ fontFamily: 'Georgia, serif' }}>
          Montessori vs. Other Approaches
        </h2>
        <div className="space-y-2">
          {COMPARE_PAGES.map(page => (
            <Link
              key={page.slug}
              href={`/guides/compare/${page.slug}`}
              className="block p-4 bg-white border border-gray-100 rounded-xl hover:border-[#4a2c82]/20 hover:shadow-sm transition"
            >
              <div className="text-sm font-semibold text-[#1a0e2e]">{page.heroTitle}</div>
              <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{page.intro}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
