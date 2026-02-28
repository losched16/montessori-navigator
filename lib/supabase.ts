import { createBrowserClient } from '@supabase/ssr'

// ================================================
// CLIENT (browser-side)
// ================================================

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ================================================
// TYPES
// ================================================

export interface Parent {
  id: string
  user_id: string
  display_name: string | null
  email: string | null
  montessori_experience: 'new' | 'familiar' | 'experienced' | 'trained' | null
  education_context: 'montessori_school' | 'homeschool' | 'hybrid' | 'public_supplementing' | 'exploring' | null
  communication_style: 'direct' | 'gentle' | 'detailed' | 'brief' | null
  created_at: string
}

export interface Child {
  id: string
  parent_id: string
  name: string
  date_of_birth: string | null
  current_environment: string | null
  school_name: string | null
  notes: string | null
  created_at: string
}

export type CurriculumArea = 
  | 'practical_life' | 'sensorial' | 'language' | 'mathematics'
  | 'cultural_studies' | 'social_emotional' | 'executive_function'
  | 'gross_motor' | 'fine_motor' | 'art_music'

export interface ChildDevelopmentLevel {
  id: string
  child_id: string
  area: CurriculumArea
  level: number | null
  notes: string | null
  updated_at: string
}

export interface ChildTrait {
  id: string
  child_id: string
  note: string
  created_at: string
}

export type ObservationType = 
  | 'home_activity' | 'school_observation' | 'milestone_reached'
  | 'challenge_noted' | 'interest_spark' | 'conference_notes' | 'general'

export interface Observation {
  id: string
  child_id: string
  parent_id: string
  date: string
  type: ObservationType
  curriculum_area: CurriculumArea | 'general' | null
  title: string | null
  description: string
  went_well: string | null
  needs_support: string | null
  next_steps: string | null
  tags: string[] | null
  created_at: string
}

export interface Milestone {
  id: string
  child_id: string
  curriculum_area: CurriculumArea
  milestone_name: string
  description: string | null
  age_plane: string | null
  achieved: boolean
  achieved_date: string | null
  notes: string | null
  created_at: string
}

export interface LearningPlan {
  id: string
  child_id: string
  parent_id: string
  title: string
  plan_type: 'daily' | 'weekly' | 'focus' | 'catchup' | null
  focus_areas: string[] | null
  duration_days: number
  content: any
  constraints: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  name: string
  curriculum_area: CurriculumArea
  age_plane: string | null
  difficulty_level: string | null
  description: string | null
  direct_aim: string | null
  indirect_aim: string | null
  prerequisites: string | null
  presentation_steps: string[] | null
  materials_needed: string[] | null
  common_errors: string | null
  extensions: string | null
  video_url: string | null
  video_source: string | null
  diy_alternative: string | null
  safety_notes: string | null
  ai_notes: string | null
  created_at: string
}

export interface HomeEnvironment {
  id: string
  parent_id: string
  room: string
  setup_notes: Record<string, any> | null
  materials_on_hand: string[] | null
  last_rotation_date: string | null
  notes: string | null
  updated_at: string
}

export interface SchoolEvaluation {
  id: string
  parent_id: string
  school_name: string
  visit_date: string | null
  credentials: string | null
  age_range: string | null
  observations: Record<string, any> | null
  ai_debrief: Record<string, any> | null
  comparison_score: Record<string, any> | null
  notes: string | null
  created_at: string
}

export interface ChatThread {
  id: string
  parent_id: string
  child_id: string | null
  title: string | null
  created_at: string
}

export interface ChatMessage {
  id: string
  thread_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  memory_suggestions: any
  created_at: string
}

export interface FamilyNote {
  id: string
  parent_id: string
  child_id: string | null
  title: string | null
  note: string
  pinned: boolean
  created_at: string
}

export type SkillStatus = 'not_started' | 'in_progress' | 'mastered'

export interface ChildSkillProgress {
  id: string
  child_id: string
  skill_index: number
  skill_area: string
  status: SkillStatus
  date_started: string | null
  date_mastered: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ================================================
// HELPER: Get current parent profile
// ================================================

export async function getCurrentParent(supabase: any): Promise<Parent | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('parents')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data
}

// ================================================
// HELPER: Get full family context for AI
// ================================================

export interface FamilyContext {
  parent: Parent
  children: Array<Child & {
    development_levels: ChildDevelopmentLevel[]
    traits: ChildTrait[]
    recent_observations: Observation[]
  }>
  parentPreferences: Record<string, string>
  familyNotes: FamilyNote[]
  homeEnvironment: HomeEnvironment[]
  recentPlans: string[]
  memorySummary: string | null
  activities: Activity[]
}

export async function getFamilyContext(supabase: any, parentId: string): Promise<FamilyContext | null> {
  // Get parent
  const { data: parent } = await supabase
    .from('parents')
    .select('*')
    .eq('id', parentId)
    .single()

  if (!parent) return null

  // Get children with development levels, traits, and recent observations
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at')

  const enrichedChildren = await Promise.all(
    (children || []).map(async (child: Child) => {
      const [devLevels, traits, observations] = await Promise.all([
        supabase
          .from('child_development_levels')
          .select('*')
          .eq('child_id', child.id),
        supabase
          .from('child_traits')
          .select('*')
          .eq('child_id', child.id),
        supabase
          .from('observations')
          .select('*')
          .eq('child_id', child.id)
          .order('date', { ascending: false })
          .limit(10),
      ])

      return {
        ...child,
        development_levels: devLevels.data || [],
        traits: traits.data || [],
        recent_observations: observations.data || [],
      }
    })
  )

  // Get preferences
  const { data: prefs } = await supabase
    .from('parent_preferences')
    .select('key, value')
    .eq('parent_id', parentId)

  const parentPreferences: Record<string, string> = {}
  ;(prefs || []).forEach((p: any) => { parentPreferences[p.key] = p.value })

  // Get family notes
  const { data: familyNotes } = await supabase
    .from('family_notes')
    .select('*')
    .eq('parent_id', parentId)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(20)

  // Get home environment
  const { data: homeEnv } = await supabase
    .from('home_environment')
    .select('*')
    .eq('parent_id', parentId)

  // Get recent plan titles
  const { data: plans } = await supabase
    .from('learning_plans')
    .select('title')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get memory summary
  const { data: memory } = await supabase
    .from('family_memory_summaries')
    .select('summary')
    .eq('parent_id', parentId)
    .single()

  // Get activity library
  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .limit(100)

  return {
    parent,
    children: enrichedChildren,
    parentPreferences,
    familyNotes: familyNotes || [],
    homeEnvironment: homeEnv || [],
    recentPlans: (plans || []).map((p: any) => p.title),
    memorySummary: memory?.summary || null,
    activities: activities || [],
  }
}
