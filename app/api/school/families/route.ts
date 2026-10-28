import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// GET /api/school/families
//
// The enrolled-families list for the caller's school. School staff cannot read
// the families / children / family_members tables directly (RLS only lets a
// family's own members read them), so a browser-side lookup returned nothing
// and every family showed as "Unnamed Family" with "0 children". This route
// reads with the service role, scoped to the caller's own school, and returns
// only what a school may see: a display name, how many children, which
// parents are linked (names only), and when the family joined. No child
// names, no parent emails, no private data.

const GENERIC = /^(my family|family|the family|unnamed family|new family)$/i
const isGeneric = (n: string | null | undefined) => !n || !n.trim() || GENERIC.test(n.trim())

export async function GET() {
  const { data: { user } } = await createServerSupabase().auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const service = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { data: staff } = await service.from('school_staff').select('school_id').eq('user_id', user.id).limit(1).maybeSingle()
  if (!staff) return NextResponse.json({ error: 'Only school staff can view families' }, { status: 403 })
  const schoolId = staff.school_id

  const { data: enrollments } = await service
    .from('school_families')
    .select('id, family_id, status, joined_at')
    .eq('school_id', schoolId)
    .order('joined_at', { ascending: false })

  const familyIds = (enrollments || []).map(e => e.family_id)
  if (familyIds.length === 0) return NextResponse.json({ families: [] })

  const [{ data: families }, { data: children }, { data: members }] = await Promise.all([
    service.from('families').select('id, name').in('id', familyIds),
    service.from('children').select('id, family_id').in('family_id', familyIds),
    service.from('family_members').select('family_id, role, created_at, parents(display_name, email)').in('family_id', familyIds).order('created_at'),
  ])

  const nameById = new Map((families || []).map((f: any) => [f.id, f.name as string | null]))
  const childCount = new Map<string, number>()
  for (const c of children || []) childCount.set(c.family_id, (childCount.get(c.family_id) || 0) + 1)

  const byFamily = new Map<string, Array<{ name: string; role: string; email: string | null }>>()
  for (const m of members || []) {
    const p: any = Array.isArray((m as any).parents) ? (m as any).parents[0] : (m as any).parents
    const label = (p?.display_name || '').trim() || (p?.email ? String(p.email).split('@')[0] : 'Parent')
    if (!byFamily.has(m.family_id)) byFamily.set(m.family_id, [])
    byFamily.get(m.family_id)!.push({ name: label, role: m.role, email: p?.email ?? null })
  }

  const result = (enrollments || []).map(e => {
    const linked = byFamily.get(e.family_id) || []
    const primary = linked.find(m => m.role === 'primary') || linked[0]
    const familyName = nameById.get(e.family_id)

    // Resolution order: a real family name, else "<primary parent>'s Family",
    // else the primary parent's email prefix, else "Unnamed Family".
    let displayName: string
    if (!isGeneric(familyName)) displayName = familyName as string
    else if (primary) displayName = `${primary.name}'s Family`
    else displayName = 'Unnamed Family'

    return {
      id: e.id,
      displayName,
      childrenCount: childCount.get(e.family_id) || 0,
      parents: linked.map(m => m.name),
      joinedAt: e.joined_at,
      status: e.status,
    }
  })

  return NextResponse.json({ families: result })
}
