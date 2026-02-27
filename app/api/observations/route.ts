import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!parent) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('observations')
      .insert({
        child_id: body.childId,
        parent_id: parent.id,
        type: body.type || 'general',
        curriculum_area: body.curriculumArea || 'general',
        title: body.title || null,
        description: body.description,
        went_well: body.wentWell || null,
        needs_support: body.needsSupport || null,
        next_steps: body.nextSteps || null,
        tags: body.tags || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ observation: data })
  } catch (error) {
    console.error('Observation API error:', error)
    return NextResponse.json({ error: 'Failed to save observation' }, { status: 500 })
  }
}
