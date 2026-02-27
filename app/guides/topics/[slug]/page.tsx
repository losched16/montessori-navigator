import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TOPIC_PAGES, getAllTopicSlugs } from '@/lib/seo-content'

export async function generateStaticParams() {
  return getAllTopicSlugs().map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = TOPIC_PAGES.find(p => p.slug === params.slug)
  if (!page) return {}
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    openGraph: { title: page.metaTitle, description: page.metaDescription },
  }
}

export default function TopicPage({ params }: { params: { slug: string } }) {
  const page = TOPIC_PAGES.find(p => p.slug === params.slug)
  if (!page) notFound()

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <nav className="text-xs text-gray-400 mb-6">
        <Link href="/guides" className="hover:text-gray-600">Guides</Link>
        <span className="mx-1.5">›</span>
        <span className="text-gray-600">{page.topic}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#1a0e2e] leading-snug mb-4" style={{ fontFamily: 'Georgia, serif' }}>
          {page.heroTitle}
        </h1>
        <p className="text-gray-600 leading-relaxed">{page.intro}</p>
      </header>

      {/* Montessori vs conventional view */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <div className="bg-[#f8f5ff] border border-[#ede7f6] rounded-xl p-5">
          <h2 className="text-xs font-semibold text-[#4a2c82] uppercase tracking-wide mb-2">The Montessori View</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{page.montessoriView}</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">The Common Approach</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{page.commonApproach}</p>
        </div>
      </div>

      {/* Main sections */}
      {page.sections.map((section, i) => (
        <section key={i} className="mb-6">
          <h2 className="text-xl font-bold text-[#1a0e2e] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            {section.heading}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
        </section>
      ))}

      {/* Scripts */}
      {page.scripts && page.scripts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-[#1a0e2e] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            What to Say
          </h2>
          <div className="space-y-3">
            {page.scripts.map((script, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{script.situation}</div>
                <p className="text-sm text-[#1a0e2e] italic leading-relaxed mb-2">&ldquo;{script.say}&rdquo;</p>
                <p className="text-xs text-gray-500">{script.why}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Age-specific tips */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-[#1a0e2e] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          By Age
        </h2>
        <div className="space-y-2">
          {page.ageSpecificTips.map((tip, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="text-xs font-semibold text-[#4a2c82] mb-1">{tip.ageRange}</div>
              <p className="text-sm text-gray-600 leading-relaxed">{tip.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related */}
      <section className="border-t border-gray-100 pt-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">Related Guides</h2>
        <div className="flex flex-wrap gap-2">
          {page.relatedTopics.map(slug => {
            const related = TOPIC_PAGES.find(p => p.slug === slug)
            if (!related) return null
            return (
              <Link key={slug} href={`/guides/topics/${slug}`} className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 rounded-lg transition">
                {related.topic}
              </Link>
            )
          })}
        </div>
      </section>

      <div className="mt-8 bg-gradient-to-r from-[#4a2c82] to-[#1a2d6d] rounded-xl p-6 text-center">
        <h3 className="text-white font-bold mb-1">Get personalized {page.topic.toLowerCase()} guidance</h3>
        <p className="text-white/50 text-sm mb-3">Navigator&apos;s AI guide knows your child and gives specific, Montessori-grounded advice.</p>
        <Link href="/auth/signup" className="inline-block px-5 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-full transition">
          Start Using Navigator →
        </Link>
      </div>
    </article>
  )
}
