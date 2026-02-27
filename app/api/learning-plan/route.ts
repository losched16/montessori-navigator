import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generateLearningPlan } from '@/lib/anthropic'
import { getAgePlane, getAgePlaneLabel, formatAge, getDevelopmentLevelLabel, getCurriculumAreaLabel } from '@/lib/utils'

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

    const { childId, planType, focusAreas, constraints } = await request.json()

    // Get parent
    const { data: parent } = await supabase
      .from('parents')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!parent) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 })
    }

    // Get child with development data
    const { data: child } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .eq('parent_id', parent.id)
      .single()

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    const { data: devLevels } = await supabase
      .from('child_development_levels')
      .select('*')
      .eq('child_id', childId)

    const { data: observations } = await supabase
      .from('observations')
      .select('*')
      .eq('child_id', childId)
      .order('date', { ascending: false })
      .limit(5)

    // Get home environment for materials
    const { data: homeEnv } = await supabase
      .from('home_environment')
      .select('materials_on_hand')
      .eq('parent_id', parent.id)

    const allMaterials = (homeEnv || []).flatMap(e => e.materials_on_hand || [])

    const agePlane = getAgePlane(child.date_of_birth)

    // Gather interests from recent observations
    const interests = (observations || [])
      .filter((o: any) => o.type === 'interest_spark')
      .map((o: any) => o.description)
      .slice(0, 3)

    const plan = await generateLearningPlan(
      planType,
      focusAreas,
      {
        name: child.name,
        age: formatAge(child.date_of_birth),
        agePlane: getAgePlaneLabel(agePlane),
        developmentLevels: (devLevels || [])
          .filter((d: any) => d.level)
          .map((d: any) => ({ area: d.area, level: d.level })),
        recentObservations: (observations || []).map((o: any) => o.description).slice(0, 3),
        interests,
      },
      {
        materialsOnHand: allMaterials,
        environment: child.current_environment || 'home',
        constraints,
      }
    )

    // Save the plan
    const { data: savedPlan } = await supabase
      .from('learning_plans')
      .insert({
        child_id: childId,
        parent_id: parent.id,
        title: plan.title || `${planType} plan for ${child.name}`,
        plan_type: planType,
        focus_areas: focusAreas,
        duration_days: planType === 'weekly' ? 5 : 1,
        content: plan,
        constraints,
      })
      .select()
      .single()

    return NextResponse.json({ plan, planId: savedPlan?.id })
  } catch (error) {
    console.error('Learning plan API error:', error)
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 })
  }
}
