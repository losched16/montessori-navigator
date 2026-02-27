import { notFound } from 'next/navigation'
import Link from 'next/link'
import { COMPARE_PAGES, getAllCompareSlugs } from '@/lib/seo-content'

export async function generateStaticParams() {
  return getAllCompareSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = COMPARE_PAGES.find(p => p.slug === params.slug)
  if (!page) return {}
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    openGraph: { title: page.metaTitle, description: page.metaDescription },
  }
}

export default function ComparePage({ params }: { params: { slug: string } }) {
  const page = COMPARE_PAGES.find(p => p.slug === params.slug)
  if (!page) notFound()

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <nav className="text-xs text-gray-400 mb-6">
        <Link href="/guides" className="hover:text-gray-600">Guides</Link>
        <span className="mx-1.5">›</span>
        <span className="text-gray-600">{page.heroTitle}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a0e2e] leading-snug mb-4" style={{ fontFamily: 'Georgia, serif' }}>
          {page.heroTitle}
        </h1>
        <p className="text-gray-600 leading-relaxed">{page.intro}</p>
      </header>

      {/* Comparison table */}
      <div className="mb-8 space-y-3">
        {page.dimensions.map((dim, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-5 py-2">
              <h3 className="text-sm font-semibold text-[#1a0e2e]">{dim.dimension}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              <div className="p-4">
                <div className="text-[10px] font-semibold text-[#4a2c82] uppercase tracking-wide mb-1">Montessori</div>
                <p className="text-sm text-gray-600 leading-relaxed">{dim.montessori}</p>
              </div>
              <div className="p-4">
                <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{page.versus}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{dim.other}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Best for */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#f8f5ff] border border-[#ede7f6] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[#4a2c82] mb-3">Montessori may be better if...</h3>
          <div className="space-y-2">
            {page.bestFor.montessori.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-[#7b5ea7] mt-0.5">✦</span>
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">{page.versus} may be better if...</h3>
          <div className="space-y-2">
            {page.bestFor.other.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-gray-400 mt-0.5">✦</span>
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      <section className="border-t border-gray-100 pt-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">More Comparisons</h2>
        <div className="flex flex-wrap gap-2">
          {page.relatedComparisons.map(slug => {
            const related = COMPARE_PAGES.find(p => p.slug === slug)
            if (!related) return null
            return (
              <Link key={slug} href={`/guides/compare/${slug}`} className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 rounded-lg transition">
                Montessori vs. {related.versus}
              </Link>
            )
          })}
        </div>
      </section>

      <div className="mt-8 bg-gradient-to-r from-[#4a2c82] to-[#1a2d6d] rounded-xl p-6 text-center">
        <h3 className="text-white font-bold mb-1">Not sure which approach is right?</h3>
        <p className="text-white/50 text-sm mb-3">Our free readiness assessment helps you understand your family&apos;s alignment with Montessori.</p>
        <Link href="/assessment" className="inline-block px-5 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-full transition">
          Take Free Assessment →
        </Link>
      </div>
    </article>
  )
}
