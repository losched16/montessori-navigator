import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'

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
      .select('id, montessori_experience')
      .eq('user_id', user.id)
      .single()

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 })
    }

    const body = await request.json()
    const { action } = body

    // =============================================
    // ACTION: AI Tour Debrief
    // =============================================
    if (action === 'debrief') {
      const { schoolName, credentials, ageRange, observations, additionalNotes } = body

      const prompt = `You are a Montessori school evaluation expert working for the Montessori Foundation. A parent has just toured a school and recorded their observations. Provide a thoughtful, balanced analysis.

PARENT'S MONTESSORI EXPERIENCE: ${parent.montessori_experience || 'not specified'}

SCHOOL: ${schoolName}
CREDENTIALS: ${credentials || 'Not specified'}
AGE RANGE: ${ageRange || 'Not specified'}

PARENT'S TOUR OBSERVATIONS:
${Object.entries(observations).map(([category, answers]: [string, any]) => {
  return `\n${category.toUpperCase()}:\n${Object.entries(answers).map(([q, a]) => `  - ${q}: ${a}`).join('\n')}`
}).join('\n')}

${additionalNotes ? `ADDITIONAL NOTES FROM PARENT:\n${additionalNotes}` : ''}

Provide your analysis as JSON in this exact format:
{
  "overall_alignment": "strong|moderate|mixed|concerning",
  "overall_score": 1-10,
  "summary": "2-3 sentence overall assessment",
  "strengths": [
    {"area": "Area name", "detail": "What was strong and why it matters"}
  ],
  "concerns": [
    {"area": "Area name", "detail": "What was concerning and why", "severity": "minor|moderate|significant"}
  ],
  "questions_to_ask": [
    {"question": "Follow-up question", "reason": "Why this matters"}
  ],
  "credential_analysis": {
    "credential": "What they have",
    "meaning": "What this credential means",
    "considerations": "What to keep in mind"
  },
  "red_flags": ["Any red flags observed"],
  "green_flags": ["Positive indicators"],
  "recommendation": "A thoughtful 2-3 sentence recommendation for next steps"
}`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        system: `You are an expert Montessori school evaluator working for the Montessori Foundation. You help parents understand what they observed during school tours. Be balanced, thorough, and grounded in authentic Montessori principles. Never dismiss a school unfairly, but be honest about concerns. Adjust your language complexity based on the parent's experience level. Always return valid JSON.`,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0].type === 'text' ? response.content[0].text : ''
      const jsonMatch = content.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        return NextResponse.json({ error: 'Failed to parse analysis' }, { status: 500 })
      }

      const debrief = JSON.parse(jsonMatch[0])

      // Save the evaluation
      const { data: evaluation } = await supabase
        .from('school_evaluations')
        .insert({
          parent_id: parent.id,
          school_name: schoolName,
          credentials: credentials || null,
          age_range: ageRange || null,
          observations,
          ai_debrief: debrief,
          comparison_score: {
            overall: debrief.overall_score,
            alignment: debrief.overall_alignment,
          },
          notes: additionalNotes || null,
        })
        .select()
        .single()

      return NextResponse.json({ debrief, evaluationId: evaluation?.id })
    }

    // =============================================
    // ACTION: Compare Schools
    // =============================================
    if (action === 'compare') {
      const { evaluationIds } = body

      const { data: evaluations } = await supabase
        .from('school_evaluations')
        .select('*')
        .in('id', evaluationIds)
        .eq('parent_id', parent.id)

      if (!evaluations || evaluations.length < 2) {
        return NextResponse.json({ error: 'Need at least 2 evaluations to compare' }, { status: 400 })
      }

      const prompt = `Compare these Montessori schools based on the parent's tour evaluations:

${evaluations.map((ev: any, i: number) => `
SCHOOL ${i + 1}: ${ev.school_name}
Credentials: ${ev.credentials || 'Not specified'}
Overall Score: ${ev.ai_debrief?.overall_score || 'N/A'}/10
Alignment: ${ev.ai_debrief?.overall_alignment || 'N/A'}
Summary: ${ev.ai_debrief?.summary || 'No summary'}
Strengths: ${(ev.ai_debrief?.strengths || []).map((s: any) => s.area).join(', ')}
Concerns: ${(ev.ai_debrief?.concerns || []).map((c: any) => c.area).join(', ')}
`).join('\n---\n')}

Provide a comparison as JSON:
{
  "comparison_summary": "Overall comparison in 2-3 sentences",
  "categories": [
    {
      "category": "Category name (e.g., Environment, Teacher Quality, Curriculum Authenticity)",
      "schools": [
        {"name": "School name", "rating": "strong|good|mixed|weak", "note": "Brief note"}
      ]
    }
  ],
  "recommendation": "Which school seems like the best fit and why, with appropriate caveats"
}`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: 'You are a Montessori school evaluation expert. Provide balanced, fair comparisons. Always return valid JSON.',
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0].type === 'text' ? response.content[0].text : ''
      const jsonMatch = content.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        return NextResponse.json({ error: 'Failed to parse comparison' }, { status: 500 })
      }

      return NextResponse.json({ comparison: JSON.parse(jsonMatch[0]) })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('School evaluation API error:', error)
    return NextResponse.json({ error: 'Failed to process evaluation' }, { status: 500 })
  }
}
