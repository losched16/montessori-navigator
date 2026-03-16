'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { formatAge, getAgePlane, getAgePlaneLabel } from '@/lib/utils'
import { useChild } from '@/lib/child-context'
import PageBanner from '@/components/ui/PageBanner'
import { getAllMonthlyGuides, getGuideForChildAge } from '@/lib/monthly-development'
import MonthlyDevelopment from '@/components/journey/MonthlyDevelopment'
import MonthSelector from '@/components/journey/MonthSelector'

interface JourneyStats {
  totalObservations: number
  totalMilestones: number
  milestonesAchieved: number
  plansCreated: number
  chatThreads: number
  currentStreak: number
  longestStreak: number
  skillsMastered: number
  skillsInProgress: number
  recentMilestones: Array<{ milestone_name: string; achieved_date: string; curriculum_area: string }>
  observationsByMonth: Array<{ month: string; count: number }>
  areaDistribution: Array<{ area: string; count: number }>
  growthMoments: string[]
}

const GROWTH_THRESHOLDS = [
  { obs: 1, message: 'You made your first observation. The journey begins.' },
  { obs: 5, message: 'Five observations logged. You\'re building an observation practice.' },
  { obs: 10, message: 'Ten observations. You\'re seeing your child with Montessori eyes.' },
  { obs: 25, message: 'Twenty-five observations. Your attention is a gift to your child.' },
  { obs: 50, message: 'Fifty observations. You\'re documenting a beautiful childhood.' },
  { obs: 100, message: 'One hundred observations. This is extraordinary dedication.' },
  { milestones: 1, message: 'First milestone celebrated. Every step matters.' },
  { milestones: 5, message: 'Five milestones achieved. Growth is happening.' },
  { milestones: 10, message: 'Ten milestones. Look how far your child has come.' },
  { milestones: 25, message: 'Twenty-five milestones. A path of quiet, steady growth.' },
  { plans: 1, message: 'Your first learning plan. Intentional days ahead.' },
  { plans: 5, message: 'Five plans created. You\'re building rhythm and structure.' },
  { plans: 10, message: 'Ten plans. You\'re truly following your child.' },
  { streak: 3, message: 'Three days in a row. Consistency is everything.' },
  { streak: 7, message: 'A full week of observations. You\'re making this a habit.' },
  { streak: 14, message: 'Two weeks of daily observation. This changes how you see everything.' },
  { streak: 30, message: 'Thirty days. You\'ve built a genuine observation practice.' },
]

const AREA_ICONS: Record<string, string> = {
  practical_life: '🤲',
  sensorial: '👁️',
  language: '📖',
  mathematics: '🔢',
  cultural_studies: '🌍',
  social_emotional: '💛',
  executive_function: '🧠',
  gross_motor: '🏃',
  fine_motor: '✋',
  art_music: '🎨',
}

const SEASON_PROMPTS = [
  { quarter: 1, title: 'Winter Reflection', prompt: 'What seeds were planted this season? What quiet growth did you notice?' },
  { quarter: 2, title: 'Spring Awakening', prompt: 'What\'s emerging? What new interests or abilities are blooming?' },
  { quarter: 3, title: 'Summer Abundance', prompt: 'What flourished? Where did your child surprise you with growth?' },
  { quarter: 4, title: 'Autumn Harvest', prompt: 'What has your child mastered this year? What are you most grateful for?' },
]

export default function JourneyPage() {
  const { children, selectedChildId, setSelectedChildId, selectedChild } = useChild()
  const [stats, setStats] = useState<JourneyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'progress' | 'development' | null>(null)
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null)

  const supabase = createClient()

  // Check if child is under 3 years (36 months) — development guide is baby/toddler only
  const childAgeMonths = selectedChild?.date_of_birth
    ? Math.floor((Date.now() - new Date(selectedChild.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    : null
  const showDevGuide = childAgeMonths !== null && childAgeMonths <= 36

  // Get development guides (only relevant for babies/toddlers)
  const allGuides = getAllMonthlyGuides()
  const childGuide = showDevGuide && selectedChild?.date_of_birth
    ? getGuideForChildAge(selectedChild.date_of_birth)
    : null
  const activeMonthId = selectedMonthId || childGuide?.id || allGuides[0]?.id
  const activeGuide = allGuides.find(g => g.id === activeMonthId) || allGuides[0]

  useEffect(() => {
    if (!selectedChildId) return
    loadStats()
  }, [selectedChildId])

  const loadStats = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
    if (!parent) return

    // Get observations
    const { data: observations } = await supabase
      .from('observations')
      .select('date, curriculum_area')
      .eq('child_id', selectedChildId)
      .order('date', { ascending: true })

    // Get milestones
    const { data: milestones } = await supabase
      .from('milestones')
      .select('milestone_name, achieved, achieved_date, curriculum_area')
      .eq('child_id', selectedChildId)

    const { data: achievedMilestones } = await supabase
      .from('milestones')
      .select('milestone_name, achieved_date, curriculum_area')
      .eq('child_id', selectedChildId)
      .eq('achieved', true)
      .order('achieved_date', { ascending: false })
      .limit(10)

    // Get plans
    const { count: planCount } = await supabase
      .from('learning_plans')
      .select('*', { count: 'exact', head: true })
      .eq('child_id', selectedChildId)

    // Get chat threads
    const { count: threadCount } = await supabase
      .from('chat_threads')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', parent.id)

    // Get curriculum skill progress
    const { count: skillsMasteredCount } = await supabase
      .from('child_skill_progress')
      .select('*', { count: 'exact', head: true })
      .eq('child_id', selectedChildId)
      .eq('status', 'mastered')

    const { count: skillsInProgressCount } = await supabase
      .from('child_skill_progress')
      .select('*', { count: 'exact', head: true })
      .eq('child_id', selectedChildId)
      .eq('status', 'in_progress')

    // Calculate streak
    const obs = observations || []
    const uniqueDates = [...new Set(obs.map(o => o.date.split('T')[0]))].sort()
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 1

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    // Current streak from today/yesterday backwards
    if (uniqueDates.length > 0) {
      const lastDate = uniqueDates[uniqueDates.length - 1]
      if (lastDate === today || lastDate === yesterday) {
        currentStreak = 1
        for (let i = uniqueDates.length - 2; i >= 0; i--) {
          const curr = new Date(uniqueDates[i + 1])
          const prev = new Date(uniqueDates[i])
          const diff = (curr.getTime() - prev.getTime()) / 86400000
          if (diff === 1) {
            currentStreak++
          } else {
            break
          }
        }
      }

      // Longest streak
      for (let i = 1; i < uniqueDates.length; i++) {
        const curr = new Date(uniqueDates[i])
        const prev = new Date(uniqueDates[i - 1])
        const diff = (curr.getTime() - prev.getTime()) / 86400000
        if (diff === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak)
    }

    // Observations by month
    const monthCounts: Record<string, number> = {}
    obs.forEach(o => {
      const month = o.date.substring(0, 7)
      monthCounts[month] = (monthCounts[month] || 0) + 1
    })
    const observationsByMonth = Object.entries(monthCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({ month, count }))

    // Area distribution
    const areaCounts: Record<string, number> = {}
    obs.forEach(o => {
      if (o.curriculum_area && o.curriculum_area !== 'general') {
        areaCounts[o.curriculum_area] = (areaCounts[o.curriculum_area] || 0) + 1
      }
    })
    const areaDistribution = Object.entries(areaCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([area, count]) => ({ area, count }))

    // Growth moments
    const totalObs = obs.length
    const totalAchieved = (milestones || []).filter(m => m.achieved).length
    const growthMoments: string[] = []

    GROWTH_THRESHOLDS.forEach(t => {
      if ('obs' in t && totalObs >= t.obs!) growthMoments.push(t.message)
      if ('milestones' in t && totalAchieved >= t.milestones!) growthMoments.push(t.message)
      if ('plans' in t && (planCount || 0) >= t.plans!) growthMoments.push(t.message)
      if ('streak' in t && longestStreak >= t.streak!) growthMoments.push(t.message)
    })

    setStats({
      totalObservations: totalObs,
      totalMilestones: (milestones || []).length,
      milestonesAchieved: totalAchieved,
      plansCreated: planCount || 0,
      chatThreads: threadCount || 0,
      currentStreak,
      longestStreak,
      skillsMastered: skillsMasteredCount || 0,
      skillsInProgress: skillsInProgressCount || 0,
      recentMilestones: (achievedMilestones || []).map(m => ({
        milestone_name: m.milestone_name,
        achieved_date: m.achieved_date || '',
        curriculum_area: m.curriculum_area,
      })),
      observationsByMonth,
      areaDistribution,
      growthMoments: growthMoments.slice(-5).reverse(),
    })
    setLoading(false)
  }

  const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)
  const seasonPrompt = SEASON_PROMPTS.find(s => s.quarter === currentQuarter)

  const maxBarHeight = stats ? Math.max(...stats.observationsByMonth.map(o => o.count), 1) : 1

  return (
    <div className="max-w-3xl pb-20 sm:pb-0">
      <PageBanner
        image="/images/environment/boy-outdoor.jpg"
        title="Journey"
        subtitle="Your family's Montessori path"
      />

      {children.length > 1 && (
        <div className="flex gap-1 mb-6">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                selectedChildId === child.id
                  ? 'bg-warm-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading your journey...</div>
      ) : stats && selectedChild ? (
        <>
          {/* Child journey header */}
          <div className="bg-gradient-to-r from-navy-700 to-navy-500 rounded-2xl p-6 text-white mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">{selectedChild.name}&apos;s Journey</h2>
                <p className="text-white/60 text-sm mt-0.5">
                  {formatAge(selectedChild.date_of_birth)} · {getAgePlaneLabel(getAgePlane(selectedChild.date_of_birth))}
                </p>
              </div>
              {stats.currentStreak > 0 && (
                <div className="text-right">
                  <div className="text-2xl font-bold">{stats.currentStreak}</div>
                  <div className="text-xs text-white/50">day streak</div>
                </div>
              )}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-5 gap-3 mt-5">
              {[
                { value: stats.totalObservations, label: 'Observations' },
                { value: stats.milestonesAchieved, label: 'Milestones' },
                { value: stats.skillsMastered, label: 'Skills' },
                { value: stats.plansCreated, label: 'Plans' },
                { value: stats.chatThreads, label: 'Conversations' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab switcher — only show if child is under 3 */}
          {showDevGuide && (
            <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('development')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  (activeTab ?? 'development') === 'development'
                    ? 'bg-white text-navy-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>📖</span> Development Guide
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  (activeTab ?? 'development') === 'progress'
                    ? 'bg-white text-navy-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>📊</span> Progress Tracker
              </button>
            </div>
          )}

          {/* Development Guide Tab — only for babies/toddlers (0-36 months) */}
          {showDevGuide && (activeTab ?? 'development') === 'development' && activeGuide && (
            <>
              <MonthSelector
                guides={allGuides}
                selectedId={activeMonthId}
                onSelect={(id) => setSelectedMonthId(id)}
                highlightedId={childGuide?.id}
              />
              <MonthlyDevelopment
                guide={activeGuide}
                childName={childGuide?.id === activeMonthId ? selectedChild?.name : undefined}
              />
            </>
          )}

          {/* Progress Tracker Tab — always visible for older kids, tab-controlled for babies */}
          {(!showDevGuide || (activeTab ?? 'development') === 'progress') && (
          <>
          {/* Growth moments */}
          {stats.growthMoments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Growth Moments</h3>
              <div className="space-y-2">
                {stats.growthMoments.map((moment, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-warm-50 flex items-center justify-center shrink-0">
                      <span className="text-warm-600 text-sm">🌱</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed pt-1">{moment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observation activity chart */}
          {stats.observationsByMonth.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Observation Activity</h3>
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-end gap-2 h-32">
                  {stats.observationsByMonth.map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-xs text-gray-500 font-medium">{m.count}</div>
                      <div
                        className="w-full bg-warm-400 rounded-t-lg transition-all duration-500"
                        style={{ height: `${(m.count / maxBarHeight) * 100}%`, minHeight: m.count > 0 ? '4px' : '0' }}
                      />
                      <div className="text-[10px] text-gray-400">
                        {new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
                {stats.longestStreak > 1 && (
                  <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                    Longest observation streak: <span className="text-warm-700 font-medium">{stats.longestStreak} days</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Curriculum area distribution */}
          {stats.areaDistribution.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Where You&apos;re Observing</h3>
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="space-y-2">
                  {stats.areaDistribution.map((a, i) => {
                    const maxCount = stats.areaDistribution[0].count
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-lg w-6 text-center">{AREA_ICONS[a.area] || '📌'}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-gray-700 font-medium capitalize">{a.area.replace(/_/g, ' ')}</span>
                            <span className="text-xs text-gray-400">{a.count}</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-warm-400 rounded-full"
                              style={{ width: `${(a.count / maxCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Recent milestones achieved */}
          {stats.recentMilestones.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Recent Milestones</h3>
              <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
                {stats.recentMilestones.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center shrink-0">
                      <span className="text-sm">⭐</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-navy-600 font-medium">{m.milestone_name}</div>
                      <div className="text-xs text-gray-400">
                        {m.curriculum_area.replace(/_/g, ' ')}
                        {m.achieved_date && (
                          <span> · {new Date(m.achieved_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestone progress */}
          {stats.totalMilestones > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Milestone Progress</h3>
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{stats.milestonesAchieved} of {stats.totalMilestones}</span>
                  <span className="text-sm text-warm-700 font-medium">{Math.round((stats.milestonesAchieved / stats.totalMilestones) * 100)}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-warm-400 to-warm-500 rounded-full transition-all duration-700"
                    style={{ width: `${(stats.milestonesAchieved / stats.totalMilestones) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Every child moves at their own pace. This isn&apos;t a race — it&apos;s a map of where they&apos;ve been.
                </p>
              </div>
            </div>
          )}

          {/* Curriculum skill progress */}
          {(stats.skillsMastered > 0 || stats.skillsInProgress > 0) && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Curriculum Skills</h3>
              <div className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{stats.skillsMastered} mastered · {stats.skillsInProgress} in progress</span>
                  <span className="text-sm text-warm-700 font-medium">{Math.round((stats.skillsMastered / 2566) * 100)}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full flex">
                    <div
                      className="bg-gradient-to-r from-warm-400 to-warm-500 rounded-l-full transition-all duration-700"
                      style={{ width: `${(stats.skillsMastered / 2566) * 100}%` }}
                    />
                    <div
                      className="bg-amber-400 transition-all duration-700"
                      style={{ width: `${(stats.skillsInProgress / 2566) * 100}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Out of 2,566 skills in the Montessori scope &amp; sequence. Track progress in the <a href="/dashboard/curriculum" className="text-warm-600 hover:underline">Curriculum Guide</a>.
                </p>
              </div>
            </div>
          )}

          {/* Seasonal reflection */}
          {seasonPrompt && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Seasonal Reflection</h3>
              <div className="bg-gradient-to-br from-white to-warm-50 border border-warm-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{currentQuarter === 1 ? '❄️' : currentQuarter === 2 ? '🌸' : currentQuarter === 3 ? '☀️' : '🍂'}</span>
                  <h4 className="font-semibold text-navy-600">{seasonPrompt.title}</h4>
                </div>
                <p className="text-sm text-gray-600 italic leading-relaxed">{seasonPrompt.prompt}</p>
                <p className="text-xs text-gray-400 mt-3">Take a moment to pause and notice the growth that&apos;s already happened.</p>
              </div>
            </div>
          )}

          </>
          )}

          {/* Empty encouragement for new users */}
          {stats.totalObservations === 0 && stats.milestonesAchieved === 0 && (!showDevGuide || (activeTab ?? 'development') === 'progress') && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🌱</div>
              <h3 className="text-lg font-semibold text-navy-600 mb-2">Your journey starts here</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                Every observation you log, every milestone you celebrate, every plan you create adds to your family&apos;s unique Montessori story. Start by observing something your child does today.
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
