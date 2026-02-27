'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import type { Child } from '@/lib/supabase'
import { formatAge } from '@/lib/utils'

const REPORT_TYPES = [
  { value: 'general', label: 'General Progress Report', desc: 'Overall developmental summary' },
  { value: 'homeschool_compliance', label: 'Homeschool Portfolio', desc: 'Documentation for compliance records' },
  { value: 'conference', label: 'Conference Prep', desc: 'Summary for parent-teacher meetings' },
]

interface ReportData {
  report: {
    title: string
    overview: string
    developmental_snapshot: Array<{ area: string; level: string; summary: string }>
    key_observations: string
    strengths: string[]
    growth_opportunities: string[]
    milestones: string[]
    recommendations: string[]
    closing: string
  }
  childName: string
  childAge: string
  agePlane: string
  parentName: string
  reportType: string
  dateRange: { start: string | null; end: string | null }
  observationCount: number
  devLevels: Array<{ area: string; level: number; levelLabel: string }>
}

export default function ReportsPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [reportType, setReportType] = useState('general')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [generating, setGenerating] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: parent } = await supabase.from('parents').select('id').eq('user_id', user.id).single()
      if (!parent) return

      const { data: kids } = await supabase.from('children').select('*').eq('parent_id', parent.id).order('created_at')
      if (kids && kids.length > 0) {
        setChildren(kids)
        setSelectedChildId(kids[0].id)
      }

      // Default date range: last 3 months
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      setDateEnd(end.toISOString().split('T')[0])
      setDateStart(start.toISOString().split('T')[0])
    }
    load()
  }, [])

  const selectedChild = children.find(c => c.id === selectedChildId)

  const handleGenerate = async () => {
    if (!selectedChildId) return
    setGenerating(true)
    setReportData(null)

    try {
      const res = await fetch('/api/progress-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId: selectedChildId,
          reportType,
          dateRangeStart: dateStart || undefined,
          dateRangeEnd: dateEnd || undefined,
        }),
      })

      const data = await res.json()
      if (data.report) {
        setReportData(data)
      }
    } catch (error) {
      console.error('Report generation error:', error)
    } finally {
      setGenerating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const levelBarWidth = (level: number) => `${(level / 5) * 100}%`
  const levelColor = (level: number) => {
    if (level >= 4) return 'bg-teal-500'
    if (level >= 3) return 'bg-teal-400'
    if (level >= 2) return 'bg-warm-400'
    return 'bg-gray-300'
  }

  return (
    <div className="max-w-3xl pb-20 sm:pb-0">
      {/* Generator (hidden during print) */}
      <div className="print:hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-navy-600">Progress Reports</h1>
            <p className="text-sm text-gray-500 mt-0.5">Generate developmental summaries and portfolio documentation</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
          <div className="space-y-4">
            {/* Child selector */}
            {children.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Child</label>
                <div className="flex gap-1">
                  {children.map(child => (
                    <button
                      key={child.id}
                      onClick={() => { setSelectedChildId(child.id); setReportData(null) }}
                      className={`px-3 py-1.5 text-sm rounded-lg transition ${
                        selectedChildId === child.id
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Report type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <div className="space-y-1.5">
                {REPORT_TYPES.map(rt => (
                  <button
                    key={rt.value}
                    onClick={() => setReportType(rt.value)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      reportType === rt.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm text-navy-600">{rt.label}</div>
                    <div className="text-xs text-gray-500">{rt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  value={dateStart}
                  onChange={e => setDateStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={e => setDateEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedChildId || generating}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg transition disabled:opacity-40"
            >
              {generating ? 'Generating report...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Report display (visible in both screen and print) */}
      {reportData && (
        <div>
          {/* Print/export actions (hidden during print) */}
          <div className="flex items-center justify-between mb-4 print:hidden">
            <span className="text-sm text-gray-500">Report generated</span>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-1.5 bg-navy-600 hover:bg-navy-700 text-white text-sm font-medium rounded-lg transition"
              >
                Print / Save PDF
              </button>
            </div>
          </div>

          {/* The actual report */}
          <div ref={printRef} className="bg-white border border-gray-100 rounded-xl overflow-hidden print:border-none print:rounded-none print:shadow-none">

            {/* Report header */}
            <div className="bg-gradient-to-r from-navy-600 to-teal-600 text-white p-6 print:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium text-teal-200 uppercase tracking-widest mb-1">Montessori Navigator</div>
                  <h2 className="text-xl font-bold mb-1">{reportData.report.title}</h2>
                  <div className="text-sm text-white/70">
                    {reportData.childName} · {reportData.childAge} · {reportData.agePlane}
                  </div>
                </div>
                <div className="text-right text-sm text-white/60">
                  <div>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  <div>{reportData.dateRange.start && reportData.dateRange.end
                    ? `${new Date(reportData.dateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(reportData.dateRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    : 'All time'
                  }</div>
                  <div className="mt-1">{reportData.observationCount} observations</div>
                </div>
              </div>
            </div>

            <div className="p-6 print:p-8 space-y-6">
              {/* Overview */}
              <div>
                <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wide mb-2">Overview</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{reportData.report.overview}</p>
              </div>

              {/* Developmental snapshot */}
              {reportData.devLevels && reportData.devLevels.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wide mb-3">Developmental Snapshot</h3>
                  <div className="space-y-2.5">
                    {reportData.devLevels.map((d, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">{d.area}</span>
                          <span className="text-xs text-gray-500">{d.levelLabel}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${levelColor(d.level)} transition-all`}
                            style={{ width: levelBarWidth(d.level) }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Scale: 1 = Emerging · 2 = Developing · 3 = Practicing · 4 = Proficient · 5 = Mastered</p>
                </div>
              )}

              {/* AI-generated snapshot summaries */}
              {reportData.report.developmental_snapshot && reportData.report.developmental_snapshot.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wide mb-3">Area Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2">
                    {reportData.report.developmental_snapshot.map((snap, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg print:border print:border-gray-200">
                        <div className="text-sm font-medium text-navy-600 mb-0.5">{snap.area}</div>
                        <div className="text-xs text-gray-600 leading-relaxed">{snap.summary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key observations */}
              {reportData.report.key_observations && (
                <div>
                  <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wide mb-2">Key Observations & Patterns</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{reportData.report.key_observations}</p>
                </div>
              )}

              {/* Strengths */}
              {reportData.report.strengths && reportData.report.strengths.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wide mb-2">Areas of Strength</h3>
                  <div className="space-y-1.5">
                    {reportData.report.strengths.map((s, i) => (
                      <div key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-teal-500 shrink-0">✦</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Growth opportunities */}
              {reportData.report.growth_opportunities && reportData.report.growth_opportunities.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wide mb-2">Growth Opportunities</h3>
                  <div className="space-y-1.5">
                    {reportData.report.growth_opportunities.map((g, i) => (
                      <div key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-warm-500 shrink-0">→</span>
                        <span>{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestones */}
              {reportData.report.milestones && reportData.report.milestones.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wide mb-2">Milestones & Achievements</h3>
                  <div className="space-y-1.5">
                    {reportData.report.milestones.map((m, i) => (
                      <div key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-sage-500 shrink-0">★</span>
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {reportData.report.recommendations && reportData.report.recommendations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-navy-600 uppercase tracking-wide mb-2">Recommendations for Next Period</h3>
                  <div className="space-y-1.5">
                    {reportData.report.recommendations.map((r, i) => (
                      <div key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-blue-400 shrink-0">{i + 1}.</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Closing */}
              {reportData.report.closing && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 italic leading-relaxed">{reportData.report.closing}</p>
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Generated by Montessori Navigator · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="text-xs text-gray-400">
                  Prepared for {reportData.parentName || 'Parent'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!reportData && !generating && (
        <div className="print:hidden text-center py-8 text-gray-400 text-sm">
          Configure your report above and click Generate to create a developmental summary.
        </div>
      )}
    </div>
  )
}
