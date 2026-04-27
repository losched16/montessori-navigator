'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function SchoolWelcomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafaf8]" />}>
      <SchoolWelcomePageInner />
    </Suspense>
  )
}

function SchoolWelcomePageInner() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const signupHref = sessionId
    ? `/auth/signup/school?session_id=${encodeURIComponent(sessionId)}`
    : '/auth/signup/school'

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Header */}
      <header className="bg-navy-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold">Montessori Family Alliance</Link>
          <Link href="/auth/login" className="text-sm text-white/70 hover:text-white">Log in</Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="text-5xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-navy-700 mb-3">
          Welcome to Montessori Family Alliance!
        </h1>
        <p className="text-lg text-navy-600/70 mb-8">
          Your subscription is confirmed. Let&apos;s get your school set up so families can start using the platform.
        </p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 sm:px-8 py-8 text-left space-y-6">
          <h2 className="text-lg font-bold text-navy-700">Next Steps</h2>

          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-warm-100 text-warm-600 flex items-center justify-center font-bold text-sm shrink-0">1</div>
              <div>
                <h3 className="font-medium text-navy-700">Create your admin account</h3>
                <p className="text-sm text-navy-600/60 mt-0.5">Sign up with the email you used for billing. You&apos;ll automatically be linked as the school admin.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-warm-100 text-warm-600 flex items-center justify-center font-bold text-sm shrink-0">2</div>
              <div>
                <h3 className="font-medium text-navy-700">Set up your school profile</h3>
                <p className="text-sm text-navy-600/60 mt-0.5">Add your school name, logo, and credentials from the school dashboard.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-warm-100 text-warm-600 flex items-center justify-center font-bold text-sm shrink-0">3</div>
              <div>
                <h3 className="font-medium text-navy-700">Invite your families</h3>
                <p className="text-sm text-navy-600/60 mt-0.5">Share your unique school link or upload a CSV of parent emails. Families will receive an invitation to create their accounts.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={signupHref}
            className="bg-warm-500 hover:bg-warm-600 text-white font-semibold px-8 py-3.5 rounded-xl transition text-center"
          >
            Create Your Account
          </Link>
          <Link
            href="/auth/login"
            className="border border-gray-200 text-navy-600 font-medium px-8 py-3.5 rounded-xl hover:bg-gray-50 transition text-center"
          >
            Already have an account? Log in
          </Link>
        </div>
      </main>
    </div>
  )
}
