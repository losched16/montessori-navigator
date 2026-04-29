'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Logo from '@/components/ui/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Honor an explicit ?next= override (e.g. invite flows)
    const params = new URLSearchParams(window.location.search)
    const next = params.get('next')
    if (next) {
      router.push(next)
      return
    }

    // Route based on roles: parent goes to /dashboard, staff-only goes to /school
    const userId = signInData.user?.id
    if (userId) {
      const [{ data: parentRow }, { data: staffRow }] = await Promise.all([
        supabase.from('parents').select('id').eq('user_id', userId).maybeSingle(),
        supabase.from('school_staff').select('school_id').eq('user_id', userId).limit(1).maybeSingle(),
      ])

      // Both → /dashboard (parent default; switcher chip in chrome lets them flip)
      // Parent only → /dashboard
      // Staff only → /school
      // Neither → /onboarding (existing fallback)
      if (parentRow) {
        router.push('/dashboard')
        return
      }
      if (staffRow) {
        router.push('/school')
        return
      }
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3"><Logo href="/" imgClassName="h-10 w-auto" /></div>
          <p className="text-warm-600 italic">A Prepared Environment for Parents</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-navy-600 mb-6">Welcome back</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
                placeholder="you@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
                placeholder="Your password"
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            <Link href="/auth/forgot-password" className="text-warm-600 hover:text-warm-700 font-medium">
              Forgot your password?
            </Link>
          </p>

          <p className="text-center text-sm text-gray-500 mt-6">
            New to Family Alliance?{' '}
            <Link href="/pricing" className="text-warm-600 hover:text-warm-600 font-medium">
              Choose a plan to get started
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
