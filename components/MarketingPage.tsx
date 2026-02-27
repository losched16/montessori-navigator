'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function MarketingPage() {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' })

    reveals.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

        .landing-page {
          font-family: 'DM Sans', sans-serif;
          color: #1a0e2e;
          --deep-plum: #1a0e2e;
          --plum: #2d1b4e;
          --royal-purple: #4a2c82;
          --soft-purple: #7b5ea7;
          --lavender: #c4b1e0;
          --pale-lavender: #ede7f6;
          --ghost: #f8f5ff;
          --navy: #0f1a3c;
          --deep-blue: #1a2d6d;
          --blue-accent: #4a6cf7;
          --periwinkle: #8b9cf7;
        }
        .landing-page .serif { font-family: 'Cormorant Garamond', serif; }
        .reveal { opacity: 0; transform: translateY(30px); transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scrollPulse { 0% { transform: scaleY(1); opacity: 1; } 50% { transform: scaleY(0.6); opacity: 0.4; } 100% { transform: scaleY(1); opacity: 1; } }
      `}</style>

      <div className="landing-page">
        {/* ====== HERO ====== */}
        <section className="min-h-screen relative flex flex-col overflow-hidden" style={{ background: 'linear-gradient(165deg, #1a0e2e 0%, #2d1b4e 30%, #0f1a3c 70%, #1a2d6d 100%)' }}>
          {/* Grain */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '200px' }} />
          {/* Glow */}
          <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(74,108,247,0.12) 0%, transparent 70%)' }} />

          <nav className="relative z-10 px-6 py-5 flex justify-between items-center">
            <div className="serif text-xl font-semibold text-white tracking-wide">Montessori <span className="text-[#c4b1e0] font-normal">Navigator</span></div>
            <div className="flex items-center gap-6">
              <a href="#features" className="hidden sm:inline text-white/60 text-sm font-medium hover:text-white transition">Features</a>
              <a href="#who" className="hidden sm:inline text-white/60 text-sm font-medium hover:text-white transition">Who it&apos;s for</a>
              <a href="#schools" className="hidden sm:inline text-white/60 text-sm font-medium hover:text-white transition">Schools</a>
              <Link href="/auth/signup" className="text-white text-sm font-medium px-5 py-2 rounded-full border border-white/15 bg-white/10 hover:bg-white/[0.18] transition">
                Get Started
              </Link>
            </div>
          </nav>

          <div className="flex-1 flex flex-col justify-center items-center text-center px-6 relative z-5">
            <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 px-4 py-1.5 rounded-full mb-8" style={{ animation: 'fadeUp 0.8s ease both' }}>
              <div className="w-1.5 h-1.5 bg-[#8b9cf7] rounded-full" style={{ animation: 'pulse 2s ease infinite' }} />
              <span className="text-xs text-[#c4b1e0] font-medium tracking-widest uppercase">From the Montessori Foundation</span>
            </div>

            <h1 className="serif text-[clamp(2.8rem,6vw,5.5rem)] font-normal text-white leading-[1.1] max-w-[800px] mb-6" style={{ animation: 'fadeUp 0.8s ease 0.15s both' }}>
              A <em className="text-[#c4b1e0]">prepared environment</em> for parents
            </h1>

            <p className="text-[clamp(1rem,1.8vw,1.2rem)] text-white/50 max-w-[520px] leading-relaxed mb-8" style={{ animation: 'fadeUp 0.8s ease 0.3s both' }}>
              AI-powered Montessori guidance, curriculum planning, and child development tracking — grounded in decades of Foundation expertise.
            </p>

            <div className="flex flex-col sm:flex-row gap-3" style={{ animation: 'fadeUp 0.8s ease 0.45s both' }}>
              <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-white font-semibold rounded-full text-[0.95rem] transition hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #4a2c82 100%)', boxShadow: '0 4px 24px rgba(74,108,247,0.25)' }}>
                Begin Your Journey →
              </Link>
              <a href="#features" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-white/70 font-medium rounded-full text-[0.95rem] border border-white/15 hover:text-white hover:border-white/35 hover:bg-white/5 transition">
                See How It Works
              </a>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hidden sm:flex" style={{ animation: 'fadeUp 0.8s ease 0.8s both' }}>
            <span className="text-[0.65rem] text-white/30 tracking-widest uppercase">Explore</span>
            <div className="w-px h-10" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)', animation: 'scrollPulse 2s ease infinite' }} />
          </div>
        </section>

        {/* ====== PHILOSOPHY ====== */}
        <section className="py-16 px-6 text-center" style={{ background: '#1a0e2e', borderBottom: '1px solid rgba(196,177,224,0.08)' }}>
          <blockquote className="serif text-[clamp(1.3rem,2.5vw,1.8rem)] italic font-normal text-[#c4b1e0] max-w-[700px] mx-auto leading-relaxed">
            &ldquo;The greatest gifts we can give our children are the roots of responsibility and the wings of independence.&rdquo;
            <cite className="block mt-4 not-italic text-sm text-[#8a7ba3] tracking-wider" style={{ fontFamily: 'DM Sans, sans-serif' }}>— Maria Montessori</cite>
          </blockquote>
        </section>

        {/* ====== THE PROBLEM ====== */}
        <section className="py-24 px-6 max-w-[1100px] mx-auto">
          <div className="reveal">
            <div className="text-xs font-semibold tracking-[0.15em] uppercase text-[#7b5ea7] mb-3">The Challenge</div>
            <h2 className="serif text-[clamp(2rem,4vw,3rem)] font-normal text-[#1a0e2e] leading-[1.2] max-w-[600px] mb-5">
              Parenting today is <em className="text-[#4a2c82]">noisy</em>. Montessori shouldn&apos;t be.
            </h2>
            <p className="text-base text-[#5c4a7e] leading-relaxed max-w-[600px]">
              Parents are overwhelmed with conflicting information, inconsistent online advice, and anxiety around every decision. Montessori Navigator cuts through the noise with clarity grounded in philosophy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
            {[
              { icon: '🌀', title: 'Information overload', desc: 'Thousands of blog posts, Instagram accounts, and Facebook groups — most inconsistent, many inaccurate. Parents deserve a single trusted source.' },
              { icon: '🔍', title: 'School confusion', desc: "Choosing a Montessori school means navigating credentials, philosophies, and authenticity. Without guidance, families can't tell the difference." },
              { icon: '🏠', title: 'Home implementation gap', desc: "Parents believe in Montessori but don't know how to extend it home. The bridge between classroom and kitchen table doesn't exist — until now." },
              { icon: '📊', title: 'Development anxiety', desc: 'Is my child on track? Am I doing enough? Without a framework for observation, every milestone becomes a source of worry.' },
            ].map((card, i) => (
              <div key={i} className="reveal p-6 bg-white border border-[#2d1b4e]/[0.06] rounded-2xl hover:border-[#4a2c82]/[0.12] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4" style={{ background: 'linear-gradient(135deg, #ede7f6 0%, #f8f5ff 100%)' }}>{card.icon}</div>
                <h3 className="serif text-xl font-semibold text-[#1a0e2e] mb-2">{card.title}</h3>
                <p className="text-sm text-[#5c4a7e] leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ====== FEATURES ====== */}
        <section id="features" className="py-24 px-6" style={{ background: 'linear-gradient(180deg, #f8f5ff 0%, white 100%)' }}>
          <div className="max-w-[1100px] mx-auto">
            <div className="text-center mb-16 reveal">
              <div className="text-xs font-semibold tracking-[0.15em] uppercase text-[#7b5ea7] mb-3">What Navigator Does</div>
              <h2 className="serif text-[clamp(2rem,4vw,3rem)] font-normal text-[#1a0e2e] leading-[1.2] max-w-[700px] mx-auto">
                Everything a Montessori parent needs, <em className="text-[#4a2c82]">nothing they don&apos;t</em>
              </h2>
            </div>

            {/* Feature 1 */}
            <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-20">
              <div>
                <div className="serif text-sm font-semibold text-[#8b9cf7] mb-3 tracking-wider">01</div>
                <h3 className="serif text-[clamp(1.6rem,3vw,2.2rem)] font-medium text-[#1a0e2e] leading-[1.2] mb-4">Your personal Montessori guide</h3>
                <p className="text-[0.95rem] text-[#5c4a7e] leading-relaxed mb-3">An AI assistant grounded in Foundation-approved principles that knows your family, your children, and your journey. Ask anything — from discipline approaches to curriculum questions.</p>
                <p className="text-[0.95rem] text-[#5c4a7e] leading-relaxed mb-4">It remembers your child&apos;s developmental stage, recent observations, and your parenting style. Every conversation builds on the last.</p>
                <div className="flex flex-wrap gap-2">
                  {['Personalized', 'Philosophy-grounded', 'Memory-aware'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-[#ede7f6] text-[#4a2c82] text-xs font-semibold rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl p-7 min-h-[340px] flex flex-col justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2d1b4e 0%, #0f1a3c 100%)' }}>
                <div className="relative z-10 space-y-3">
                  <div className="bg-[#4a6cf7]/25 text-white/90 text-sm leading-relaxed px-4 py-3 rounded-2xl rounded-br-sm max-w-[85%] ml-auto">
                    My 4-year-old won&apos;t clean up after activities. I&apos;ve tried everything.
                  </div>
                  <div className="bg-white/[0.08] text-white/75 text-sm leading-relaxed px-4 py-3 rounded-2xl rounded-bl-sm max-w-[85%]">
                    This is so common at this age, and it&apos;s actually a sign of healthy development. At four, children are deeply engaged in their work and transitions feel like interruptions. Instead of asking for a full cleanup, try working alongside her...
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-20 direction-rtl">
              <div className="md:order-2">
                <div className="serif text-sm font-semibold text-[#8b9cf7] mb-3 tracking-wider">02</div>
                <h3 className="serif text-[clamp(1.6rem,3vw,2.2rem)] font-medium text-[#1a0e2e] leading-[1.2] mb-4">See the whole child</h3>
                <p className="text-[0.95rem] text-[#5c4a7e] leading-relaxed mb-3">Track development across every Montessori curriculum area. Log observations, celebrate milestones, and watch your child&apos;s unique journey unfold.</p>
                <p className="text-[0.95rem] text-[#5c4a7e] leading-relaxed mb-4">The AI connects your observations to suggest what to work on next, spot emerging sensitive periods, and reassure you that your child is on their own perfect path.</p>
                <div className="flex flex-wrap gap-2">
                  {['10 curriculum areas', 'Observation logging', 'Progress reports'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-[#ede7f6] text-[#4a2c82] text-xs font-semibold rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="md:order-1 rounded-2xl p-7 min-h-[340px] flex flex-col justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2d1b4e 0%, #0f1a3c 100%)' }}>
                <div className="relative z-10 space-y-3">
                  {[
                    { label: 'Practical Life', level: 'Proficient', pct: '80%' },
                    { label: 'Sensorial', level: 'Practicing', pct: '60%' },
                    { label: 'Language', level: 'Developing', pct: '45%' },
                    { label: 'Mathematics', level: 'Emerging', pct: '25%' },
                    { label: 'Social-Emotional', level: 'Practicing', pct: '65%' },
                  ].map((bar, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs text-white/50 mb-1">
                        <span>{bar.label}</span>
                        <span className="text-[#8b9cf7]">{bar.level}</span>
                      </div>
                      <div className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: bar.pct, background: 'linear-gradient(90deg, #8b9cf7, #4a6cf7)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="serif text-sm font-semibold text-[#8b9cf7] mb-3 tracking-wider">03</div>
                <h3 className="serif text-[clamp(1.6rem,3vw,2.2rem)] font-medium text-[#1a0e2e] leading-[1.2] mb-4">Plans that follow the child</h3>
                <p className="text-[0.95rem] text-[#5c4a7e] leading-relaxed mb-3">Generate personalized learning plans — daily, weekly, or focused deep-dives — based on your child&apos;s developmental stage, interests, and the materials you have at home.</p>
                <p className="text-[0.95rem] text-[#5c4a7e] leading-relaxed mb-4">Each activity includes step-by-step presentation guidance, what to observe for, and extensions when your child is ready to go further.</p>
                <div className="flex flex-wrap gap-2">
                  {['Daily & weekly plans', 'Material-aware', 'Presentation steps'].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-[#ede7f6] text-[#4a2c82] text-xs font-semibold rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl p-7 min-h-[340px] flex flex-col justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2d1b4e 0%, #0f1a3c 100%)' }}>
                <div className="relative z-10">
                  <div className="text-xs text-[#8b9cf7] font-semibold tracking-widest uppercase mb-4">Tuesday — Practical Life Focus</div>
                  {[
                    { time: '9:00 AM · 15 MIN', title: 'Water Pouring with Pitcher', area: 'Practical Life · Fine Motor' },
                    { time: '9:30 AM · 20 MIN', title: 'Sandpaper Letter Tracing: M, A, T', area: 'Language · Sensorial' },
                    { time: '10:00 AM · 15 MIN', title: 'Sorting Buttons by Color & Size', area: 'Sensorial · Mathematics' },
                    { time: '10:30 AM · FREE CHOICE', title: 'Independent Work Cycle', area: 'Child-directed' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-white/[0.06] border border-white/[0.06] rounded-xl mb-2">
                      <div className="text-[0.65rem] text-[#8b9cf7] font-semibold tracking-wider mb-0.5">{item.time}</div>
                      <div className="text-sm text-white/85 font-medium">{item.title}</div>
                      <div className="text-xs text-white/40 mt-0.5">{item.area}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====== WHO IT'S FOR ====== */}
        <section id="who" className="py-24 px-6 max-w-[1100px] mx-auto">
          <div className="reveal">
            <div className="text-xs font-semibold tracking-[0.15em] uppercase text-[#7b5ea7] mb-3">Who It&apos;s For</div>
            <h2 className="serif text-[clamp(2rem,4vw,3rem)] font-normal text-[#1a0e2e] leading-[1.2] max-w-[600px] mb-10">
              Built for families who believe in <em className="text-[#4a2c82]">intentional</em> childhood
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: '🏡', title: 'Homeschooling Families', desc: 'Your primary curriculum partner. Scope and sequence planning, daily learning plans, developmental tracking, and an AI guide that knows Montessori pedagogy inside and out.' },
              { icon: '🌿', title: 'Montessori School Parents', desc: "Extend the classroom home. Understand what your child is learning, support it with aligned activities, and speak the same language as your child's teachers." },
              { icon: '🔭', title: 'Montessori-Curious Families', desc: 'Exploring Montessori for the first time? Navigator meets you where you are — with school evaluation tools, gentle guidance, and a foundation of understanding.' },
            ].map((card, i) => (
              <div key={i} className="reveal p-8 rounded-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0e2e 0%, #2d1b4e 100%)' }}>
                <span className="text-3xl mb-4 block relative z-10">{card.icon}</span>
                <h3 className="serif text-2xl font-medium text-white mb-3 relative z-10">{card.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed relative z-10">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ====== FOR SCHOOLS ====== */}
        <section id="schools" className="py-24 px-6 bg-[#f8f5ff]">
          <div className="max-w-[900px] mx-auto text-center">
            <div className="reveal">
              <div className="text-xs font-semibold tracking-[0.15em] uppercase text-[#7b5ea7] mb-3">For Schools</div>
              <h2 className="serif text-[clamp(2rem,4vw,3rem)] font-normal text-[#1a0e2e] leading-[1.2] max-w-[700px] mx-auto mb-4">
                Navigator <em className="text-[#4a2c82]">supports</em> schools. It never replaces them.
              </h2>
              <p className="text-base text-[#5c4a7e] leading-relaxed max-w-[550px] mx-auto">
                Licensed schools provide Navigator to their parent community — reducing confusion, strengthening alignment, and extending their educational mission without increasing staff workload.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 text-left">
              {[
                { title: 'Consistent messaging', desc: "Parents receive guidance aligned with your school's philosophy, not random internet advice." },
                { title: 'Streamlined onboarding', desc: 'New families understand Montessori principles before their first day, not six months later.' },
                { title: 'Reduced staff burden', desc: 'Fewer repetitive parent questions. More time for what teachers do best.' },
                { title: 'Privacy-first design', desc: 'Schools see engagement metrics, never individual family data or conversations.' },
              ].map((item, i) => (
                <div key={i} className="reveal p-5 bg-white rounded-xl border border-[#2d1b4e]/5">
                  <h4 className="font-semibold text-[#1a0e2e] text-[0.95rem] mb-1">{item.title}</h4>
                  <p className="text-sm text-[#5c4a7e] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== FINAL CTA ====== */}
        <section className="py-28 px-6 text-center relative overflow-hidden" style={{ background: 'linear-gradient(165deg, #1a0e2e 0%, #0f1a3c 50%, #1a2d6d 100%)' }}>
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '200px' }} />
          <h2 className="serif text-[clamp(2.2rem,4.5vw,3.5rem)] font-normal text-white leading-[1.15] max-w-[650px] mx-auto mb-5 relative z-10">
            The environment shapes the child.<br/><em className="text-[#c4b1e0]">Let&apos;s shape the environment.</em>
          </h2>
          <p className="text-lg text-white/40 max-w-[450px] mx-auto mb-8 leading-relaxed relative z-10">
            Join families who are bringing intentionality to every part of their child&apos;s world.
          </p>
          <Link href="/auth/signup" className="relative z-10 inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-full text-lg transition hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #4a2c82 100%)', boxShadow: '0 4px 24px rgba(74,108,247,0.25)' }}>
            Start Using Navigator →
          </Link>
        </section>

        {/* ====== FOOTER ====== */}
        <footer className="py-10 px-6" style={{ background: '#1a0e2e', borderTop: '1px solid rgba(196,177,224,0.06)' }}>
          <div className="max-w-[1100px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="serif text-lg font-semibold text-white/60">Montessori Navigator™</div>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Contact', 'For Schools'].map(link => (
                <a key={link} href="#" className="text-sm text-white/30 hover:text-white/60 transition">{link}</a>
              ))}
            </div>
          </div>
          <div className="text-xs text-white/20 text-center mt-6 max-w-[1100px] mx-auto">
            A product of the Montessori Foundation. Built with the same intentionality we bring to the children.
          </div>
        </footer>
      </div>
    </>
  )
}
