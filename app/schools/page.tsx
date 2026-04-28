'use client'

import { useEffect } from 'react'
import Link from 'next/link'

const IMAGES = {
  hero: '/schools/hero.jpg',
  parent: '/schools/recruit.jpg',
  children: '/schools/retain.jpg',
}

export default function SchoolsPage() {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
    reveals.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        .sp { font-family: 'DM Sans', sans-serif; color: #1a0e2e; }
        .sp .serif { font-family: 'Cormorant Garamond', serif; }
        .reveal { opacity: 0; transform: translateY(24px); transition: all 0.65s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      <div className="sp">
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ background: 'linear-gradient(180deg, rgba(15,26,60,0.97) 0%, rgba(15,26,60,0) 100%)' }}>
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="serif text-xl font-semibold text-white tracking-wide">Montessori <span className="text-[#c4b1e0] font-normal">Family Alliance</span></Link>
            <div className="flex items-center gap-5">
              <a href="#how-it-helps" className="hidden sm:inline text-white/50 text-sm hover:text-white transition">How It Helps</a>
              <Link href="/for-schools/pricing" className="hidden sm:inline text-white/50 text-sm hover:text-white transition">Pricing</Link>
              <Link href="/" className="hidden sm:inline text-white/50 text-sm hover:text-white transition">For Parents</Link>
              <Link href="/auth/login" className="hidden md:inline text-white/50 text-sm hover:text-white transition">Log in</Link>
              <Link href="/for-schools/demo" className="text-white text-sm font-medium px-5 py-2 rounded-full border border-white/15 bg-white/10 hover:bg-white/[0.18] transition">Get a Demo</Link>
            </div>
          </div>
        </nav>

        <section className="min-h-[85vh] relative flex items-center overflow-hidden pt-20" style={{ background: 'linear-gradient(165deg, #0f1a3c 0%, #1a0e2e 40%, #2d1b4e 100%)' }}>
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '200px' }} />
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 px-4 py-1.5 rounded-full mb-6" style={{ animation: 'fadeUp 0.8s ease both' }}>
                <div className="w-1.5 h-1.5 bg-[#8b9cf7] rounded-full" style={{ animation: 'pulse 2s ease infinite' }} />
                <span className="text-[11px] text-[#c4b1e0] font-medium tracking-widest uppercase">For Montessori Schools</span>
              </div>
              <h1 className="serif text-[clamp(2.4rem,5vw,4.2rem)] font-normal text-white leading-[1.08] mb-5" style={{ animation: 'fadeUp 0.8s ease 0.1s both' }}>Your partner in <em className="text-[#c4b1e0]">recruiting, onboarding, and retaining</em> families</h1>
              <p className="text-[clamp(1rem,1.5vw,1.1rem)] text-white/45 max-w-[500px] leading-relaxed mb-7" style={{ animation: 'fadeUp 0.8s ease 0.25s both' }}>Family Alliance helps your families understand Montessori, stay engaged, and become your strongest advocates. Powered by Tim Seldin and the Montessori Foundation.</p>
              <div className="flex flex-col sm:flex-row gap-3" style={{ animation: 'fadeUp 0.8s ease 0.4s both' }}>
                <Link href="/for-schools/pricing" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-white font-semibold rounded-full text-[0.95rem] transition hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #4a2c82 100%)', boxShadow: '0 4px 24px rgba(74,108,247,0.25)' }}>Start a Trial →</Link>
                <Link href="/for-schools/demo" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-white font-medium rounded-full text-[0.95rem] border border-white/30 hover:bg-white/5 transition">Get a Demo</Link>
              </div>
            </div>
            <div className="hidden lg:block" style={{ animation: 'fadeUp 1s ease 0.5s both' }}>
              <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
                <img src={IMAGES.hero} alt="Children reading and learning together" className="w-full h-[400px] object-cover" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="reveal text-center mb-10">
              <div className="text-xs font-semibold tracking-[0.15em] uppercase text-[#7b5ea7] mb-2">The Challenge Schools Face</div>
              <h2 className="serif text-[clamp(1.8rem,3.5vw,2.6rem)] font-normal text-[#1a0e2e] leading-[1.15] max-w-[700px] mx-auto">Parent education is <em className="text-[#4a2c82]">your biggest opportunity</em> — and your biggest bottleneck</h2>
            </div>
            <div className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: '🔄', title: 'Re-enrollment depends on understanding', desc: 'Families who don\'t understand Montessori don\'t see the value. When they don\'t see the value, they leave.' },
                { icon: '⏰', title: 'Teachers can\'t do it all', desc: 'Your guides are busy observing, presenting, and preparing environments. They shouldn\'t also have to be the sole parent educators.' },
                { icon: '🌐', title: 'Parents Google — and get it wrong', desc: 'The internet is full of bad Montessori advice. Parents come to conferences with ideas that contradict what you teach.' },
                { icon: '📋', title: 'Onboarding takes too long', desc: 'New families spend months confused. That confusion becomes anxiety, which becomes complaints, which becomes attrition.' },
              ].map((card, i) => (
                <div key={i} className="p-5 bg-white border border-[#1a0e2e]/5 rounded-xl">
                  <div className="text-2xl mb-3">{card.icon}</div>
                  <h3 className="font-semibold text-[#1a0e2e] text-sm mb-1">{card.title}</h3>
                  <p className="text-xs text-[#5c4a7e] leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-helps" className="py-20 px-6" style={{ background: '#faf8ff' }}>
          <div className="max-w-5xl mx-auto">
            <div className="reveal text-center mb-12">
              <div className="text-xs font-semibold tracking-[0.15em] uppercase text-[#7b5ea7] mb-2">How Family Alliance Helps Your School</div>
              <h2 className="serif text-[clamp(1.8rem,3.5vw,2.6rem)] font-normal text-[#1a0e2e] leading-[1.15]">Three ways we become <em className="text-[#4a2c82]">your partner</em></h2>
            </div>

            <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
              <div>
                <div className="text-xs font-bold text-[#8b9cf7] tracking-wider mb-2">01 — RECRUIT &amp; ONBOARD</div>
                <h3 className="serif text-[clamp(1.5rem,2.5vw,2rem)] font-medium text-[#1a0e2e] leading-[1.2] mb-4">Turn inquiring families into confident community members</h3>
                <p className="text-[#5c4a7e] leading-relaxed mb-4">Family Alliance gives prospective families a <strong className="text-[#1a0e2e]">free readiness assessment</strong> that helps them understand if Montessori is right for them — and connects them to your school. For new enrollments, we provide a <strong className="text-[#1a0e2e]">structured onboarding playbook</strong> that walks families through Montessori philosophy, classroom expectations, and how to support learning at home.</p>
                <div className="space-y-2">
                  {['Readiness assessment drives qualified inquiries to your school', 'New family onboarding playbook reduces confusion from day one', 'Parents understand Montessori before their first conference', 'School tour evaluation tool helps families ask the right questions'].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[#5c4a7e]"><span className="text-[#4a2c82] mt-0.5">✦</span><span>{item}</span></div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden">
                <img src={IMAGES.parent} alt="Happy family together" className="w-full h-[320px] object-cover rounded-2xl" />
              </div>
            </div>

            <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
              <div className="md:order-2">
                <div className="text-xs font-bold text-[#8b9cf7] tracking-wider mb-2">02 — EDUCATE &amp; RETAIN</div>
                <h3 className="serif text-[clamp(1.5rem,2.5vw,2rem)] font-medium text-[#1a0e2e] leading-[1.2] mb-4">Keep families engaged, informed, and re-enrolling</h3>
                <p className="text-[#5c4a7e] leading-relaxed mb-4">Re-enrollment is everything. Families who understand the value of what you do don&apos;t leave. Family Alliance gives your parents <strong className="text-[#1a0e2e]">Abigail — an AI guide who reinforces your school&apos;s philosophy</strong> 24/7 — answering questions at 10pm that would otherwise become confused emails to your head of school.</p>
                <p className="text-[#5c4a7e] leading-relaxed mb-4">We also provide a <strong className="text-[#1a0e2e]">re-enrollment playbook</strong> with strategies and touchpoints that strengthen the parent-school relationship throughout the year.</p>
                <div className="space-y-2">
                  {['Abigail answers parent questions aligned with YOUR philosophy', 'Re-enrollment playbook with year-round retention strategies', 'Development tracking helps parents see their child\'s growth', 'Progress reports give families concrete evidence of Montessori\'s impact'].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[#5c4a7e]"><span className="text-[#4a2c82] mt-0.5">✦</span><span>{item}</span></div>
                  ))}
                </div>
              </div>
              <div className="md:order-1 rounded-2xl overflow-hidden">
                <img src={IMAGES.children} alt="Child exploring and discovering in nature" className="w-full h-[320px] object-cover rounded-2xl" />
              </div>
            </div>

            <div id="content" className="reveal grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-xs font-bold text-[#8b9cf7] tracking-wider mb-2">03 — CONTENT FROM THE SOURCE</div>
                <h3 className="serif text-[clamp(1.5rem,2.5vw,2rem)] font-medium text-[#1a0e2e] leading-[1.2] mb-4">Give your families Foundation content — under your name</h3>
                <p className="text-[#5c4a7e] leading-relaxed mb-4">Your families need Montessori education. But creating that content is expensive and time-consuming. Family Alliance gives your school access to <strong className="text-[#1a0e2e]">495+ articles and videos from Tim Seldin and the Montessori Foundation</strong> that you can share with your parent community as your own resource.</p>
                <p className="text-[#5c4a7e] leading-relaxed mb-4">This isn&apos;t generic parenting content from the internet. It&apos;s <strong className="text-[#1a0e2e]">curated, Foundation-approved education</strong> that aligns with what your teachers are doing in the classroom. Send it in your newsletter. Share it at parent nights. Use it in onboarding. It&apos;s all consistent with authentic Montessori.</p>
                <div className="space-y-2">
                  {['495+ articles and videos from Tim Seldin & the Foundation', 'Push content to your parent community through the platform', 'Consistent messaging that aligns with your classroom practice', 'New content added regularly — always current, always authentic'].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[#5c4a7e]"><span className="text-[#4a2c82] mt-0.5">✦</span><span>{item}</span></div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl p-7" style={{ background: 'linear-gradient(135deg, #1a0e2e 0%, #2d1b4e 100%)' }}>
                <div className="text-xs text-[#8b9cf7] font-semibold tracking-wider uppercase mb-4">Foundation Content Library</div>
                {[
                  { title: 'Understanding the Three-Hour Work Cycle', type: 'Article', author: 'Tim Seldin' },
                  { title: 'Why Mixed-Age Classrooms Work', type: 'Video', author: 'Montessori Foundation' },
                  { title: 'Supporting Your Child at Home', type: 'Guide', author: 'Tim Seldin' },
                  { title: 'What to Expect in the First Year', type: 'Article', author: 'Montessori Foundation' },
                  { title: 'The Role of the Montessori Parent', type: 'Webinar', author: 'Tim Seldin' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-white/[0.05] border border-white/[0.05] rounded-lg mb-2">
                    <div className="text-sm text-white/80 font-medium">{item.title}</div>
                    <div className="text-xs text-white/35 mt-0.5">{item.type} · {item.author}</div>
                  </div>
                ))}
                <div className="text-xs text-white/30 mt-3 text-center">+ 490 more resources available</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto reveal">
            <div className="bg-gradient-to-br from-[#1a0e2e] to-[#2d1b4e] rounded-2xl p-8 sm:p-10 text-center">
              <h3 className="serif text-2xl text-white mb-3">Why not just tell parents to use ChatGPT?</h3>
              <p className="text-white/50 leading-relaxed max-w-xl mx-auto mb-6">Because ChatGPT will recommend reward charts, time-outs, and screen-based learning in the same breath as Montessori advice. It mixes every educational philosophy together. It doesn&apos;t know your school, your curriculum, or your families. And it contradicts your teachers without knowing it.</p>
              <p className="text-white/70 leading-relaxed max-w-xl mx-auto">Abigail only speaks Montessori — and specifically, the Foundation&apos;s Montessori. She reinforces what your teachers do, never contradicts your approach, and gives parents guidance that&apos;s <strong className="text-white">consistent with what happens in your classroom</strong>.</p>
            </div>
          </div>
        </section>

        <section id="privacy" className="py-16 px-6" style={{ background: '#faf8ff' }}>
          <div className="max-w-4xl mx-auto">
            <div className="reveal text-center mb-8">
              <div className="text-xs font-semibold tracking-[0.15em] uppercase text-[#7b5ea7] mb-2">Privacy-First</div>
              <h2 className="serif text-[clamp(1.8rem,3vw,2.4rem)] font-normal text-[#1a0e2e] leading-[1.2]">Schools see engagement. <em className="text-[#4a2c82]">Never</em> individual family data.</h2>
            </div>
            <div className="reveal grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {[
                { title: 'What you see', items: ['Percentage of families actively using Family Alliance', 'Most-viewed content and resources', 'Engagement trends over time', 'Aggregate milestone and observation counts'] },
                { title: 'What you never see', items: ['Individual family conversations with Abigail', 'Specific child observations or development data', 'Parent notes or personal reflections', 'Any data that identifies a specific family'] },
              ].map((col, ci) => (
                <div key={ci} className="bg-white border border-gray-100 rounded-xl p-6">
                  <h3 className="font-semibold text-[#1a0e2e] text-sm mb-3">{col.title}</h3>
                  <div className="space-y-2">
                    {col.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-[#5c4a7e]">
                        <span className={ci === 0 ? 'text-teal-500' : 'text-red-400'} style={{ marginTop: '2px' }}>{ci === 0 ? '✓' : '✕'}</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="reveal text-center mb-10">
              <h2 className="serif text-[clamp(1.8rem,3vw,2.4rem)] font-normal text-[#1a0e2e] leading-[1.2]">What your school gets</h2>
            </div>
            <div className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { icon: '📖', title: 'New Family Onboarding Playbook', desc: 'Step-by-step guide to orient new families from enrollment through the first 90 days.' },
                { icon: '🔄', title: 'Re-enrollment Retention Playbook', desc: 'Year-round touchpoints and strategies to keep families engaged and committed.' },
                { icon: '📚', title: 'Foundation Content Library', desc: '495+ articles and videos from Tim Seldin you can share with your parent community.' },
                { icon: '💬', title: 'Abigail for Your Families', desc: 'AI guide that answers parent questions at any hour — always aligned with your philosophy.' },
                { icon: '📊', title: 'Engagement Dashboard', desc: 'See aggregate engagement metrics across your parent community. Privacy-protected.' },
                { icon: '🎓', title: 'Parent Education Support', desc: 'Ready-made content for parent nights, newsletters, and conference preparation.' },
              ].map((item, i) => (
                <div key={i} className="p-5 bg-white border border-[#1a0e2e]/5 rounded-xl">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className="font-semibold text-[#1a0e2e] text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-[#5c4a7e] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="py-24 px-6 text-center relative overflow-hidden" style={{ background: 'linear-gradient(165deg, #0f1a3c 0%, #1a0e2e 50%, #2d1b4e 100%)' }}>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '200px' }} />
          <h2 className="serif text-[clamp(2rem,4vw,3rem)] font-normal text-white leading-[1.15] max-w-[600px] mx-auto mb-4 relative z-10">Let&apos;s make your families <em className="text-[#c4b1e0]">your strongest advocates</em></h2>
          <p className="text-white/40 max-w-[460px] mx-auto mb-7 leading-relaxed relative z-10">We&apos;d love to show you how Family Alliance can support your school&apos;s parent education, onboarding, and retention. Pick a time on the calendar — no pressure, just a walkthrough.</p>
          <div className="relative z-10 inline-flex flex-col sm:flex-row gap-3">
            <Link href="/for-schools/demo" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white font-semibold rounded-full text-[0.95rem] transition hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #4a2c82 100%)', boxShadow: '0 4px 24px rgba(74,108,247,0.25)' }}>Get a Demo →</Link>
            <Link href="/for-schools/pricing" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white font-medium rounded-full text-[0.95rem] border border-white/30 hover:bg-white/5 transition">Start a Trial</Link>
          </div>
          <p className="text-white/20 text-xs mt-4 relative z-10">Or email us directly at schools@montessori.org</p>
        </section>

        <footer className="py-10 px-6" style={{ background: '#0f1a3c', borderTop: '1px solid rgba(196,177,224,0.06)' }}>
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="serif text-lg font-semibold text-white/50">Montessori Family Alliance™</div>
            <div className="flex gap-6">
              {[{ label: 'For Parents', href: '/' }, { label: 'Free Assessment', href: '/assessment' }, { label: 'Guides', href: '/guides' }, { label: 'Privacy', href: '#' }].map(link => (
                <Link key={link.label} href={link.href} className="text-sm text-white/25 hover:text-white/50 transition">{link.label}</Link>
              ))}
            </div>
          </div>
          <div className="text-xs text-white/15 text-center mt-6 max-w-6xl mx-auto">A product of Tim Seldin and the Montessori Foundation.</div>
        </footer>
      </div>
    </>
  )
}
