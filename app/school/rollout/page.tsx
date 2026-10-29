'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

// "Roll out to your families" — a step-by-step guide for school admins.
// Live numbers come from /api/school/rollout (scoped to the admin's school);
// everything else is guidance that matches how the product actually works.

interface Stats {
  schoolName: string
  slug: string
  families: number
  staffBuffer: number
  isTrial: boolean
  seatLimit: number | null
  seatsUsed: number
  joined: number
  invited: number
  waiting: number
  goal: number
}

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 text-sm font-medium px-4 py-2 rounded-lg bg-warm-500 hover:bg-warm-600 text-white transition"
    >
      {copied ? 'Copied ✓' : label}
    </button>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="w-8 h-8 rounded-full bg-warm-100 text-warm-700 flex items-center justify-center font-bold text-sm shrink-0">{n}</div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-navy-700 mb-2">{title}</h2>
          <div className="text-sm text-navy-600/90 leading-relaxed space-y-3">{children}</div>
        </div>
      </div>
    </section>
  )
}

export default function RolloutGuidePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
    fetch('/api/school/rollout', { cache: 'no-store' })
      .then(async r => {
        const d = await r.json()
        if (!r.ok) throw new Error(d.error || 'Could not load')
        setStats(d)
      })
      .catch(e => setError(e.message || 'Could not load'))
  }, [])

  const link = stats && origin ? `${origin}/join/${stats.slug}` : ''
  const school = stats?.schoolName || 'our school'

  const subject = `Free access to Montessori Family Alliance, courtesy of ${school}`
  const defaultBody = useMemo(() => `Dear ${school} families,

We're excited to share something new for our community. ${school} now provides every family with a free membership to Montessori Family Alliance, created by The Montessori Foundation. Your school covers the cost, so there is nothing to pay.

What you'll find inside:
• Abigail, an AI guide for your everyday Montessori questions
• A library of articles and webinars on parenting and Montessori at home
• Tools to track your child's development and capture moments you don't want to forget
• At-home ideas that line up with what your child is doing in the classroom

To join (it takes about two minutes):
1. Open ${link || '[your school link]'}
2. Create your account with your email and a password
3. Add your child, and you're in

Have a partner or co-parent? Once you've joined, add them under Settings → Family so you can both follow your child's journey.

Questions? Just reply to this email or stop by the office.

Warmly,
[Your name]
${school}`, [school, link])

  const [body, setBody] = useState('')
  useEffect(() => { setBody(defaultBody) }, [defaultBody])

  if (error) {
    return <div className="max-w-2xl bg-red-50 text-red-700 text-sm p-4 rounded-lg">{error}</div>
  }
  if (!stats) {
    return <div className="text-navy-600 py-8 text-center">Loading…</div>
  }

  const pct = stats.goal > 0 ? Math.min(100, Math.round((stats.joined / stats.goal) * 100)) : 0
  const room = stats.seatLimit

  return (
    <div className="max-w-3xl pb-24 sm:pb-8 space-y-5">
      <div>
        <div className="text-[11px] font-bold tracking-widest uppercase text-warm-600 mb-1">Step by step</div>
        <h1 className="text-2xl font-bold text-navy-700">Roll out to your families</h1>
        <p className="text-sm text-navy-600/80 mt-2 max-w-xl">
          Everything you need to bring your families and your staff into Family Alliance. Most schools finish the first pass in about 15 minutes.
        </p>
      </div>

      {/* Live progress */}
      <section className="bg-white border border-gray-100 rounded-xl p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 className="font-semibold text-navy-700">Where you are today</h2>
          <span className="text-xs text-navy-600/70">
            {stats.isTrial
              ? 'During your trial, up to 3 people can join'
              : room
                ? `Your plan has room for ${room} people: ${stats.families} families plus ${stats.staffBuffer} staff`
                : `Your plan covers ${stats.families} families`}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            [stats.joined, 'joined'],
            [stats.waiting, 'invited, waiting'],
            [stats.invited, 'invited in total'],
          ].map(([n, label]) => (
            <div key={label as string} className="bg-warm-50 rounded-lg py-3">
              <div className="text-2xl font-bold text-navy-700">{n}</div>
              <div className="text-xs text-navy-600/70">{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-navy-600/70 mb-1">
            <span>First goal: {stats.goal} families joined</span>
            <span>{stats.joined} of {stats.goal}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </section>

      <Step n={1} title="Start small, then open it up">
        <p>Invite yourself, a teacher, or one or two families first. Watch what they see and fix anything before you tell your whole community. Then follow the steps below for everyone else.</p>
      </Step>

      <Step n={2} title="Choose how families join">
        <p><strong>Option A — share your school link.</strong> Anyone who opens it can create their account and join your school automatically. It&apos;s the easiest way: put it in a newsletter, your website, or a class email.</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input readOnly value={link} className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50" onFocus={e => e.currentTarget.select()} />
          <CopyButton text={link} label="Copy link" />
        </div>
        <p><strong>Option B — invite by email.</strong> Paste your parents&apos; email addresses (one per line, up to 500 at a time) and each parent gets a personal invitation. Invitations stay valid for 30 days.</p>
        <Link href="/school/invite" className="inline-block text-sm font-medium text-warm-700 hover:text-warm-800">Open Invitations →</Link>
      </Step>

      <Step n={3} title="Tell your parents first">
        <p>A short note from you before the invitation arrives makes a big difference. Families recognize it, trust it, and open it. Here&apos;s one ready to go with your school and link filled in. Edit it however you like, then copy it into your email.</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 text-xs text-navy-600/70">Subject</div>
          <CopyButton text={subject} label="Copy subject" />
        </div>
        <div className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">{subject}</div>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={20}
          className="w-full px-3 py-3 border border-gray-200 rounded-lg text-sm leading-relaxed focus:ring-2 focus:ring-warm-500 focus:border-transparent outline-none"
        />
        <div className="flex justify-end"><CopyButton text={body} label="Copy email" /></div>
      </Step>

      <Step n={4} title="What your families will see">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>They create a free account. Your school covers the cost, and they never see a payment screen.</li>
          <li>They add their child and get Abigail, the library, development tracking, and at-home ideas.</li>
          <li>Their home screen shows that their membership is made possible by your school. Add your logo under <Link href="/school/settings" className="text-warm-700 font-medium">Settings</Link> so they see it.</li>
          <li>Their private information stays private. You see each family&apos;s name, how many children they have, which parents are linked, and when they joined, never their children&apos;s names or notes.</li>
        </ul>
      </Step>

      <Step n={5} title="Spouses and partners">
        <p>Each parent can bring in their partner themselves. After joining, they go to <strong>Settings → Family</strong> and enter their partner&apos;s email. The partner gets an invitation, creates their account from it, and joins the same family so both parents see the same children. Partners use the email address the invitation was sent to.</p>
        <p>You don&apos;t need to invite spouses yourself.</p>
      </Step>

      <Step n={6} title="Your teachers and staff">
        <p>There are two different ways to bring in staff. Pick by what you want the person to be able to do.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="border border-gray-100 rounded-lg p-4 bg-warm-50/50">
            <div className="font-medium text-navy-700 mb-1">To use Family Alliance themselves</div>
            <p>Teachers and staff who want the library, Abigail, and tools for their own families. Invite them exactly like families: share your link, or use <Link href="/school/invite" className="text-warm-700 font-medium">Invitations</Link>.</p>
          </div>
          <div className="border border-gray-100 rounded-lg p-4 bg-warm-50/50">
            <div className="font-medium text-navy-700 mb-1">To help manage your account</div>
            <p>Colleagues who should invite families and see who has joined, like an assistant head or office manager. Go to <Link href="/school/staff" className="text-warm-700 font-medium">Admins</Link> and create an invite. They get <strong>full admin access</strong>, so add only people you want to have it.</p>
          </div>
        </div>
        <p>Your plan includes room for {stats.staffBuffer} staff on top of your {stats.families} families.</p>
      </Step>

      <Step n={7} title="Check who has joined and follow up">
        <ul className="list-disc pl-5 space-y-1.5">
          <li><Link href="/school/families" className="text-warm-700 font-medium">Families</Link> lists everyone who has joined, with their children and linked parents.</li>
          <li><Link href="/school/invite" className="text-warm-700 font-medium">Invitations</Link> shows who has been invited and who hasn&apos;t accepted yet.</li>
          <li>After a week, send a short reminder with your link to anyone who hasn&apos;t joined. If someone can&apos;t find their email, ask them to check their spam folder, or just send them your school link.</li>
        </ul>
      </Step>

      <div className="text-center pt-2">
        <p className="text-sm text-navy-600/70 mb-3">Stuck on anything? Reply to your welcome email. We offer free 30-minute walkthroughs for new schools.</p>
        <Link href="/school" className="text-sm font-medium text-navy-600 hover:text-navy-700">← Back to dashboard</Link>
      </div>
    </div>
  )
}
