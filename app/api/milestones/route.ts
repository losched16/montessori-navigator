import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getAgePlane } from '@/lib/utils'

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
    const { action } = body

    // Initialize milestones for a child from templates
    if (action === 'initialize') {
      const { childId } = body

      const { data: child } = await supabase
        .from('children')
        .select('date_of_birth')
        .eq('id', childId)
        .eq('parent_id', parent.id)
        .single()

      if (!child) {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 })
      }

      const agePlane = getAgePlane(child.date_of_birth)

      // Get templates for this age plane (and previous plane for younger children)
      const planes = [agePlane]
      if (agePlane === '3-6') planes.push('0-3')
      if (agePlane === '6-9') planes.push('3-6')
      if (agePlane === '9-12') planes.push('6-9')

      const { data: templates } = await supabase
        .from('milestone_templates')
        .select('*')
        .in('age_plane', planes)
        .order('sort_order')

      if (!templates || templates.length === 0) {
        return NextResponse.json({ message: 'No templates found for this age plane', count: 0 })
      }

      // Check which milestones already exist for this child
      const { data: existing } = await supabase
        .from('milestones')
        .select('milestone_name')
        .eq('child_id', childId)

      const existingNames = new Set((existing || []).map(m => m.milestone_name))

      // Insert new milestones
      const newMilestones = templates
        .filter(t => !existingNames.has(t.milestone_name))
        .map(t => ({
          child_id: childId,
          curriculum_area: t.curriculum_area,
          milestone_name: t.milestone_name,
          description: t.description,
          age_plane: t.age_plane,
          achieved: false,
          achieved_date: null,
        }))

      if (newMilestones.length > 0) {
        await supabase.from('milestones').insert(newMilestones)
      }

      return NextResponse.json({ message: 'Milestones initialized', count: newMilestones.length })
    }

    // Toggle milestone achievement
    if (action === 'toggle') {
      const { milestoneId, achieved } = body

      const updateData: any = { achieved }
      if (achieved) {
        updateData.achieved_date = new Date().toISOString().split('T')[0]
      } else {
        updateData.achieved_date = null
      }

      await supabase
        .from('milestones')
        .update(updateData)
        .eq('id', milestoneId)

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Milestone API error:', error)
    return NextResponse.json({ error: 'Failed to process milestone' }, { status: 500 })
  }
}
