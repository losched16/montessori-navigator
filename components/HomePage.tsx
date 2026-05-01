'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

// Generic home page — directs visitors to either the parent or school path.
// Messaging is intentionally neutral: the Alliance supports school-based
// Montessori learning (it does NOT promote homeschool or replacing teachers).
export default function HomePage() {
  const [learningOpen, setLearningOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLearningOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Small delay on close so a brief mouse-out (e.g. crossing internal borders
  // or briefly leaving the dropdown bounds) doesn't dismiss the menu before
  // the user can click an item.
  const openMenu = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setLearningOpen(true)
  }
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setLearningOpen(false), 150)
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap');
        .home-page {
          font-family: 'DM Sans', sans-serif;
          color: #1a0e2e;
          --deep-plum: #1a0e2e;
          --plum: #2d1b4e;
          --royal-purple: #4a2c82;
          --soft-purple: #7b5ea7;
          --lavender: #c4b1e0;
          --pale-lavender: #ede7f6;
          --teal: #2e8b8b;
          --blue-accent: #4a6cf7;
          --navy: #0f1a3c;
        }
        .home-page .serif { font-family: 'Cormorant Garamond', serif; }
      `}</style>

      <div className="home-page bg-[#fafaf8] min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <nav className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            <Logo variant="dark" imgClassName="h-9 sm:h-10 w-auto" />
            <div className="flex items-center gap-6">
              <Link href="/for-parents" className="hidden sm:inline text-[#5c4a7e] text-sm font-medium hover:text-[#1a0e2e] transition">For Parents</Link>
              <Link href="/schools" className="hidden sm:inline text-[#5c4a7e] text-sm font-medium hover:text-[#1a0e2e] transition">For Schools</Link>
              <div
                ref={dropdownRef}
                className="hidden md:block relative"
                onMouseEnter={openMenu}
                onMouseLeave={scheduleClose}
              >
                <button
                  type="button"
                  onClick={() => setLearningOpen(o => !o)}
                  className="inline-flex items-center gap-1 text-[#5c4a7e] text-sm font-medium hover:text-[#1a0e2e] transition"
                >
                  Learning Center
                  <span className={`text-[10px] transition-transform ${learningOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {learningOpen && (
                  // Outer wrapper sits flush against the button (no mt-*) so
                  // there's no dead zone between button and panel — the user's
                  // mouse stays inside a continuous hover region. The visible
                  // panel is offset visually via pt-2 inside.
                  <div
                    className="absolute top-full right-0 pt-2 w-56 z-40"
                    onMouseEnter={openMenu}
                    onMouseLeave={scheduleClose}
                  >
                    <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      <Link
                        href="/guides"
                        onClick={() => setLearningOpen(false)}
                        className="block px-4 py-3 hover:bg-[#fafaf8] transition"
                      >
                        <div className="font-medium text-[#1a0e2e] text-sm">Articles</div>
                        <div className="text-xs text-[#5c4a7e] mt-0.5">Montessori guides for parents</div>
                      </Link>
                      <div className="border-t border-gray-100" />
                      <Link
                        href="/assessment"
                        onClick={() => setLearningOpen(false)}
                        className="block px-4 py-3 hover:bg-[#fafaf8] transition"
                      >
                        <div className="font-medium text-[#1a0e2e] text-sm">Free Montessori Assessment</div>
                        <div className="text-xs text-[#5c4a7e] mt-0.5">Find out where to start</div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              <Link href="/auth/login" className="hidden md:inline text-[#5c4a7e] text-sm font-medium hover:text-[#1a0e2e] transition">Log in</Link>
              <Link href="/get-started" className="text-white text-sm font-medium px-5 py-2 rounded-full transition hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #4a2c82 100%)', boxShadow: '0 4px 16px rgba(74,108,247,0.25)' }}>
                Get Started
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero */}
        <section className="max-w-[1100px] mx-auto px-6 pt-20 pb-16 text-center">
          <div className="text-[11px] tracking-[0.15em] uppercase text-[var(--soft-purple)] font-semibold mb-4">From The Montessori Foundation</div>
          <h1 className="serif text-[clamp(2.4rem,5vw,4rem)] font-normal text-[var(--deep-plum)] leading-[1.1] max-w-[800px] mx-auto mb-5">
            Where Montessori families and schools <em className="text-[var(--royal-purple)]">come together</em>
          </h1>
          <p className="text-[clamp(1rem,1.5vw,1.15rem)] text-[#5c4a7e] max-w-[660px] mx-auto leading-relaxed mb-3">
            The Montessori Family Alliance is a trusted home for parents, educators, and schools — bringing the
            wisdom of the Montessori Foundation to every family in the movement, in partnership with the schools
            that guide them.
          </p>
          <p className="text-sm text-[var(--soft-purple)] italic mt-2">
            Founded by Tim Seldin, President of The Montessori Foundation
          </p>
        </section>

        {/* Audience picker */}
        <section className="max-w-[960px] mx-auto px-6 mt-8">
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Parents */}
            <Link href="/for-parents" className="group bg-white border border-gray-200 rounded-3xl p-9 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[var(--royal-purple)] flex flex-col">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
                style={{ background: 'linear-gradient(135deg, #ede7f6 0%, #d4cae6 100%)' }}>
                👨‍👩‍👧
              </div>
              <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--soft-purple)] mb-2">For Parents</div>
              <h2 className="serif text-[1.85rem] font-medium text-[var(--deep-plum)] leading-tight mb-3.5">
                Deepen your understanding. Strengthen your partnership with your school.
              </h2>
              <p className="text-[0.95rem] text-[#5c4a7e] leading-relaxed mb-6 flex-1">
                Trusted Montessori guidance, curriculum-area insights, and tools to observe your child&apos;s
                growth — so you can be the informed family partner your school&apos;s teachers can count on.
              </p>
              <div className="inline-flex items-center gap-2 text-[var(--royal-purple)] font-semibold text-sm">
                For Parents <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>

            {/* Schools */}
            <Link href="/schools" className="group bg-white border border-gray-200 rounded-3xl p-9 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[var(--royal-purple)] flex flex-col">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
                style={{ background: 'linear-gradient(135deg, #d4f0f0 0%, #b8e0e0 100%)' }}>
                🏫
              </div>
              <div className="text-[11px] font-bold tracking-widest uppercase text-[var(--teal)] mb-2">For Schools</div>
              <h2 className="serif text-[1.85rem] font-medium text-[var(--deep-plum)] leading-tight mb-3.5">
                Support your families. Strengthen your community.
              </h2>
              <p className="text-[0.95rem] text-[#5c4a7e] leading-relaxed mb-6 flex-1">
                Give every family in your school access to philosophy-aligned guidance, a re-enrollment
                playbook, and the trusted Foundation content that keeps parents engaged and your community
                thriving.
              </p>
              <div className="inline-flex items-center gap-2 text-[var(--teal)] font-semibold text-sm">
                For Schools <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Quote */}
        <section className="bg-[var(--deep-plum)] text-white py-20 px-6 text-center mt-24">
          <blockquote className="serif italic text-[clamp(1.4rem,2.5vw,1.85rem)] text-[var(--lavender)] max-w-[760px] mx-auto leading-relaxed">
            &ldquo;The greatest gifts we can give our children are the roots of responsibility and the wings of independence.&rdquo;
            <cite className="block mt-6 not-italic text-xs text-white/40 tracking-[0.12em]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              — Maria Montessori
            </cite>
          </blockquote>
        </section>

        {/* What the Alliance provides */}
        <section className="max-w-[1100px] mx-auto px-6 mt-24">
          <div className="text-center mb-3">
            <div className="text-[11px] tracking-[0.15em] uppercase text-[var(--soft-purple)] font-semibold">What the Alliance Provides</div>
          </div>
          <h2 className="serif text-[clamp(2rem,3.5vw,2.6rem)] font-normal text-[var(--deep-plum)] max-w-[720px] mx-auto text-center leading-tight mb-14">
            The trusted source for the <em className="text-[var(--royal-purple)]">Montessori movement</em>
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📚', title: 'Foundation Library', desc: 'Hundreds of articles, videos, and webinars from Tim Seldin and Montessori Foundation contributors — accessible to every member.' },
              { icon: '💬', title: 'Abigail, the AI Guide', desc: 'A philosophy-aligned AI assistant that answers Montessori questions 24/7 — grounded in the Foundation\'s teachings, never contradicting the school\'s classroom approach.' },
              { icon: '🌱', title: 'Family-School Partnership', desc: 'Tools that strengthen the bridge between the classroom and the home — observation prompts, conference prep, age-appropriate guidance.' },
              { icon: '📖', title: "Tomorrow's Child", desc: 'The Foundation\'s flagship newsletter for parents and educators — decades of issues, all in one place.' },
              { icon: '✨', title: 'Development Tracking', desc: 'Help families understand and celebrate their child\'s growth using the official Foundation curriculum framework.' },
              { icon: '🎓', title: 'Built with Educators', desc: 'Designed in partnership with Montessori schools — to support, not replace, the irreplaceable work of trained Montessori guides.' },
            ].map((f, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-7">
                <div className="w-11 h-11 rounded-xl bg-[var(--pale-lavender)] flex items-center justify-center text-2xl mb-4">{f.icon}</div>
                <h3 className="text-[1.05rem] font-semibold text-[var(--deep-plum)] mb-2">{f.title}</h3>
                <p className="text-sm text-[#5c4a7e] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Foundation credibility */}
        <section className="max-w-[900px] mx-auto px-6 mt-24">
          <div className="rounded-3xl p-12 border border-[var(--lavender)]/40 text-center"
            style={{ background: 'linear-gradient(135deg, #f8f5ff 0%, #ede7f6 100%)' }}>
            <div className="text-[11px] tracking-[0.15em] uppercase text-[var(--soft-purple)] font-semibold mb-4">Powered by the Foundation</div>
            <h3 className="serif text-[clamp(1.4rem,2.5vw,1.85rem)] text-[var(--deep-plum)] max-w-[640px] mx-auto leading-tight mb-4">
              Decades of Montessori expertise — in <em className="text-[var(--royal-purple)]">one trusted home</em>
            </h3>
            <p className="text-[#5c4a7e] max-w-[560px] mx-auto text-[0.95rem] leading-relaxed">
              The Montessori Foundation has spent over 30 years supporting families, schools, and educators
              worldwide. The Alliance is how that expertise reaches you.
            </p>
            <div className="flex justify-center gap-12 mt-8 flex-wrap">
              {[
                { stat: '30+', label: 'Years of Foundation work' },
                { stat: '495+', label: 'Articles & Videos' },
                { stat: '43', label: "Tomorrow's Child Issues" },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <strong className="serif text-[2rem] text-[var(--royal-purple)] font-semibold block leading-none">{s.stat}</strong>
                  <span className="text-[0.78rem] tracking-[0.08em] uppercase text-[var(--soft-purple)] font-semibold mt-1 inline-block">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final dual-CTA */}
        <section className="max-w-[1100px] mx-auto px-6 mt-24 text-center">
          <h2 className="serif text-[clamp(1.8rem,3vw,2.4rem)] text-[var(--deep-plum)] max-w-[720px] mx-auto leading-tight mb-4">
            Wherever you are in the Montessori journey, <em className="text-[var(--royal-purple)]">we&apos;re here to support you</em>
          </h2>
          <p className="text-[#5c4a7e] max-w-[560px] mx-auto mb-8">Choose the path that fits — and join the alliance.</p>
          <div className="inline-flex gap-3 flex-wrap justify-center">
            <Link href="/for-parents" className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-semibold rounded-full text-sm transition hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #4a2c82 100%)', boxShadow: '0 8px 24px rgba(74,108,247,0.25)' }}>
              I&apos;m a parent →
            </Link>
            <Link href="/schools" className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold rounded-full text-sm transition border border-[var(--royal-purple)]/30 text-[var(--deep-plum)] hover:bg-[var(--royal-purple)]/5">
              I&apos;m with a school
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[var(--navy)] text-white/50 py-14 px-6 text-center mt-24">
          <div className="serif text-xl text-white/60 mb-4">Montessori Family Alliance</div>
          <div className="flex justify-center gap-8 mb-6 flex-wrap text-sm">
            {[
              { label: 'For Parents', href: '/for-parents' },
              { label: 'For Schools', href: '/schools' },
              { label: 'Articles', href: '/guides' },
              { label: 'Free Assessment', href: '/assessment' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Log in', href: '/auth/login' },
            ].map(link => (
              <Link key={link.label} href={link.href} className="text-white/40 hover:text-white/80 transition">{link.label}</Link>
            ))}
          </div>
          <div className="text-[0.78rem] text-white/25 max-w-[580px] mx-auto">
            A product of Tim Seldin and The Montessori Foundation. Built with schools, for the families they serve.
          </div>
        </footer>
      </div>
    </>
  )
}
