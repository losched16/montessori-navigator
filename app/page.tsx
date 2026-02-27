'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import MarketingPage from '@/components/MarketingPage'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setAuthenticated(true)
        router.push('/dashboard')
      } else {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  if (loading && !authenticated) {
    return (
      <div className="min-h-screen bg-[#1a0e2e] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>Montessori Navigator</h1>
          <p className="text-white/40">Loading...</p>
        </div>
      </div>
    )
  }

  if (authenticated) return null

  return <MarketingPage />
}
