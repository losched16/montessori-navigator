import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { isSuperAdmin } from '@/lib/super-admin'

export const dynamic = 'force-dynamic'

// GET /api/admin/dashboard
//
// Partner dashboard data (docs/partner-dashboard/spec.md), computed live from
// Supabase + Stripe. Super-admin only. Never returns parent emails or names —
// only school names and aggregate counts.
//
// "Activity" = a parent did something meaningful: asked Abigail a question,
// logged a Moment, marked a milestone achieved, or updated a growth level.
// Logins alone don't count. Staff and super-admin accounts are excluded so
// internal use doesn't inflate parent metrics.

// Health thresholds live in one place so they can be tuned.
const HEALTH = {
  activationAtRisk: 0.45, // activated / invited below this => at risk
  trendAtRisk: -0.15, // active 30d vs prior 30d at or below this => at risk
  underInvited: 0.5, // invited / enrolled below this => under-invited
}

const DAY = 86_400_000

async function authedSuperAdmin() {
  const cookieStore = cookies()
  const ssr = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: any) { try { cookieStore.set({ name, value, ...options }) } catch (e) {} },
        remove(name: string, options: any) { try { cookieStore.set({ name, value: '', ...options }) } catch (e) {} },
      },
    },
  )
  const { data: { user } } = await ssr.auth.getUser()
  if (!user) return { error: 'Not authenticated', status: 401 as const }
  if (!(await isSuperAdmin(user.id))) return { error: 'Forbidden', status: 403 as const }
  return { user }
}

// PostgREST caps responses at 1000 rows; page through everything.
async function fetchAll<T = any>(service: SupabaseClient, table: string, columns: string, filter?: (q: any) => any): Promise<T[]> {
  const out: T[] = []
  const size = 1000
  for (let from = 0; ; from += size) {
    let q = service.from(table).select(columns).range(from, from + size - 1)
    if (filter) q = filter(q)
    const { data, error } = await q
    if (error) throw new Error(`${table}: ${error.message}`)
    out.push(...((data || []) as T[]))
    if (!data || data.length < size) break
  }
  return out
}

// Stripe subscriptions via REST with a pinned API version: the account default
// ("clover") drops `subscription.discount`, which we need to spot 100%-off codes.
async function fetchStripeSubscriptions(): Promise<any[]> {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return []
  const out: any[] = []
  let startingAfter: string | null = null
  for (let i = 0; i < 20; i++) {
    const params = new URLSearchParams({ limit: '100', status: 'all' })
    if (startingAfter) params.set('starting_after', startingAfter)
    const res = await fetch(`https://api.stripe.com/v1/subscriptions?${params}`, {
      headers: { Authorization: `Bearer ${key}`, 'Stripe-Version': '2024-06-20' },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`Stripe ${res.status}`)
    const page = await res.json()
    out.push(...page.data)
    if (!page.has_more || page.data.length === 0) break
    startingAfter = page.data[page.data.length - 1].id
  }
  return out
}

function monthStart(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function addMonths(d: Date, n: number) { return new Date(d.getFullYear(), d.getMonth() + n, 1) }
function weekStart(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dow = (x.getDay() + 6) % 7 // Monday = 0
  x.setDate(x.getDate() - dow)
  return x
}
const norm = (s: string | null | undefined) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

type SubKind = 'school' | 'parent'
interface SubInfo {
  id: string
  kind: SubKind
  status: string
  tier: 'digital' | 'print' | 'monthly' | 'annual'
  monthly: number // normalized monthly amount in dollars, before discount
  annual: number
  quantity: number
  free: boolean // 100% off coupon
  created: number
  endedAt: number | null
  trialEnd: number | null
  periodEnd: number | null
}

function classifySub(s: any): SubInfo {
  const item = s.items?.data?.[0]
  const price = item?.price || {}
  const unit = (price.unit_amount || 0) / 100
  const qty = item?.quantity || 1
  const interval = price.recurring?.interval
  const pid = price.id
  const isSchool =
    pid === process.env.STRIPE_PRICE_ID_SCHOOL ||
    pid === process.env.STRIPE_PRICE_ID_SCHOOL_PRINT ||
    s.metadata?.type === 'school' ||
    s.metadata?.school_id ||
    (interval === 'year' && (unit === 12 || unit === 25))
  const annual = interval === 'month' ? unit * qty * 12 : unit * qty
  let tier: SubInfo['tier']
  if (isSchool) tier = pid === process.env.STRIPE_PRICE_ID_SCHOOL_PRINT || unit === 25 ? 'print' : 'digital'
  else tier = interval === 'month' ? 'monthly' : 'annual'
  const pct = s.discount?.coupon?.percent_off
  return {
    id: s.id,
    kind: isSchool ? 'school' : 'parent',
    status: s.status,
    tier,
    monthly: annual / 12,
    annual,
    quantity: qty,
    free: pct === 100,
    created: s.created * 1000,
    endedAt: s.ended_at ? s.ended_at * 1000 : null,
    trialEnd: s.trial_end ? s.trial_end * 1000 : null,
    periodEnd: s.current_period_end ? s.current_period_end * 1000 : null,
  }
}

// Paying = would actually be billed at time t (not free, not in trial, live).
function payingAt(sub: SubInfo, t: number) {
  if (sub.free) return false
  if (sub.created > t) return false
  if (sub.endedAt && sub.endedAt <= t) return false
  if (sub.trialEnd && sub.trialEnd > t) return false
  if (['incomplete', 'incomplete_expired'].includes(sub.status)) return false
  return true
}

export async function GET() {
  const auth = await authedSuperAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const service = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    const [
      schools, staff, supers, schoolFamilies, members, parents, children,
      invitations, observations, threads, messages, milestones, devLevels, stripeSubsRaw,
    ] = await Promise.all([
      fetchAll(service, 'schools', 'id, name, state, is_comped, subscription_status, stripe_subscription_id, family_count, created_at, trial_ends_at, current_period_end'),
      fetchAll(service, 'school_staff', 'school_id, user_id'),
      fetchAll(service, 'super_admins', 'user_id'),
      fetchAll(service, 'school_families', 'school_id, family_id, status, joined_at'),
      fetchAll(service, 'family_members', 'family_id, parent_id'),
      fetchAll(service, 'parents', 'id, user_id, created_at, subscription_status, stripe_subscription_id'),
      fetchAll(service, 'children', 'id, parent_id, family_id, date_of_birth, school_name, created_at'),
      fetchAll(service, 'invitations', 'school_id, email, status, created_at, accepted_at', q => q.eq('type', 'school_family')),
      fetchAll(service, 'observations', 'parent_id, created_at'),
      fetchAll(service, 'chat_threads', 'id, parent_id'),
      fetchAll(service, 'chat_messages', 'thread_id, created_at', q => q.eq('role', 'user')),
      fetchAll(service, 'milestones', 'child_id, achieved, achieved_date, created_at', q => q.eq('achieved', true)),
      fetchAll(service, 'child_development_levels', 'child_id, updated_at'),
      fetchStripeSubscriptions().catch(() => null),
    ])

    const now = new Date()
    const nowMs = now.getTime()

    // ---- Who counts as a parent ------------------------------------------
    const internalUsers = new Set<string>([...staff.map((s: any) => s.user_id), ...supers.map((s: any) => s.user_id)])
    const realParents = parents.filter((p: any) => !internalUsers.has(p.user_id))
    const parentIds = new Set(realParents.map((p: any) => p.id))

    // parent -> school (via family membership + active school enrollment)
    const familySchool = new Map<string, string>()
    for (const sf of schoolFamilies) if (sf.status === 'active') familySchool.set(sf.family_id, sf.school_id)
    const parentFamilies = new Map<string, string[]>()
    for (const m of members) {
      if (!parentFamilies.has(m.parent_id)) parentFamilies.set(m.parent_id, [])
      parentFamilies.get(m.parent_id)!.push(m.family_id)
    }
    const parentSchool = new Map<string, string>()
    for (const p of realParents) {
      for (const f of parentFamilies.get(p.id) || []) {
        const s = familySchool.get(f)
        if (s) { parentSchool.set(p.id, s); break }
      }
    }

    // child -> parent (direct owner, else a member of the child's family)
    const familyParent = new Map<string, string>()
    for (const m of members) if (!familyParent.has(m.family_id)) familyParent.set(m.family_id, m.parent_id)
    const childParent = new Map<string, string>()
    for (const c of children) {
      const pid = c.parent_id || (c.family_id ? familyParent.get(c.family_id) : undefined)
      if (pid) childParent.set(c.id, pid)
    }
    const threadParent = new Map<string, string>(threads.map((t: any) => [t.id, t.parent_id]))

    // ---- Unified activity events -----------------------------------------
    type Ev = { p: string; t: number; k: 'abigail' | 'moment' | 'milestone' | 'growth' }
    const events: Ev[] = []
    const push = (p: string | undefined, ts: string | null | undefined, k: Ev['k']) => {
      if (!p || !ts || !parentIds.has(p)) return
      const t = new Date(ts).getTime()
      if (!Number.isNaN(t) && t <= nowMs + DAY) events.push({ p, t, k })
    }
    for (const m of messages) push(threadParent.get(m.thread_id), m.created_at, 'abigail')
    for (const o of observations) push(o.parent_id, o.created_at, 'moment')
    for (const m of milestones) push(childParent.get(m.child_id), m.achieved_date || m.created_at, 'milestone')
    const childCreated = new Map<string, number>(children.map((c: any) => [c.id, new Date(c.created_at).getTime()]))
    for (const d of devLevels) {
      // Onboarding writes an initial level for every area; only later edits are real activity.
      const born = childCreated.get(d.child_id)
      if (born && new Date(d.updated_at).getTime() - born < 2 * 60 * 60 * 1000) continue
      push(childParent.get(d.child_id), d.updated_at, 'growth')
    }

    const activeIn = (from: number, to: number, filter?: (p: string) => boolean) => {
      const s = new Set<string>()
      for (const e of events) if (e.t >= from && e.t < to && (!filter || filter(e.p))) s.add(e.p)
      return s
    }
    const active30 = activeIn(nowMs - 30 * DAY, nowMs + DAY)
    const active7 = activeIn(nowMs - 7 * DAY, nowMs + DAY)
    const activePrev30 = activeIn(nowMs - 60 * DAY, nowMs - 30 * DAY)

    // ---- Stripe ----------------------------------------------------------
    const stripeOk = stripeSubsRaw !== null
    const subs = (stripeSubsRaw || []).map(classifySub)
    const subById = new Map(subs.map(s => [s.id, s]))

    // ---- Schools ---------------------------------------------------------
    // A partner school is comped, or has a LIVE Stripe subscription that is
    // active / trialing / past-due. The DB status alone isn't trusted: the old
    // Stripe account and missed webhooks left stale statuses behind. Schools
    // whose subscription isn't in the live account ("legacy") stay only if
    // families actually joined. Test and internal (Foundation) schools are excluded.
    const INTERNAL_NAME = /(^|\s)test(\s|$)|acadmey|^apple$|montessori foundation/i
    const staffBySchool = new Map<string, string[]>()
    for (const st of staff) {
      if (!staffBySchool.has(st.school_id)) staffBySchool.set(st.school_id, [])
      staffBySchool.get(st.school_id)!.push(st.user_id)
    }
    const superIds = new Set(supers.map((x: any) => x.user_id))
    const joinedCount = new Map<string, number>()
    for (const sf of schoolFamilies) if (sf.status === 'active') joinedCount.set(sf.school_id, (joinedCount.get(sf.school_id) || 0) + 1)
    const partnerSchools = schools.filter((s: any) => {
      if (INTERNAL_NAME.test((s.name || '').trim())) return false
      if ((staffBySchool.get(s.id) || []).some(u => superIds.has(u)) && !s.is_comped) return false
      if (s.is_comped) return true
      const sub = s.stripe_subscription_id ? subById.get(s.stripe_subscription_id) : undefined
      if (sub) return ['active', 'trialing', 'past_due'].includes(sub.status)
      if (!stripeOk) return ['active', 'trialing', 'past_due'].includes(s.subscription_status)
      return (joinedCount.get(s.id) || 0) > 0 && ['active', 'trialing', 'past_due'].includes(s.subscription_status)
    })

    const invitesBySchool = new Map<string, Set<string>>()
    for (const inv of invitations) {
      if (!inv.school_id || !inv.email) continue
      if (!invitesBySchool.has(inv.school_id)) invitesBySchool.set(inv.school_id, new Set())
      invitesBySchool.get(inv.school_id)!.add(inv.email.toLowerCase().trim())
    }
    const joinedBySchool = new Map<string, number>()
    for (const sf of schoolFamilies) if (sf.status === 'active') joinedBySchool.set(sf.school_id, (joinedBySchool.get(sf.school_id) || 0) + 1)

    const schoolRows = partnerSchools.map((s: any) => {
      const sub = s.stripe_subscription_id ? subById.get(s.stripe_subscription_id) : undefined
      const activated = joinedBySchool.get(s.id) || 0
      const invited = Math.max(invitesBySchool.get(s.id)?.size || 0, activated)
      const enrolled = s.family_count || 0
      const inSchool = (p: string) => parentSchool.get(p) === s.id
      const a30 = [...active30].filter(inSchool).length
      const a7 = [...active7].filter(inSchool).length
      const prev = [...activePrev30].filter(inSchool).length
      const trend = prev > 0 ? (a30 - prev) / prev : null

      let billing: 'paid' | 'free_code' | 'comped' | 'trial' | 'past_due' | 'legacy'
      if (s.is_comped) billing = 'comped'
      else if (!sub) billing = 'legacy'
      else if (sub.free) billing = 'free_code'
      else if (sub.status === 'past_due') billing = 'past_due'
      else if (sub.status === 'trialing') billing = 'trial'
      else billing = 'paid'
      const tier = sub?.tier === 'print' ? 'Digital + Print' : 'Digital'
      const annualValue = sub && !sub.free ? sub.annual : 0

      const actRate = invited > 0 ? activated / invited : 0
      let health: string, healthReason: string
      if (invited === 0) { health = 'Not launched'; healthReason = 'Active, but no families invited yet' }
      else if (actRate < HEALTH.activationAtRisk) { health = 'At risk'; healthReason = `Only ${Math.round(actRate * 100)}% of invited families have joined` }
      else if (trend !== null && trend <= HEALTH.trendAtRisk) { health = 'At risk'; healthReason = `Active parents down ${Math.round(-trend * 100)}% vs prior 30 days` }
      else if (enrolled > 0 && invited / enrolled < HEALTH.underInvited) { health = 'Under-invited'; healthReason = 'Fewer than half of families invited' }
      else { health = 'Healthy'; healthReason = 'Invites, activation and use on track' }

      const renewTs = sub?.periodEnd || (s.current_period_end ? new Date(s.current_period_end).getTime() : null)
        || (s.trial_ends_at ? new Date(s.trial_ends_at).getTime() : null)

      return {
        id: s.id, name: s.name, state: s.state, billing, tier, annualValue,
        enrolled, invited, activated, active30: a30, active7: a7,
        trendPct: trend === null ? null : Math.round(trend * 100),
        health, healthReason,
        renewsAt: renewTs ? new Date(renewTs).toISOString() : null,
        createdAt: s.created_at,
      }
    })

    // ---- 12-month series -------------------------------------------------
    const m0 = addMonths(monthStart(now), -11)
    const months = Array.from({ length: 12 }, (_, i) => addMonths(m0, i))
    const monthLabels = months.map(m => m.toLocaleDateString('en-US', { month: 'short' }))
    const monthLong = months.map(m => m.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
    const monthEnd = (i: number) => Math.min(addMonths(months[i], 1).getTime(), nowMs)
    const partnerCreated = partnerSchools.map((s: any) => new Date(s.created_at).getTime())
    const partnerIds = new Set(partnerSchools.map((s: any) => s.id))
    const inviteFirst = new Map<string, number>()
    for (const inv of invitations) {
      if (!inv.email || !partnerIds.has(inv.school_id)) continue
      const k = inv.email.toLowerCase().trim()
      const t = new Date(inv.created_at).getTime()
      if (!inviteFirst.has(k) || t < inviteFirst.get(k)!) inviteFirst.set(k, t)
    }
    const joinTimes = schoolFamilies.filter((sf: any) => sf.status === 'active' && sf.joined_at && partnerIds.has(sf.school_id)).map((sf: any) => new Date(sf.joined_at).getTime())
    const mrrAt = (t: number, kind: SubKind) => subs.filter(s => s.kind === kind && payingAt(s, t)).reduce((a, s) => a + s.monthly, 0)

    const series = {
      schools: months.map((_, i) => partnerCreated.filter(t => t < monthEnd(i)).length),
      newSchools: months.map((m, i) => partnerCreated.filter(t => t >= m.getTime() && t < monthEnd(i)).length),
      invitedCum: months.map((_, i) => [...inviteFirst.values()].filter(t => t < monthEnd(i)).length),
      activatedCum: months.map((_, i) => joinTimes.filter(t => t < monthEnd(i)).length),
      activeInMonth: months.map((m, i) => activeIn(m.getTime(), monthEnd(i)).size),
      schoolMrr: months.map((_, i) => Math.round(mrrAt(monthEnd(i) - 1, 'school'))),
      parentMrr: months.map((_, i) => Math.round(mrrAt(monthEnd(i) - 1, 'parent'))),
    }

    // ---- Totals / funnel -------------------------------------------------
    const T = {
      schools: schoolRows.length,
      enrolled: schoolRows.reduce((a, s) => a + s.enrolled, 0),
      invited: schoolRows.reduce((a, s) => a + s.invited, 0),
      activated: schoolRows.reduce((a, s) => a + s.activated, 0),
      active30School: schoolRows.reduce((a, s) => a + s.active30, 0),
      active7School: schoolRows.reduce((a, s) => a + s.active7, 0),
      active30: active30.size,
      active7: active7.size,
      activePrev30: activePrev30.size,
      parents: realParents.length,
      schoolParents: realParents.filter((p: any) => parentSchool.has(p.id)).length,
    }

    // ---- Engagement ------------------------------------------------------
    const w0 = weekStart(new Date(nowMs - 25 * 7 * DAY))
    const weeks = Array.from({ length: 26 }, (_, i) => new Date(w0.getTime() + i * 7 * DAY))
    const wau = weeks.map(w => ({
      label: w.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: activeIn(w.getTime(), w.getTime() + 7 * DAY).size,
    }))
    const abigail30 = events.filter(e => e.k === 'abigail' && e.t >= nowMs - 30 * DAY).length
    const featureLabels: Record<Ev['k'], string> = {
      abigail: 'Asked Abigail', moment: 'Logged a Moment', milestone: 'Marked a milestone', growth: 'Updated growth levels',
    }
    const featureUsage = (Object.keys(featureLabels) as Ev['k'][]).map(k => {
      const users = new Set(events.filter(e => e.k === k && e.t >= nowMs - 30 * DAY).map(e => e.p))
      return { key: k, label: featureLabels[k], pct: active30.size ? Math.round((users.size / active30.size) * 100) : 0 }
    }).sort((a, b) => b.pct - a.pct)

    const planeDefs = [
      { k: '0–3', label: 'Infant & toddler', max: 3 }, { k: '3–6', label: 'Primary', max: 6 },
      { k: '6–9', label: 'Lower elementary', max: 9 }, { k: '9–12', label: 'Upper elementary', max: 12 },
      { k: '12–18', label: 'Adolescent', max: 18 },
    ]
    const planeSets = planeDefs.map(() => new Set<string>())
    for (const c of children) {
      const p = childParent.get(c.id)
      if (!p || !active30.has(p) || !c.date_of_birth) continue
      const age = (nowMs - new Date(c.date_of_birth).getTime()) / (365.25 * DAY)
      const idx = planeDefs.findIndex(d => age < d.max)
      if (idx >= 0 && age >= 0) planeSets[idx].add(p)
    }
    const planes = planeDefs.map((d, i) => ({ k: d.k, label: d.label, count: planeSets[i].size }))

    // Retention cohorts: parents grouped by signup month (last 8 full cohorts).
    const cohortStart = addMonths(monthStart(now), -8)
    const cohorts = Array.from({ length: 8 }, (_, i) => {
      const cm = addMonths(cohortStart, i)
      const members = realParents.filter((p: any) => {
        const t = new Date(p.created_at).getTime()
        return t >= cm.getTime() && t < addMonths(cm, 1).getTime()
      }).map((p: any) => p.id)
      const set = new Set(members)
      const values: Array<number | null> = []
      for (let n = 1; n <= 8; n++) {
        const s = addMonths(cm, n)
        if (s.getTime() > nowMs) { values.push(null); continue }
        const act = activeIn(s.getTime(), Math.min(addMonths(s, 1).getTime(), nowMs), p => set.has(p))
        values.push(members.length ? Math.round((act.size / members.length) * 100) : null)
      }
      return { label: cm.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), size: members.length, values }
    })
    const threeMo = cohorts[cohorts.length - 4]
    const retention3 = threeMo && threeMo.size > 0 ? { pct: threeMo.values[2], cohort: threeMo.label } : null

    // ---- Revenue ---------------------------------------------------------
    const schoolPaying = subs.filter(s => s.kind === 'school' && payingAt(s, nowMs) && s.status !== 'past_due')
    const parentPaying = subs.filter(s => s.kind === 'parent' && payingAt(s, nowMs) && s.status !== 'past_due')
    const pastDue = subs.filter(s => s.status === 'past_due')
    const schoolMrr = schoolPaying.reduce((a, s) => a + s.monthly, 0)
    const parentMrr = parentPaying.reduce((a, s) => a + s.monthly, 0)
    const lastMonthEnd = months[11].getTime() - 1
    const mrrPrev = mrrAt(lastMonthEnd, 'school') + mrrAt(lastMonthEnd, 'parent')
    const tiers = (['digital', 'print'] as const).map(tier => {
      const list = schoolPaying.filter(s => s.tier === tier)
      return {
        tier: tier === 'digital' ? 'Digital ($12 / family / yr)' : 'Digital + Print ($25 / family / yr)',
        schools: list.length,
        families: list.reduce((a, s) => a + s.quantity, 0),
        annual: Math.round(list.reduce((a, s) => a + s.annual, 0)),
      }
    })
    const freeSchools = schoolRows.filter(s => s.billing === 'comped' || s.billing === 'free_code')
    const freeFamilies = freeSchools.reduce((a, s) => a + s.enrolled, 0)
    series.schoolMrr[11] = Math.round(schoolMrr)
    series.parentMrr[11] = Math.round(parentMrr)
    const revenue = {
      stripeOk,
      mrr: Math.round(schoolMrr + parentMrr),
      mrrPrev: Math.round(mrrPrev),
      schoolMrr: Math.round(schoolMrr),
      parentMrr: Math.round(parentMrr),
      payingSchools: schoolPaying.length,
      paidFamilies: schoolPaying.reduce((a, s) => a + s.quantity, 0),
      directSubscribers: parentPaying.length,
      directMonthly: parentPaying.filter(s => s.tier === 'monthly').length,
      directAnnual: parentPaying.filter(s => s.tier === 'annual').length,
      tiers,
      free: {
        schools: freeSchools.length,
        comped: freeSchools.filter(s => s.billing === 'comped').length,
        freeCode: freeSchools.filter(s => s.billing === 'free_code').length,
        families: freeFamilies,
        conversionAnnual: freeFamilies * 12,
      },
      trialSchools: schoolRows.filter(s => s.billing === 'trial').length,
      legacySchools: schoolRows.filter(s => s.billing === 'legacy').length,
      pastDue: {
        count: pastDue.length,
        schools: pastDue.filter(s => s.kind === 'school').length,
        parents: pastDue.filter(s => s.kind === 'parent').length,
        annual: Math.round(pastDue.reduce((a, s) => a + (s.free ? 0 : s.annual), 0)),
      },
    }

    // ---- Opportunities ---------------------------------------------------
    const schoolNames = new Set(schools.map((s: any) => norm(s.name)))
    const leadParents = new Set<string>()
    const leadSchools = new Set<string>()
    for (const c of children) {
      const p = childParent.get(c.id)
      if (!p || parentSchool.has(p) || !parentIds.has(p)) continue
      const n = norm(c.school_name)
      if (n.length < 3 || schoolNames.has(n)) continue
      leadParents.add(p); leadSchools.add(n)
    }
    const opportunities = {
      uninvited: schoolRows.reduce((a, s) => a + Math.max(0, s.enrolled - s.invited), 0),
      underInvitedSchools: schoolRows.filter(s => s.health === 'Under-invited').length,
      dormant: Math.max(0, T.invited - T.activated),
      leadParents: leadParents.size,
      leadSchools: leadSchools.size,
      conversionAnnual: revenue.free.conversionAnnual,
      freeSchools: revenue.free.schools,
    }

    return NextResponse.json({
      generatedAt: now.toISOString(),
      health: HEALTH,
      monthLabels, monthLong,
      totals: T,
      series,
      schools: schoolRows,
      engagement: {
        wau, abigail30, featureUsage, planes, cohorts, retention3,
        stickiness: active30.size ? Math.round((active7.size / active30.size) * 100) : 0,
      },
      revenue,
      opportunities,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to build dashboard' }, { status: 500 })
  }
}
