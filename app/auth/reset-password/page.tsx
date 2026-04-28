'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Logo from '@/components/ui/Logo'

// Landing page from the password reset email. When the user clicks the
// recovery link in their email, Supabase exchanges the token for a session
// and lands them here, where they can set a new password.
export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  // The recovery link can land here in one of three ways:
  //   1. PKCE flow: ?code=XXX  → call exchangeCodeForSession
  //   2. Implicit flow: #access_token=XXX&refresh_token=YYY&type=recovery
  //      → manually set the session
  //   3. Already-authenticated session (e.g. admin.generateLink return)
  //      → just read from getSession()
  // Try them in order; the first that works wins.
  useEffect(() => {
    let cancelled = false
    const exchange = async () => {
      try {
        // Path 1: PKCE — code in query string
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        if (code) {
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(code)
          if (exErr) console.warn('exchangeCodeForSession:', exErr.message)
          // Strip the code from the URL so a refresh doesn't try to re-use it
          window.history.replaceState({}, '', window.location.pathname)
        } else {
          // Path 2: implicit — tokens in hash
          const hash = window.location.hash.startsWith('#')
            ? window.location.hash.substring(1)
            : window.location.hash
          if (hash) {
            const hashParams = new URLSearchParams(hash)
            const accessToken = hashParams.get('access_token')
            const refreshToken = hashParams.get('refresh_token')
            if (accessToken && refreshToken) {
              await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
              window.history.replaceState({}, '', window.location.pathname)
            }
          }
        }
      } catch (err) {
        console.warn('Reset session bootstrap error:', err)
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      setHasSession(!!session)
      setAuthReady(true)
    }
    exchange()
    return () => { cancelled = true }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error: updateErr } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateErr) {
      setError(updateErr.message)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="text-navy-600 text-sm">Loading…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3"><Logo href="/" imgClassName="h-10 w-auto" /></div>
          <p className="text-warm-600 italic">A Prepared Environment for Parents</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {!hasSession ? (
            <div className="text-center">
              <div className="text-4xl mb-3">⌛</div>
              <h2 className="text-xl font-semibold text-navy-600 mb-2">Reset link expired or invalid</h2>
              <p className="text-sm text-gray-600 mb-6">
                Password reset links work for 1 hour and only once. Request a new one to continue.
              </p>
              <Link href="/auth/forgot-password" className="inline-block bg-warm-500 hover:bg-warm-600 text-white font-medium px-5 py-2.5 rounded-lg transition">
                Send New Reset Link
              </Link>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="text-4xl mb-3">✓</div>
              <h2 className="text-xl font-semibold text-navy-600 mb-2">Password updated</h2>
              <p className="text-sm text-gray-600">Redirecting to your dashboard…</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-navy-600 mb-2">Set a new password</h2>
              <p className="text-gray-500 text-sm mb-6">Pick something at least 6 characters long.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-warm-500 hover:bg-warm-600 text-white font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
