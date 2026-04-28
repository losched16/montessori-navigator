'use client'

import Link from 'next/link'
import Logo from '@/components/ui/Logo'

// Audience chooser — visitors who hit "Get Started" without context
// pick their path here, then land on the right pricing page.
export default function GetStartedPage() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap');
        .gs-page { font-family: 'DM Sans', sans-serif; color: #1a0e2e; }
        .gs-page .serif { font-family: 'Cormorant Garamond', serif; }
      `}</style>

      <div className="gs-page bg-[#fafaf8] min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <nav className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            <Logo variant="dark" href="/" imgClassName="h-9 sm:h-10 w-auto" />
            <Link href="/auth/login" className="text-sm text-[#5c4a7e] hover:text-[#1a0e2e] font-medium">Log in</Link>
          </nav>
        </header>

        {/* Main */}
        <main className="flex-1 flex items-center px-6 py-12 sm:py-20">
          <div className="max-w-[960px] mx-auto w-full">
            <div className="text-center mb-12 sm:mb-16">
              <div className="text-[11px] tracking-[0.15em] uppercase text-[#7b5ea7] font-semibold mb-3">Get Started</div>
              <h1 className="serif text-[clamp(2rem,4vw,3rem)] font-normal text-[#1a0e2e] leading-tight max-w-[680px] mx-auto mb-3">
                Which best describes <em className="text-[#4a2c82] italic">you</em>?
              </h1>
              <p className="text-[#5c4a7e] max-w-[560px] mx-auto leading-relaxed">
                Choose the path that fits, and we&apos;ll show you the right plan.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Parent */}
              <Link href="/pricing" className="group bg-white border border-gray-200 rounded-3xl p-9 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[#4a2c82] flex flex-col">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
                  style={{ background: 'linear-gradient(135deg, #ede7f6 0%, #d4cae6 100%)' }}>
                  👨‍👩‍👧
                </div>
                <div className="text-[11px] font-bold tracking-widest uppercase text-[#7b5ea7] mb-2">I&apos;m a Parent</div>
                <h2 className="serif text-[1.65rem] font-medium text-[#1a0e2e] leading-tight mb-3">
                  Get started as a family
                </h2>
                <p className="text-[0.95rem] text-[#5c4a7e] leading-relaxed mb-6 flex-1">
                  $8/month or $59/year — start with a 7-day free trial. Cancel anytime.
                </p>
                <div className="inline-flex items-center gap-2 text-[#4a2c82] font-semibold text-sm">
                  See Parent Plans <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>

              {/* School */}
              <Link href="/for-schools/pricing" className="group bg-white border border-gray-200 rounded-3xl p-9 transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[#2e8b8b] flex flex-col">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-5"
                  style={{ background: 'linear-gradient(135deg, #d4f0f0 0%, #b8e0e0 100%)' }}>
                  🏫
                </div>
                <div className="text-[11px] font-bold tracking-widest uppercase text-[#2e8b8b] mb-2">I&apos;m with a School</div>
                <h2 className="serif text-[1.65rem] font-medium text-[#1a0e2e] leading-tight mb-3">
                  Get started for our school
                </h2>
                <p className="text-[0.95rem] text-[#5c4a7e] leading-relaxed mb-6 flex-1">
                  $12/family/year (10-family minimum) — 14-day free trial for the whole school.
                </p>
                <div className="inline-flex items-center gap-2 text-[#2e8b8b] font-semibold text-sm">
                  See School Pricing <span className="transition-transform group-hover:translate-x-1">→</span>
                </div>
              </Link>
            </div>

            <div className="text-center mt-12 text-sm text-[#5c4a7e]/70">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-[#4a2c82] hover:underline font-medium">Sign in</Link>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
