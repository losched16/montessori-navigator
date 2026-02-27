import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.NAVIGATOR_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { answers, childAge, childName } = body

    const prompt = `You are a Montessori readiness advisor for the Montessori Foundation. A parent has completed a readiness assessment for their child. Provide a thoughtful, balanced, and encouraging analysis. This is NOT a pass/fail — it's a nuanced exploration of alignment.

CHILD: ${childName || 'Their child'}
AGE: ${childAge || 'Not specified'}

PARENT RESPONSES:
${Object.entries(answers).map(([key, value]) => `${key}: ${value}`).join('\n')}

Provide your analysis as JSON:
{
  "headline": "A warm, encouraging 1-sentence headline (e.g., 'Your family shows strong alignment with Montessori values')",
  "alignment_level": "strong|good|moderate|exploring",
  "summary": "2-3 sentence overview of the family's readiness and alignment. Always positive and encouraging, even if alignment is low. Frame low alignment as 'You're at the beginning of an exciting journey' not 'You're not ready.'",
  "child_readiness": {
    "score_label": "A word like 'Strong', 'Growing', 'Emerging', or 'Beginning'",
    "factors": [
      {"factor": "Factor name", "status": "strength|developing|opportunity", "detail": "1-2 sentence explanation"}
    ]
  },
  "family_alignment": {
    "score_label": "A word like 'Natural Fit', 'Well-Aligned', 'Growing', or 'Exploring'",
    "factors": [
      {"factor": "Factor name", "status": "strength|developing|opportunity", "detail": "1-2 sentence explanation"}
    ]
  },
  "environment_readiness": {
    "score_label": "Similar label",
    "factors": [
      {"factor": "Factor name", "status": "strength|developing|opportunity", "detail": "1-2 sentence explanation"}
    ]
  },
  "top_strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "growth_areas": ["Area 1 framed positively", "Area 2 framed as opportunity"],
  "next_steps": [
    {"step": "Concrete action", "why": "Why this helps"},
    {"step": "Another action", "why": "Why this helps"}
  ],
  "school_readiness_note": "If age-appropriate, a note about what to look for in a school. If too young, a note about home Montessori instead.",
  "encouragement": "A warm, personal closing message that acknowledges where they are and affirms their interest in Montessori. 2-3 sentences."
}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      system: `You are a warm, knowledgeable Montessori advisor for the Montessori Foundation. You help families understand their readiness for Montessori education. Key principles:
- There is no "failing" this assessment. Every family is somewhere on a journey.
- Montessori is not just for certain children — it's an approach that can work for all children, adapted to their needs.
- Be specific and actionable, not vague.
- Frame everything through the lens of the child's development and the family's values.
- Never dismiss or judge a family's current approach.
- Always return valid JSON.`,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to generate analysis' }, { status: 500 })
    }

    const analysis = JSON.parse(jsonMatch[0])
    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Assessment API error:', error)
    return NextResponse.json({ error: 'Failed to process assessment' }, { status: 500 })
  }
}
