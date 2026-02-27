import Link from 'next/link'

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100 sticky top-0 bg-white z-30">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-[#1a0e2e]" style={{ fontFamily: 'Georgia, serif' }}>
            Montessori <span className="text-[#7b5ea7] font-normal">Navigator</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/assessment" className="hidden sm:inline text-sm text-gray-500 hover:text-gray-700">Free Assessment</Link>
            <Link href="/guides" className="hidden sm:inline text-sm text-gray-500 hover:text-gray-700">Guides</Link>
            <Link href="/auth/signup" className="text-sm font-medium text-white bg-[#4a2c82] hover:bg-[#3d2470] px-4 py-1.5 rounded-full transition">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {children}

      {/* CTA Footer */}
      <section className="py-16 px-6 text-center" style={{ background: 'linear-gradient(165deg, #1a0e2e 0%, #2d1b4e 100%)' }}>
        <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>
          Ready for personalized guidance?
        </h2>
        <p className="text-white/50 text-sm max-w-md mx-auto mb-6">
          Montessori Navigator gives you an AI guide that knows your child, your journey, and the Montessori philosophy inside and out.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/assessment" className="px-5 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-medium rounded-full hover:bg-white/20 transition">
            Take Free Assessment
          </Link>
          <Link href="/auth/signup" className="px-5 py-2.5 text-white text-sm font-medium rounded-full transition" style={{ background: 'linear-gradient(135deg, #4a6cf7 0%, #4a2c82 100%)' }}>
            Start Using Navigator →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-[#1a0e2e] border-t border-white/5">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-white/30" style={{ fontFamily: 'Georgia, serif' }}>Montessori Navigator™</div>
          <div className="flex gap-6">
            <Link href="/guides" className="text-xs text-white/30 hover:text-white/50">All Guides</Link>
            <Link href="/assessment" className="text-xs text-white/30 hover:text-white/50">Readiness Assessment</Link>
            <Link href="/" className="text-xs text-white/30 hover:text-white/50">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
