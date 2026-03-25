'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function SchoolSettingsPage() {
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [phone, setPhone] = useState('')
  const [credentials, setCredentials] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: staff } = await supabase
        .from('school_staff')
        .select('school_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!staff) return

      const { data: school } = await supabase
        .from('schools')
        .select('*')
        .eq('id', staff.school_id)
        .single()

      if (school) {
        setSchoolId(school.id)
        setName(school.name || '')
        setAddress(school.address || '')
        setWebsite(school.website || '')
        setPhone(school.phone || '')
        setCredentials(school.credentials || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  const save = async () => {
    if (!schoolId) return
    setSaving(true)
    setSaved(false)

    await supabase
      .from('schools')
      .update({
        name: name.trim(),
        address: address.trim() || null,
        website: website.trim() || null,
        phone: phone.trim() || null,
        credentials: credentials || null,
      })
      .eq('id', schoolId)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) {
    return <div className="text-navy-600 py-8 text-center">Loading...</div>
  }

  return (
    <div className="max-w-2xl pb-20 sm:pb-0">
      <h1 className="text-xl font-bold text-navy-600 mb-6">School Settings</h1>

      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="font-semibold text-navy-600 mb-4">School Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">School name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
              placeholder="123 Main St, City, State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">Website</label>
            <input
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
              placeholder="https://yourschool.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-600 mb-1">Accreditation / Credentials</label>
            <select
              value={credentials}
              onChange={e => setCredentials(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
            >
              <option value="">Select...</option>
              <option value="AMI">AMI (Association Montessori Internationale)</option>
              <option value="AMS">AMS (American Montessori Society)</option>
              <option value="MACTE">MACTE (Montessori Accreditation Council)</option>
              <option value="IMC">IMC (International Montessori Council)</option>
              <option value="other">Other</option>
            </select>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="w-full py-2.5 bg-warm-500 hover:bg-warm-600 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
