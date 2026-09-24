import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { requireStudioUser } from '@/lib/content-studio/server'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Content Studio — Montessori Family Alliance',
  robots: { index: false, follow: false },
}

// Private to super admins. The gate runs server-side before anything renders;
// each page and API route re-checks on its own as well.
export default async function ContentStudioLayout({ children }: { children: React.ReactNode }) {
  await requireStudioUser('/content-studio')

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo href="/content-studio" imgClassName="h-8 w-auto" />
            <span className="hidden sm:inline text-gray-300">·</span>
            <span className="hidden sm:inline text-xs font-bold tracking-widest uppercase text-warm-600">
              Content Studio
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/admin" className="text-xs font-medium text-navy-600 hover:text-navy-700 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              Admin portal
            </Link>
            <Link href="/dashboard" className="hidden sm:inline-flex text-xs font-medium text-navy-600 hover:text-navy-700 px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              ← Back to app
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">{children}</main>
    </div>
  )
}
