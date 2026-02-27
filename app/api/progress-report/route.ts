import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'
import { getAgePlane, getAgePlaneLabel, formatAge, getDevelopmentLevelLabel, getCurriculumAreaLabel, getObservationTypeLabel } from '@/lib/utils'

const anthropic = new Anthropic({
  apiKey: process.env.NAVIGATOR_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: any) { try { cookieStore.set({ name, value, ...options }) } catch (e) {} },
          remove(name: string, options: any) { try { cookieStore.set({ name, value: '', ...options }) } catch (e) {} },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: parent } = await supabase
      .from('parents')
      .select('id, display_name')
      .eq('user_id', user.id)
      .single()

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 })
    }

    const { childId, reportType, dateRangeStart, dateRangeEnd } = await request.json()

    // Get child
    const { data: child } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .eq('parent_id', parent.id)
      .single()

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    // Get development levels
    const { data: devLevels } = await supabase
      .from('child_development_levels')
      .select('*')
      .eq('child_id', childId)

    // Get observations in date range
    let obsQuery = supabase
      .from('observations')
      .select('*')
      .eq('child_id', childId)
      .order('date', { ascending: true })

    if (dateRangeStart) obsQuery = obsQuery.gte('date', dateRangeStart)
    if (dateRangeEnd) obsQuery = obsQuery.lte('date', dateRangeEnd)

    const { data: observations } = await obsQuery

    // Get milestones
    const { data: milestones } = await supabase
      .from('milestones')
      .select('*')
      .eq('child_id', childId)
      .eq('achieved', true)
      .order('achieved_date', { ascending: true })

    // Get learning plans in range
    let plansQuery = supabase
      .from('learning_plans')
      .select('title, plan_type, focus_areas, created_at')
      .eq('child_id', childId)
      .order('created_at', { ascending: true })

    if (dateRangeStart) plansQuery = plansQuery.gte('created_at', dateRangeStart)
    if (dateRangeEnd) plansQuery = plansQuery.lte('created_at', dateRangeEnd)

    const { data: plans } = await plansQuery

    // Get traits
    const { data: traits } = await supabase
      .from('child_traits')
      .select('note')
      .eq('child_id', childId)

    const agePlane = getAgePlane(child.date_of_birth)
    const age = formatAge(child.date_of_birth)

    // Generate AI narrative
    const prompt = `You are writing a Montessori developmental progress report for a child. Write in a warm, professional tone appropriate for a parent or homeschool portfolio. This is a ${reportType} report.

CHILD: ${child.name}
AGE: ${age}
DEVELOPMENTAL PLANE: ${getAgePlaneLabel(agePlane)}
ENVIRONMENT: ${child.current_environment || 'Not specified'}
${child.school_name ? `SCHOOL: ${child.school_name}` : ''}
REPORTING PERIOD: ${dateRangeStart || 'All time'} to ${dateRangeEnd || 'Present'}

DEVELOPMENTAL LEVELS:
${(devLevels || []).filter((d: any) => d.level).map((d: any) =>
  `${getCurriculumAreaLabel(d.area)}: ${getDevelopmentLevelLabel(d.level)} (${d.level}/5)${d.notes ? ` — ${d.notes}` : ''}`
).join('\n') || 'No levels recorded yet.'}

OBSERVATIONS (${(observations || []).length} entries):
${(observations || []).map((o: any) => {
  const date = new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `[${date}] ${getObservationTypeLabel(o.type)}${o.curriculum_area && o.curriculum_area !== 'general' ? ` (${getCurriculumAreaLabel(o.curriculum_area)})` : ''}: ${o.description}${o.went_well ? ` | Positive: ${o.went_well}` : ''}${o.needs_support ? ` | Support needed: ${o.needs_support}` : ''}`
}).join('\n') || 'No observations in this period.'}

${(milestones || []).length > 0 ? `MILESTONES ACHIEVED:\n${milestones!.map((m: any) => `- ${m.milestone_name} (${getCurriculumAreaLabel(m.curriculum_area)})${m.achieved_date ? ` on ${new Date(m.achieved_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}`).join('\n')}` : ''}

${(traits || []).length > 0 ? `CHILD TRAITS & CHARACTERISTICS:\n${traits!.map((t: any) => `- ${t.note}`).join('\n')}` : ''}

${(plans || []).length > 0 ? `LEARNING PLANS COMPLETED (${plans!.length}):\n${plans!.map((p: any) => `- ${p.title} (${p.plan_type})`).join('\n')}` : ''}

${reportType === 'homeschool_compliance' ? `
This report should be formatted for homeschool portfolio documentation. Include:
- Clear curriculum coverage documentation
- Hours/engagement evidence through observations
- Progress against age-appropriate standards
- Subject area coverage
` : ''}

${reportType === 'conference' ? `
This report should be formatted for a parent-teacher conference. Include:
- Current developmental snapshot
- Areas of strength and growth
- Suggested areas for school-home alignment
- Questions for the teacher
` : ''}

Write the report with these sections:
1. Overview (2-3 sentences summarizing the child's overall development)
2. Developmental Snapshot (brief status for each area with recorded levels)
3. Key Observations & Patterns (what themes emerge from observations)
4. Areas of Strength (what the child is excelling at)
5. Growth Opportunities (areas for continued development — positive framing only)
6. Milestones & Achievements (if any)
7. Recommendations (suggested focus areas and activities for the next period)

Return as JSON:
{
  "title": "Report title",
  "overview": "Overview paragraph",
  "developmental_snapshot": [
    {"area": "Practical Life", "level": "Proficient", "summary": "Brief assessment"}
  ],
  "key_observations": "Paragraph about patterns and themes",
  "strengths": ["Strength 1 with detail", "Strength 2"],
  "growth_opportunities": ["Opportunity 1 with positive framing", "Opportunity 2"],
  "milestones": ["Milestone description"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "closing": "A warm closing statement about the child's journey"
}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: 'You are an expert Montessori educator writing developmental progress reports. Be warm, specific, and grounded in Montessori principles. Always use positive framing. Return valid JSON.',
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
    }

    const report = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      report,
      childName: child.name,
      childAge: age,
      agePlane: getAgePlaneLabel(agePlane),
      parentName: parent.display_name,
      reportType,
      dateRange: { start: dateRangeStart, end: dateRangeEnd },
      observationCount: (observations || []).length,
      devLevels: (devLevels || []).filter((d: any) => d.level).map((d: any) => ({
        area: getCurriculumAreaLabel(d.area),
        level: d.level,
        levelLabel: getDevelopmentLevelLabel(d.level),
      })),
    })
  } catch (error) {
    console.error('Progress report API error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
