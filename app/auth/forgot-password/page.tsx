'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } catch {
      // Even if the request errors, show the same success state — no
      // account enumeration via the UI either.
    }
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3"><Logo href="/" imgClassName="h-10 w-auto" /></div>
          <p className="text-warm-600 italic">A Prepared Environment for Parents</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {submitted ? (
            <div className="text-center">
              <div className="text-4xl mb-3">📧</div>
              <h2 className="text-xl font-semibold text-navy-600 mb-2">Check your email</h2>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                If an account exists for <strong>{email}</strong>, a reset link is on its way — it usually arrives within a few minutes. The link expires in 1 hour.
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Didn&apos;t receive it? Check your spam folder, make sure you used the email you signed up with, or{' '}
                <button
                  onClick={() => { setSubmitted(false); setEmail('') }}
                  className="text-warm-600 hover:underline font-medium"
                >
                  try again
                </button>
                .
              </p>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link href="/auth/login" className="text-warm-600 hover:text-warm-700 text-sm font-medium">
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-navy-600 mb-2">Forgot your password?</h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter your email and we&apos;ll send you a link to reset it.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
                    placeholder="you@email.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-warm-500 hover:bg-warm-600 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-6">
                Remembered your password?{' '}
                <Link href="/auth/login" className="text-warm-600 hover:text-warm-700 font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
