'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import PageBanner from '@/components/ui/PageBanner'
import type { Child, Observation } from '@/lib/supabase'
import { formatAge, getAgePlane, getAgePlaneLabel, getObservationTypeLabel, getCurriculumAreaLabel, getDevelopmentLevelLabel } from '@/lib/utils'
import { getGuideForChildAge } from '@/lib/monthly-development'
import { getAllArticles } from '@/lib/articles'
import { getAllNewsletters } from '@/lib/newsletters'

const LATEST_ARTICLES = getAllArticles()
  .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  .slice(0, 6)
const LATEST_NEWSLETTERS = getAllNewsletters().slice(0, 4)

// ── Sensitive period data keyed by age in months ──
const SENSITIVE_PERIODS: Array<{
  name: string; minMonths: number; maxMonths: number; peakMin: number; peakMax: number;
  description: string; parentTip: string; icon: string;
}> = [
  { name: 'Order', minMonths: 12, maxMonths: 42, peakMin: 18, peakMax: 30, icon: '🧩',
    description: 'Your child has a deep need for consistency, routine, and knowing where things belong.',
    parentTip: 'Keep the environment consistent. Prepare them for transitions. If they get upset about something being "wrong," respect it — this need is real.' },
  { name: 'Language', minMonths: 0, maxMonths: 72, peakMin: 24, peakMax: 48, icon: '🗣️',
    description: 'Your child is absorbing language at an extraordinary rate right now.',
    parentTip: 'Narrate your day. Use precise vocabulary. Read aloud daily. Name everything. When letter interest appears, teach sounds (/mmm/) not names ("em").' },
  { name: 'Movement', minMonths: 0, maxMonths: 48, peakMin: 12, peakMax: 36, icon: '🏃',
    description: 'Your child is driven to refine both gross and fine motor control.',
    parentTip: 'Maximize safe movement opportunities. Walking to the mailbox IS the activity. Offer pouring, transferring, and threading for fine motor development.' },
  { name: 'Small Objects', minMonths: 12, maxMonths: 36, peakMin: 14, peakMax: 30, icon: '🔍',
    description: 'Your child is fascinated by tiny things — crumbs, insects, beads, buttons.',
    parentTip: 'This is preparing the pincer grip for writing. Offer safe sorting activities with increasingly small items. Supervise but don\'t discourage the interest.' },
  { name: 'Refinement of Senses', minMonths: 24, maxMonths: 72, peakMin: 30, peakMax: 60, icon: '👁️',
    description: 'Your child is driven to classify and discriminate through all their senses.',
    parentTip: 'Provide rich sensory experiences. Name qualities precisely: "rough," "smooth," "heavy," "light." Sensorial work is the foundation for math and science.' },
  { name: 'Social Behavior', minMonths: 30, maxMonths: 60, peakMin: 30, peakMax: 48, icon: '🤝',
    description: 'Your child is intensely interested in how people interact and behave.',
    parentTip: 'Grace and courtesy lessons land powerfully now. Model the behavior you want to see. Give explicit demonstrations of greetings, turn-taking, and polite requests.' },
  { name: 'Writing', minMonths: 42, maxMonths: 60, peakMin: 42, peakMax: 54, icon: '✏️',
    description: 'Your child may be ready to encode — expressing their thoughts in written symbols.',
    parentTip: 'If they know letter sounds, introduce the Moveable Alphabet. Let them "write" before their hand is ready for a pencil. Accept all phonetic spellings — "sed" for "said" is brilliant.' },
  { name: 'Reading', minMonths: 54, maxMonths: 78, peakMin: 54, peakMax: 66, icon: '📖',
    description: 'Your child may be on the verge of the explosion into reading.',
    parentTip: 'Have books everywhere. Read aloud daily. Don\'t drill — the child will read when the preceding work (sounds, encoding, phonograms) has prepared them.' },
  { name: 'Math', minMonths: 48, maxMonths: 72, peakMin: 48, peakMax: 66, icon: '🔢',
    description: 'Your child is drawn to counting, quantity, patterns, and operations.',
    parentTip: 'Count everything in real life. Bake together (measuring). Let them handle money. If they can count to 10 with objects, they may be ready for golden bead work.' },
]

// ── Observation prompts by age plane ──
const OBSERVATION_PROMPTS: Record<string, string[]> = {
  '0-3': [
    'What did your child try to do independently today?',
    'Did you notice any new words or sounds?',
    'What held their attention the longest?',
    'Did they show interest in helping with a household task?',
    'How did they react to a change in routine?',
    'What small objects fascinated them today?',
  ],
  '3-6': [
    'What activity did your child choose to repeat today?',
    'Did you notice deep concentration? What triggered it?',
    'What new skill is emerging — even if imperfect?',
    'Did they show interest in letters, sounds, or numbers?',
    'How did they handle a frustration or challenge?',
    'What did they want to do "by myself"?',
  ],
  '6-9': [
    'What question did your child ask today that surprised you?',
    'Did they work collaboratively with another child?',
    'What topic sparked their curiosity?',
    'Did you notice their sense of fairness or justice?',
    'What research or project captured their interest?',
    'How did they handle a peer disagreement?',
  ],
  '9-12': [
    'What big question is your child thinking about?',
    'What project are they most invested in right now?',
    'How are they contributing to the family or community?',
    'What abstract concept are they grappling with?',
    'Did you notice leadership or mentoring behavior?',
    'What challenge did they persevere through?',
  ],
  '12+': [
    'What is your teen passionate about this week?',
    'How did they contribute meaningfully — to family, friends, or community?',
    'What decision did they make independently?',
    'Did you have a real conversation (not logistics) today?',
    'What are they creating, building, or working toward?',
    'Where did you see them showing responsibility?',
  ],
}

export default function DashboardHome() {
  const [parentName, setParentName] = useState('')
  const [experience, setExperience] = useState('')
  const [children, setChildren] = useState<Child[]>([])
  const [recentObs, setRecentObs] = useState<(Observation & { child_name?: string })[]>([])
  const [totalObs, setTotalObs] = useState(0)
  const [planCount, setPlanCount] = useState(0)
  const [milestoneCount, setMilestoneCount] = useState(0)
  const [threadCount, setThreadCount] = useState(0)
  const [skillCount, setSkillCount] = useState(0)
  const [devLevels, setDevLevels] = useState<Record<string, Array<{ area: string; level: number | null }>>>({})
  const [daysSinceObs, setDaysSinceObs] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: parent } = await supabase.from('parents').select('*').eq('user_id', user.id).single()
      if (!parent) return
      setParentName(parent.display_name || 'there')
      setExperience(parent.montessori_experience || '')

      const { data: kids } = await supabase.from('children').select('*').eq('parent_id', parent.id).order('created_at')
      setChildren(kids || [])
      const childIds = (kids || []).map(k => k.id)

      // Observations
      const { data: obs, count: obsCount } = await supabase
        .from('observations').select('*', { count: 'exact' })
        .eq('parent_id', parent.id).order('date', { ascending: false }).limit(5)

      if (obs && kids) {
        setRecentObs(obs.map(o => ({ ...o, child_name: kids.find(k => k.id === o.child_id)?.name || '' })))
        setTotalObs(obsCount || 0)
        if (obs.length > 0) {
          const last = new Date(obs[0].date)
          const diff = Math.floor((Date.now() - last.getTime()) / 86400000)
          setDaysSinceObs(diff)
        }
      }

      // Plans
      const { count: pc } = await supabase.from('learning_plans').select('*', { count: 'exact', head: true }).eq('parent_id', parent.id)
      setPlanCount(pc || 0)

      // Milestones achieved
      if (childIds.length > 0) {
        const { count: mc } = await supabase.from('milestones').select('*', { count: 'exact', head: true }).in('child_id', childIds).eq('achieved', true)
        setMilestoneCount(mc || 0)
      }

      // Threads
      const { count: tc } = await supabase.from('chat_threads').select('*', { count: 'exact', head: true }).eq('parent_id', parent.id)
      setThreadCount(tc || 0)

      // Skills mastered (across all children)
      if (childIds.length > 0) {
        const { count: sc } = await supabase.from('child_skill_progress').select('*', { count: 'exact', head: true }).in('child_id', childIds).eq('status', 'mastered')
        setSkillCount(sc || 0)
      }

      // Dev levels per child
      if (childIds.length > 0) {
        const { data: dl } = await supabase.from('child_development_levels').select('*').in('child_id', childIds)
        const grouped: Record<string, Array<{ area: string; level: number | null }>> = {}
        ;(dl || []).forEach(d => {
          if (!grouped[d.child_id]) grouped[d.child_id] = []
          grouped[d.child_id].push({ area: d.area, level: d.level })
        })
        setDevLevels(grouped)
      }
    }
    load()
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }

  // Get active sensitive periods for each child
  const getActivePeriods = (child: Child) => {
    if (!child.date_of_birth) return []
    const dob = new Date(child.date_of_birth)
    const ageMonths = Math.floor((Date.now() - dob.getTime()) / (30.44 * 86400000))
    return SENSITIVE_PERIODS
      .filter(sp => ageMonths >= sp.minMonths && ageMonths <= sp.maxMonths)
      .map(sp => ({
        ...sp,
        isPeak: ageMonths >= sp.peakMin && ageMonths <= sp.peakMax,
      }))
  }

  // Get observation prompt for today
  const getTodayPrompt = () => {
    if (children.length === 0) return null
    const primaryChild = children[0]
    const plane = getAgePlane(primaryChild.date_of_birth)
    const prompts = OBSERVATION_PROMPTS[plane] || OBSERVATION_PROMPTS['3-6']
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    return { prompt: prompts[dayOfYear % prompts.length], childName: primaryChild.name }
  }

  // Get next suggested action
  const getNextAction = () => {
    if (children.length === 0) return { href: '/dashboard/settings', label: 'Add your first child', desc: 'Set up your family to get started', icon: '🌱' }
    if (totalObs === 0) return { href: '/dashboard/children', label: 'Log your first observation', desc: 'Start building your child\'s developmental picture', icon: '📓' }
    if (planCount === 0) return { href: '/dashboard/plans', label: 'Create an at-home learning plan', desc: 'Get personalized activity recommendations', icon: '📋' }
    if (milestoneCount === 0) return { href: '/dashboard/milestones', label: 'Set up milestones', desc: 'Track developmental achievements', icon: '⭐' }
    if (daysSinceObs && daysSinceObs > 3) return { href: '/dashboard/children', label: 'Log an observation', desc: `It's been ${daysSinceObs} days — what did you notice?`, icon: '👀' }
    return { href: '/dashboard/chat', label: 'Ask the guide a question', desc: 'Get personalized Montessori guidance', icon: '💬' }
  }

  const todayPrompt = getTodayPrompt()
  const nextAction = getNextAction()

  return (
    <div className="max-w-3xl pb-20 sm:pb-0">
      <PageBanner
        image="/images/environment/girl-reading.jpg"
        title={`${greeting()}, ${parentName}`}
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      />

      {/* ═══ New user welcome ═══ */}
      {children.length === 0 && (
        <div className="bg-gradient-to-br from-navy-700 to-navy-500 rounded-[22px] sm:rounded-2xl p-6 sm:p-6 text-white mb-6">
          <div className="text-3xl mb-3">🌱</div>
          <h2 className="text-lg font-bold mb-1">Welcome to Navigator</h2>
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            Your Montessori journey starts here. Let&apos;s set up your family so Abigail can give you personalized recommendations.
          </p>
          <Link href="/dashboard/settings" className="tap-scale inline-block px-5 py-3.5 sm:py-2 bg-white/20 hover:bg-white/30 text-white font-medium text-sm rounded-[16px] sm:rounded-lg transition min-h-[54px] sm:min-h-0 flex items-center">
            Add Your First Child →
          </Link>
        </div>
      )}

      {/* ═══ Suggested next action ═══ */}
      {children.length > 0 && (
        <Link href={nextAction.href} className="tap-scale block bg-gradient-to-r from-navy-700 to-navy-500 rounded-[22px] sm:rounded-xl p-5 sm:p-4 text-white mb-6 hover:shadow-lg transition group">
          <div className="flex items-center gap-4 sm:gap-3">
            <div className="text-3xl sm:text-2xl">{nextAction.icon}</div>
            <div>
              <div className="font-bold sm:font-semibold text-base sm:text-sm group-hover:underline">{nextAction.label}</div>
              <div className="text-white/60 text-sm sm:text-xs">{nextAction.desc}</div>
            </div>
            <div className="ml-auto text-white/40 text-lg group-hover:text-white/70 transition">→</div>
          </div>
        </Link>
      )}

      {/* ═══ Observation prompt of the day ═══ */}
      {todayPrompt && (
        <div className="bg-gradient-to-r from-warm-50 to-white sm:bg-white sm:from-white border border-gray-100 rounded-[22px] sm:rounded-xl p-5 sm:p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 sm:w-9 sm:h-9 bg-warm-100 rounded-[14px] sm:rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xl sm:text-lg">👀</span>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Today&apos;s Observation Prompt</div>
              <p className="text-sm text-navy-600 leading-relaxed">{todayPrompt.prompt}</p>
              <Link href="/dashboard/children" className="tap-scale text-xs text-warm-600 font-medium mt-2 inline-block hover:underline">
                Log observation for {todayPrompt.childName} →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Latest Content ═══ */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs text-gray-400 font-medium uppercase tracking-wide">Latest Content</h2>
          <Link href="/dashboard/library" className="tap-scale text-xs text-warm-600 font-medium hover:underline">See All →</Link>
        </div>
        {/* Mobile: carousel */}
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide sm:hidden">
          {LATEST_ARTICLES.map(article => (
            <Link
              key={article.slug}
              href={`/dashboard/library/${article.slug}`}
              className="tap-scale snap-start shrink-0 w-[220px] bg-white border border-gray-100 rounded-[18px] p-4"
            >
              <div className="flex flex-wrap gap-1 mb-2">
                {article.categories.filter(c => c !== 'MFA').slice(0, 1).map(cat => (
                  <span key={cat} className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-warm-50 text-warm-700">{cat}</span>
                ))}
              </div>
              <h3 className="text-sm font-semibold text-navy-600 leading-snug line-clamp-2 mb-2">{article.title}</h3>
              <p className="text-[10px] text-gray-400">{article.author}</p>
            </Link>
          ))}
        </div>
        {/* Desktop: grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LATEST_ARTICLES.slice(0, 6).map(article => (
            <Link
              key={article.slug}
              href={`/dashboard/library/${article.slug}`}
              className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition group"
            >
              <div className="flex flex-wrap gap-1 mb-2">
                {article.categories.filter(c => c !== 'MFA').slice(0, 1).map(cat => (
                  <span key={cat} className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-warm-50 text-warm-700">{cat}</span>
                ))}
              </div>
              <h3 className="text-sm font-semibold text-navy-600 leading-snug line-clamp-2 mb-1 group-hover:text-warm-600 transition">{article.title}</h3>
              <p className="text-[10px] text-gray-400">{article.author}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ═══ Tomorrow's Child ═══ */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs text-gray-400 font-medium uppercase tracking-wide">Tomorrow&apos;s Child</h2>
          <Link href="/dashboard/library" className="tap-scale text-xs text-warm-600 font-medium hover:underline">All Issues →</Link>
        </div>
        {/* Mobile: carousel */}
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide sm:hidden">
          {LATEST_NEWSLETTERS.map(nl => (
            <a
              key={nl.slug}
              href={nl.pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-scale snap-start shrink-0 w-[140px]"
            >
              <div className={`bg-gradient-to-br ${nl.coverColor} rounded-[18px] p-4 h-[180px] flex flex-col justify-between`}>
                <p className="text-[10px] uppercase tracking-wide text-white/60 font-medium">Tomorrow&apos;s Child</p>
                <div>
                  <p className="text-base font-bold text-white leading-tight">{nl.issueLabel}</p>
                  <p className="text-[10px] text-white/50 mt-1 flex items-center gap-1"><span>📄</span> Read PDF</p>
                </div>
              </div>
            </a>
          ))}
        </div>
        {/* Desktop: grid */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-3">
          {LATEST_NEWSLETTERS.map(nl => (
            <a
              key={nl.slug}
              href={nl.pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className={`bg-gradient-to-br ${nl.coverColor} rounded-xl p-4 h-[160px] flex flex-col justify-between hover:shadow-md transition`}>
                <p className="text-[10px] uppercase tracking-wide text-white/60 font-medium">Tomorrow&apos;s Child</p>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{nl.issueLabel}</p>
                  <p className="text-[10px] text-white/50 mt-1 flex items-center gap-1"><span>📄</span> Read PDF</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ═══ Quick Actions ═══ */}
      {/* Mobile: horizontal scroll carousel */}
      <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide sm:hidden mb-6">
        {[
          { href: '/dashboard/chat', icon: '💬', label: 'Ask Abigail' },
          { href: '/dashboard/plans', icon: '📋', label: 'At-Home Plan' },
          { href: '/dashboard/children', icon: '📓', label: 'Observe' },
          { href: '/dashboard/journey', icon: '✨', label: 'Journey' },
          { href: '/dashboard/environment', icon: '🏡', label: 'Environment' },
          { href: '/dashboard/milestones', icon: '⭐', label: 'Milestones' },
        ].map(a => (
          <Link key={a.href} href={a.href} className="tap-scale w-[110px] h-[110px] shrink-0 snap-start bg-white border border-gray-100 rounded-[22px] flex flex-col items-center justify-center gap-2 hover:border-warm-300 transition">
            <div className="text-3xl">{a.icon}</div>
            <div className="text-sm font-medium text-gray-600">{a.label}</div>
          </Link>
        ))}
      </div>
      {/* Desktop: compact grid */}
      <div className="hidden sm:grid grid-cols-3 gap-2 mb-6">
        {[
          { href: '/dashboard/chat', icon: '💬', label: 'Ask Abigail' },
          { href: '/dashboard/plans', icon: '📋', label: 'At-Home Plan' },
          { href: '/dashboard/children', icon: '📓', label: 'Observe' },
        ].map(a => (
          <Link key={a.href} href={a.href} className="p-3 bg-white border border-gray-100 rounded-xl hover:border-warm-300 transition text-center group">
            <div className="text-xl mb-1">{a.icon}</div>
            <div className="text-xs font-medium text-gray-600 group-hover:text-warm-600">{a.label}</div>
          </Link>
        ))}
      </div>

      {/* ═══ Sensitive Period Alerts ═══ */}
      {children.length > 0 && children.map(child => {
        const periods = getActivePeriods(child)
        const peakPeriods = periods.filter(p => p.isPeak)
        if (peakPeriods.length === 0) return null

        return (
          <div key={child.id} className="mb-4">
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">
              {child.name}&apos;s Active Sensitive Periods
            </div>
            <div className="space-y-2">
              {peakPeriods.slice(0, 3).map(sp => (
                <div key={sp.name} className="bg-white border border-amber-100 border-l-4 border-l-amber-400 sm:border-l sm:border-l-amber-100 rounded-[22px] sm:rounded-xl p-4 sm:p-3">
                  <div className="flex items-start gap-3 sm:gap-2.5">
                    <span className="text-xl sm:text-lg mt-0.5">{sp.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-navy-600">{sp.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">PEAK</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{sp.parentTip}</p>
                    </div>
                  </div>
                </div>
              ))}
              {periods.filter(p => !p.isPeak).length > 0 && (
                <div className="text-xs text-gray-400 px-1">
                  Also active: {periods.filter(p => !p.isPeak).map(p => p.name).join(', ')}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* ═══ Baby Development Card (only for children ≤ 36 months) ═══ */}
      {(() => {
        const babyChild = children.find(c => {
          if (!c.date_of_birth) return false
          const ageMs = Date.now() - new Date(c.date_of_birth).getTime()
          return ageMs / (1000 * 60 * 60 * 24 * 30.44) <= 36
        })
        if (!babyChild || !babyChild.date_of_birth) return null
        const guide = getGuideForChildAge(babyChild.date_of_birth)
        if (!guide) return null
        const highlights = [
          guide.grossMotor.shouldBeAbleTo[0],
          guide.handDevelopment[0],
          guide.communication[0],
          guide.socialEmotional[0],
        ].filter(Boolean).map(h => h.length > 80 ? h.slice(0, 77) + '...' : h)
        return (
          <div className="mb-6">
            <Link
              href="/dashboard/development"
              className="tap-scale block bg-white border border-gray-100 rounded-[22px] sm:rounded-xl overflow-hidden hover:shadow-md transition"
            >
              <div className="border-l-4 border-l-indigo-400 p-5 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👶</span>
                    <h3 className="text-sm font-bold text-navy-600">{babyChild.name} at {guide.monthLabel}</h3>
                  </div>
                  <span className="text-xs text-indigo-500 font-medium">View Guide →</span>
                </div>
                <p className="text-xs text-gray-500 italic mb-3">{guide.tagline}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-xs mt-0.5 shrink-0">{['💪', '✋', '💬', '💛'][i]}</span>
                      <span className="text-xs text-gray-600 leading-relaxed">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          </div>
        )
      })()}

      {/* ═══ Children Overview with Dev Snapshot ═══ */}
      {children.length > 0 && (
        <div className="mb-6">
          <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Your Children</div>
          {/* Mobile: horizontal carousel */}
          <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 snap-x snap-mandatory scrollbar-hide sm:hidden">
            {children.map(child => {
              const levels = devLevels[child.id] || []
              const topAreas = levels.filter(l => l.level && l.level >= 3).sort((a, b) => (b.level || 0) - (a.level || 0)).slice(0, 3)
              const growthAreas = levels.filter(l => l.level && l.level <= 2).slice(0, 2)
              return (
                <Link key={child.id} href="/dashboard/children" className="tap-scale w-[280px] shrink-0 snap-start bg-white border border-gray-100 border-l-4 border-l-teal-400 rounded-[22px] p-5 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-navy-600">{child.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{formatAge(child.date_of_birth)}</span>
                    </div>
                    <span className="text-gray-300">→</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{getAgePlaneLabel(getAgePlane(child.date_of_birth))}</div>
                  {topAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {topAreas.map(a => (
                        <span key={a.area} className="text-[10px] px-2 py-0.5 bg-warm-50 text-warm-700 rounded-full">{getCurriculumAreaLabel(a.area)}: {getDevelopmentLevelLabel(a.level!)}</span>
                      ))}
                      {growthAreas.map(a => (
                        <span key={a.area} className="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full">{getCurriculumAreaLabel(a.area)}: {getDevelopmentLevelLabel(a.level!)}</span>
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
          {/* Desktop: vertical list */}
          <div className="hidden sm:block space-y-2">
            {children.map(child => {
              const levels = devLevels[child.id] || []
              const topAreas = levels.filter(l => l.level && l.level >= 3).sort((a, b) => (b.level || 0) - (a.level || 0)).slice(0, 3)
              const growthAreas = levels.filter(l => l.level && l.level <= 2).slice(0, 2)
              return (
                <Link key={child.id} href="/dashboard/children" className="block bg-white border border-gray-100 rounded-xl p-4 hover:border-warm-300 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-navy-600">{child.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{formatAge(child.date_of_birth)} · {getAgePlaneLabel(getAgePlane(child.date_of_birth))}</span>
                    </div>
                    <span className="text-gray-300 text-sm">→</span>
                  </div>
                  {topAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {topAreas.map(a => (
                        <span key={a.area} className="text-[10px] px-2 py-0.5 bg-warm-50 text-warm-700 rounded-full">{getCurriculumAreaLabel(a.area)}: {getDevelopmentLevelLabel(a.level!)}</span>
                      ))}
                      {growthAreas.map(a => (
                        <span key={a.area} className="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-600 rounded-full">{getCurriculumAreaLabel(a.area)}: {getDevelopmentLevelLabel(a.level!)}</span>
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ═══ Recent Observations ═══ */}
      {recentObs.length > 0 ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Recent Observations</div>
            <Link href="/dashboard/children" className="text-xs text-warm-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-2 sm:space-y-1.5">
            {recentObs.map(obs => (
              <div key={obs.id} className="bg-white border border-gray-100 border-l-4 border-l-warm-400 sm:border-l sm:border-l-gray-100 rounded-[22px] sm:rounded-xl p-4 sm:p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-medium text-warm-700">{obs.child_name}</span>
                      <span className="text-[10px] text-gray-400">{getObservationTypeLabel(obs.type)}</span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 sm:line-clamp-1">{obs.description}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap mt-1">
                    {new Date(obs.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : children.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-6 text-center mb-6">
          <div className="text-3xl mb-2">📓</div>
          <h3 className="font-semibold text-navy-600 mb-1">No observations yet</h3>
          <p className="text-xs text-gray-500 mb-3 max-w-sm mx-auto">
            Observation is the parent&apos;s most powerful tool. Start by watching what your child does — without judgment, without interruption.
          </p>
          <Link href="/dashboard/children" className="text-xs text-warm-600 font-medium hover:underline">
            Log your first observation →
          </Link>
        </div>
      ) : null}

      {/* ═══ Stats Row ═══ */}
      {children.length > 0 && (
        <>
          {/* Mobile: hero stats + horizontal scroll */}
          <div className="sm:hidden">
            <div className="bg-gradient-to-r from-warm-500 to-warm-400 rounded-[22px] p-5 mb-3 flex justify-around text-white">
              {[
                { value: totalObs, label: 'Observations' },
                { value: milestoneCount, label: 'Milestones' },
                { value: skillCount, label: 'Skills' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-bold">{s.value}</div>
                  <div className="text-xs text-white/70">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
              {[
                { value: planCount, label: 'At-Home Plans', href: '/dashboard/plans' },
                { value: threadCount, label: 'Chats', href: '/dashboard/chat' },
              ].map(s => (
                <Link key={s.label} href={s.href} className="tap-scale shrink-0 min-w-[100px] p-4 bg-white border border-gray-100 rounded-[22px] text-center">
                  <div className="text-lg font-bold text-navy-600">{s.value}</div>
                  <div className="text-[11px] text-gray-400">{s.label}</div>
                </Link>
              ))}
            </div>
          </div>
          {/* Desktop: compact grid */}
          <div className="hidden sm:grid grid-cols-5 gap-2">
            {[
              { value: totalObs, label: 'Observations', href: '/dashboard/children' },
              { value: milestoneCount, label: 'Milestones', href: '/dashboard/milestones' },
              { value: skillCount, label: 'Skills', href: '/dashboard/curriculum' },
              { value: planCount, label: 'At-Home Plans', href: '/dashboard/plans' },
              { value: threadCount, label: 'Chats', href: '/dashboard/chat' },
            ].map(s => (
              <Link key={s.label} href={s.href} className="p-3 bg-white border border-gray-100 rounded-xl text-center hover:border-warm-300 transition">
                <div className="text-lg font-bold text-navy-600">{s.value}</div>
                <div className="text-[10px] text-gray-400">{s.label}</div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ═══ Explore more ═══ */}
      {children.length > 0 && totalObs > 2 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-2">
          {[
            { href: '/dashboard/reports', icon: '📊', label: 'Generate Report', desc: 'Create a progress summary' },
            { href: '/dashboard/schools', icon: '🏫', label: 'Evaluate Schools', desc: 'Tour debrief & comparison' },
            { href: '/dashboard/journey', icon: '✨', label: 'View Journey', desc: 'Your family\'s growth story' },
            { href: '/dashboard/environment', icon: '🏡', label: 'Home Setup', desc: 'Track your prepared environment' },
          ].map(a => (
            <Link key={a.href} href={a.href} className="tap-scale p-5 sm:p-3 bg-white border border-gray-100 rounded-[22px] sm:rounded-xl hover:border-warm-300 transition group">
              <div className="text-2xl sm:text-lg mb-1">{a.icon}</div>
              <div className="text-sm sm:text-xs font-medium text-navy-600 group-hover:text-warm-600">{a.label}</div>
              <div className="text-xs sm:text-[10px] text-gray-400">{a.desc}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
