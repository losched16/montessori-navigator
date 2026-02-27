import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ACTIVITY_PAGES, getAllActivitySlugs } from '@/lib/seo-content'

export async function generateStaticParams() {
  return getAllActivitySlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = ACTIVITY_PAGES.find(p => p.slug === params.slug)
  if (!page) return {}
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    openGraph: { title: page.metaTitle, description: page.metaDescription },
  }
}

export default function ActivityPage({ params }: { params: { slug: string } }) {
  const page = ACTIVITY_PAGES.find(p => p.slug === params.slug)
  if (!page) notFound()

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-6">
        <Link href="/guides" className="hover:text-gray-600">Guides</Link>
        <span className="mx-1.5">›</span>
        <Link href="/guides" className="hover:text-gray-600">Activities by Age</Link>
        <span className="mx-1.5">›</span>
        <span className="text-gray-600">{page.ageLabel}</span>
      </nav>

      {/* Hero */}
      <header className="mb-8">
        <div className="text-xs font-semibold text-[#7b5ea7] uppercase tracking-widest mb-2">
          {page.agePlane} Age Plane
        </div>
        <h1 className="text-3xl font-bold text-[#1a0e2e] leading-snug mb-4" style={{ fontFamily: 'Georgia, serif' }}>
          {page.heroTitle}
        </h1>
        <p className="text-gray-600 leading-relaxed">{page.intro}</p>
      </header>

      {/* Age plane context */}
      <div className="bg-[#f8f5ff] border border-[#ede7f6] rounded-xl p-5 mb-8">
        <h2 className="font-semibold text-[#1a0e2e] text-sm mb-1">Where Your Child Is Developmentally</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{page.agePlaneDescription}</p>
      </div>

      {/* Sensitive periods */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#1a0e2e] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          Active Sensitive Periods
        </h2>
        <div className="flex flex-wrap gap-2">
          {page.sensitivePeriods.map(sp => (
            <span key={sp} className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              sp.includes('PEAK') ? 'bg-amber-100 text-amber-700' : 'bg-[#ede7f6] text-[#4a2c82]'
            }`}>{sp}</span>
          ))}
        </div>
      </div>

      {/* Activity categories */}
      {page.categories.map((cat, ci) => (
        <section key={ci} className="mb-10">
          <h2 className="text-xl font-bold text-[#1a0e2e] mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            {cat.areaLabel}
          </h2>
          <p className="text-sm text-gray-500 mb-4">{cat.description}</p>

          {cat.activities.map((act, ai) => (
            <div key={ai} className="bg-white border border-gray-100 rounded-xl p-6 mb-4">
              <h3 className="text-lg font-semibold text-[#1a0e2e] mb-1">{act.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{act.description}</p>

              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Materials</h4>
                <div className="flex flex-wrap gap-1.5">
                  {act.materials.map((m, mi) => (
                    <span key={mi} className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full">{m}</span>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Presentation</h4>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  {act.presentation.map((step, si) => (
                    <li key={si} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
              </div>

              <div className="bg-[#f8f5ff] rounded-lg p-3 mb-2">
                <h4 className="text-xs font-semibold text-[#4a2c82] mb-1">Why This Matters</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{act.whyItMatters}</p>
              </div>

              {act.diyTip && (
                <div className="bg-teal-50 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-teal-700 mb-1">DIY Tip</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{act.diyTip}</p>
                </div>
              )}
            </div>
          ))}
        </section>
      ))}

      {/* Environment tips */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-[#1a0e2e] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          Environment Tips for {page.ageLabel}
        </h2>
        <div className="space-y-2">
          {page.environmentTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
              <span className="text-teal-500 mt-0.5">✦</span>
              <span className="leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Common mistakes */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-[#1a0e2e] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          Common Mistakes to Avoid
        </h2>
        <div className="space-y-2">
          {page.commonMistakes.map((m, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
              <span className="text-red-400 mt-0.5">→</span>
              <span className="leading-relaxed">{m}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Related ages */}
      <section className="border-t border-gray-100 pt-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Related Guides</h2>
        <div className="flex flex-wrap gap-2">
          {page.relatedAges.map(slug => {
            const related = ACTIVITY_PAGES.find(p => p.slug === slug)
            if (!related) return null
            return (
              <Link key={slug} href={`/guides/activities/${slug}`} className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 rounded-lg transition">
                Activities for {related.ageLabel}
              </Link>
            )
          })}
        </div>
      </section>

      {/* Assessment CTA */}
      <div className="mt-8 bg-gradient-to-r from-[#4a2c82] to-[#1a2d6d] rounded-xl p-6 text-center">
        <h3 className="text-white font-bold mb-1">Is Montessori right for your {page.age}-old?</h3>
        <p className="text-white/50 text-sm mb-3">Take our free readiness assessment for personalized insight.</p>
        <Link href="/assessment" className="inline-block px-5 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-full transition">
          Take Free Assessment →
        </Link>
      </div>
    </article>
  )
}
