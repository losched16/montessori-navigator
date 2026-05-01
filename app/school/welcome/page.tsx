'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

// First-login welcome page for school admins.
//
// We render this once (gated by schools.onboarding_state.welcomed_at). The
// goal is orientation, not action — we tell them WHY this matters, WHAT to
// do, and HOW to get the most out of it. The actual checklist lives on the
// dashboard so they can keep referring back to it.
//
// Tone is intentionally philosophical and warm. Foundation positioning, not
// generic SaaS onboarding.

export default function SchoolWelcomePage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState<string>('')
  const [continuing, setContinuing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const meta = (user.user_metadata as any) || {}
      const candidate =
        meta.first_name ||
        (typeof meta.full_name === 'string' ? meta.full_name.split(' ')[0] : '') ||
        (user.email ? user.email.split('@')[0].split('.')[0] : '')
      // Capitalize first letter, keep rest as-is
      const pretty = candidate
        ? candidate.charAt(0).toUpperCase() + candidate.slice(1)
        : ''
      setFirstName(pretty)
    }
    load()
  }, [])

  const continueToChecklist = async () => {
    setContinuing(true)
    try {
      // Fire-and-mostly-forget: even if this errors we don't want to trap
      // them on the welcome page. Worst case they see it twice.
      await fetch('/api/school/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'welcome' }),
      })
    } catch {}
    router.push('/school')
  }

  return (
    <div className="max-w-3xl pb-12">
      {/* Greeting */}
      <div
        className="rounded-3xl p-8 sm:p-10 mb-8 text-white relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #1a0e2e 0%, #2d1b4e 50%, #4a2c82 100%)',
        }}
      >
        <div
          aria-hidden
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #c4b1e0 0%, transparent 70%)' }}
        />
        <div className="text-[10px] tracking-[0.18em] uppercase font-semibold text-[#c4b1e0] mb-3">
          From The Montessori Foundation
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal leading-tight mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          Welcome to Family Alliance{firstName ? `, ${firstName}` : ''}.
        </h1>
        <p className="text-[#e9e2f5] text-base leading-relaxed max-w-2xl">
          You&apos;ve just opened a new door for your families. Family Alliance is built
          on the same philosophy that guides your classrooms — and it brings that wisdom
          into the rest of a Montessori family&apos;s day, every day.
        </p>
      </div>

      {/* Why this matters */}
      <section className="mb-10">
        <h2 className="text-xs font-bold tracking-widest uppercase text-warm-600 mb-3">
          Why this matters
        </h2>
        <p className="text-navy-700 text-base leading-relaxed mb-3">
          Schools that use Family Alliance well don&apos;t just retain more families.
          They build communities where parents become real partners — observing their
          child&apos;s development the same way teachers do, asking better questions at
          conferences, and trusting your guidance more deeply because they finally
          understand it.
        </p>
        <p className="text-navy-700 text-base leading-relaxed">
          That doesn&apos;t happen because the platform is clever. It happens because
          you bring it into your community on purpose. The next sections are how to do
          that well.
        </p>
      </section>

      {/* Path */}
      <section className="mb-10">
        <h2 className="text-xs font-bold tracking-widest uppercase text-warm-600 mb-4">
          Your first 30 days, simplified
        </h2>

        <div className="space-y-3">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-warm-50 flex items-center justify-center text-xl">
              📘
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-warm-600 mb-1">
                This week · 15 minutes
              </div>
              <h3 className="font-semibold text-navy-700 mb-1">Get familiar</h3>
              <p className="text-sm text-navy-600/80 leading-relaxed">
                Read the <strong>New Family Onboarding Playbook</strong>. It&apos;s a real example
                of what excellent onboarding looks like at a Montessori school. Borrow what fits,
                ignore what doesn&apos;t.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl">
              📒
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-amber-700 mb-1">
                Next · 1 hour with your team
              </div>
              <h3 className="font-semibold text-navy-700 mb-1">Make it yours</h3>
              <p className="text-sm text-navy-600/80 leading-relaxed">
                Use the <strong>Family Onboarding Workbook</strong> with your leadership team to
                design your school&apos;s version. Don&apos;t aim for perfect — aim for
                <em> yours</em>. Your families know the difference.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
              ✉️
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 mb-1">
                Then · Start small
              </div>
              <h3 className="font-semibold text-navy-700 mb-1">Invite your first family</h3>
              <p className="text-sm text-navy-600/80 leading-relaxed">
                To yourself, a teacher, a board member, or one family who would love to test it.
                Watch what they experience. Adjust before you scale to your whole community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trial limits */}
      <section className="mb-10">
        <div className="bg-warm-50 border border-warm-200 rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-2">
            <span className="text-xl">🎟️</span>
            <h3 className="font-semibold text-navy-700">During your free trial</h3>
          </div>
          <p className="text-sm text-navy-700 leading-relaxed mb-2">
            You can have up to <strong>3 active members</strong> at once — admins or families
            who&apos;ve actually joined. <strong>Pending invitations don&apos;t count</strong>,
            so you can send invites freely; only people who accept consume a seat. This keeps
            the trial focused on letting your team experience the platform together.
          </p>
          <p className="text-sm text-navy-700 leading-relaxed">
            <strong>The moment you upgrade to a paid plan, that cap lifts entirely.</strong>{' '}
            Invite every family in your school — no per-invite limits, no surprises.
          </p>
        </div>
      </section>

      {/* Parent view */}
      <section className="mb-10">
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-2">
            <span className="text-xl">👨‍👩‍👧</span>
            <h3 className="font-semibold text-navy-700">
              Want to see what your families experience?
            </h3>
          </div>
          <p className="text-sm text-navy-700 leading-relaxed mb-3">
            Many of our school admins are Montessori parents themselves. Set up a parent
            account using the same email and you&apos;ll see a{' '}
            <strong>&quot;Switch to Parent View&quot;</strong> chip appear in your header —
            flip between your admin dashboard and the family experience anytime. It&apos;s the
            best way to support your families: feel what they feel.
          </p>
          <Link
            href="/school/become-parent"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-warm-600 hover:text-warm-700"
          >
            Set up your parent view →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <button
          onClick={continueToChecklist}
          disabled={continuing}
          className="w-full sm:w-auto px-6 py-3 bg-warm-500 hover:bg-warm-600 text-white font-medium rounded-lg transition disabled:opacity-50 text-sm"
        >
          {continuing ? 'Loading…' : 'Take me to my dashboard →'}
        </button>
        <p className="text-xs text-navy-600/60">
          Your setup checklist will be waiting there. It updates automatically as you go.
        </p>
      </div>
    </div>
  )
}
