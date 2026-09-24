'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'

// Partner dashboard — live data from /api/admin/dashboard.
// Layout follows docs/partner-dashboard/mockup.html; definitions follow
// docs/partner-dashboard/spec.md.

type Health = 'Healthy' | 'Under-invited' | 'At risk' | 'Not launched'
interface SchoolRow {
  id: string; name: string; state: string | null
  billing: 'paid' | 'free_code' | 'comped' | 'trial' | 'past_due' | 'legacy'
  tier: string; annualValue: number
  enrolled: number; invited: number; activated: number; active30: number; active7: number
  trendPct: number | null; health: Health; healthReason: string
  renewsAt: string | null; createdAt: string
}
interface Data {
  generatedAt: string
  monthLabels: string[]; monthLong: string[]
  totals: { schools: number; enrolled: number; invited: number; activated: number; active30School: number; active7School: number; active30: number; active7: number; activePrev30: number; parents: number; schoolParents: number }
  series: { schools: number[]; newSchools: number[]; invitedCum: number[]; activatedCum: number[]; activeInMonth: number[]; schoolMrr: number[]; parentMrr: number[] }
  schools: SchoolRow[]
  engagement: {
    wau: { label: string; count: number }[]; abigail30: number; stickiness: number
    featureUsage: { key: string; label: string; pct: number }[]
    planes: { k: string; label: string; count: number }[]
    cohorts: { label: string; size: number; values: (number | null)[] }[]
    retention3: { pct: number | null; cohort: string } | null
  }
  revenue: {
    stripeOk: boolean; mrr: number; mrrPrev: number; schoolMrr: number; parentMrr: number
    payingSchools: number; paidFamilies: number; directSubscribers: number; directMonthly: number; directAnnual: number
    tiers: { tier: string; schools: number; families: number; annual: number }[]
    free: { schools: number; comped: number; freeCode: number; families: number; conversionAnnual: number }
    trialSchools: number; legacySchools?: number
    pastDue: { count: number; schools: number; parents: number; annual: number }
  }
  opportunities: { uninvited: number; underInvitedSchools: number; dormant: number; leadParents: number; leadSchools: number; conversionAnnual: number; freeSchools: number }
}

const fmt = (n: number) => Math.round(n).toLocaleString('en-US')
const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US')
const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) + '%' : '–')
const HEALTH_CHIP: Record<Health, string> = { Healthy: 'good', 'Under-invited': 'warn', 'At risk': 'crit', 'Not launched': 'info' }
const BILLING_LABEL: Record<SchoolRow['billing'], string> = { paid: 'Paid', free_code: 'Free code', comped: 'Comped', trial: 'Trial', past_due: 'Past due', legacy: 'Legacy' }
const TABS = [
  { id: 'overview', label: 'Overview', for: 'Partners' },
  { id: 'schools', label: 'Schools', for: 'Ops' },
  { id: 'engagement', label: 'Parent engagement' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'definitions', label: 'Metric definitions' },
]

export default function PartnerDashboard() {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)

  const load = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/admin/dashboard', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load')
      setData(json); setError('')
    } catch (e: any) {
      setError(e.message || 'Failed to load')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
    try { const t = localStorage.getItem('pd-tab'); if (t && TABS.some(x => x.id === t)) setTab(t) } catch {}
  }, [])
  const pick = (id: string) => { setTab(id); try { localStorage.setItem('pd-tab', id) } catch {} }

  return (
    <div className="pd">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="top">
        <div className="brand">
          <span className="eyebrow">Montessori Foundation · Family Alliance</span>
          <h1>Partner Dashboard</h1>
        </div>
        <div className="meta">
          <span className="pill live">● Live data</span>
          {data && <span className="pill">As of {new Date(data.generatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>}
          <button className="pill btn" onClick={load} disabled={refreshing}>{refreshing ? 'Refreshing…' : 'Refresh'}</button>
        </div>
      </header>

      <nav className="tabs" role="tablist">
        {TABS.map(t => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className="tab" onClick={() => pick(t.id)}>
            {t.label}{t.for && <span className="for">{t.for}</span>}
          </button>
        ))}
      </nav>

      {error && <div className="card errorcard">Couldn&apos;t load the dashboard: {error}</div>}
      {!data && !error && <Loading />}
      {data && tab === 'overview' && <Overview d={data} go={pick} />}
      {data && tab === 'schools' && <Schools d={data} />}
      {data && tab === 'engagement' && <Engagement d={data} />}
      {data && tab === 'revenue' && <Revenue d={data} />}
      {data && tab === 'definitions' && <Definitions d={data} />}
    </div>
  )
}

function Loading() {
  return (
    <section className="panel">
      <div className="grid g4">{[0, 1, 2, 3].map(i => <div key={i} className="card skel" style={{ height: 130 }} />)}</div>
      <div className="grid g32"><div className="card skel" style={{ height: 320 }} /><div className="card skel" style={{ height: 320 }} /></div>
    </section>
  )
}

/* ================================ OVERVIEW ================================ */
function Overview({ d, go }: { d: Data; go: (t: string) => void }) {
  const T = d.totals
  const s = d.series
  const a30Chg = T.activePrev30 > 0 ? (T.active30 - T.activePrev30) / T.activePrev30 : null
  const newThisMonth = s.newSchools[11]
  const direct30 = Math.max(0, T.active30 - T.active30School)

  const attention = useMemo(() => {
    const items: { c: string; k: string; t: string; d: string; n?: string }[] = []
    d.schools.filter(x => x.billing === 'past_due').forEach(x =>
      items.push({ c: 'crit', k: 'Past due', t: x.name, d: 'Payment failed at renewal. Reach out before Stripe cancels it.' }))
    d.schools.filter(x => x.health === 'At risk').sort((a, b) => a.activated / Math.max(1, a.invited) - b.activated / Math.max(1, b.invited)).forEach(x =>
      items.push({ c: 'crit', k: 'At risk', t: x.name, d: x.healthReason + '.', n: pct(x.activated, x.invited) }))
    d.schools.filter(x => x.health === 'Not launched' && x.billing !== 'past_due').forEach(x =>
      items.push({ c: 'info', k: 'Not launched', t: x.name, d: `Joined ${shortDate(x.createdAt)}. No families invited yet.` }))
    d.schools.filter(x => x.renewsAt && daysUntil(x.renewsAt) <= 60 && daysUntil(x.renewsAt) >= 0 && x.health !== 'Healthy').forEach(x => {
      if (!items.some(i => i.t === x.name)) items.push({ c: 'warn', k: 'Renewal', t: x.name, d: `Renews ${shortDate(x.renewsAt!)} · ${x.health.toLowerCase()}.` })
    })
    return items
  }, [d])

  const steps = [
    { k: 'Enrolled families', s: 'reported by partner schools', v: T.enrolled },
    { k: 'Invited', s: 'school sent an invite', v: T.invited },
    { k: 'Activated', s: 'joined their school', v: T.activated },
    { k: 'Active monthly', s: 'used it in last 30 days', v: T.active30School },
    { k: 'Active weekly', s: 'used it in last 7 days', v: T.active7School },
  ]

  return (
    <section className="panel">
      <p className="summary">
        Family Alliance is running at <b>{T.schools} partner schools</b> reaching {fmt(T.enrolled)} families.{' '}
        <b>{fmt(T.invited)}</b> parents have been invited and <b>{pct(T.activated, T.invited)}</b> have joined.{' '}
        {a30Chg !== null
          ? <>Active parents {a30Chg >= 0 ? 'grew' : 'fell'} <b className={a30Chg >= 0 ? 'up' : 'down'}>{Math.abs(Math.round(a30Chg * 100))}%</b> over the last 30 days. </>
          : <><b>{fmt(T.active30)}</b> parents were active in the last 30 days. </>}
        {d.opportunities.uninvited > 0
          ? <>The biggest lever right now is invites: <b>{fmt(d.opportunities.uninvited)}</b> families at partner schools haven&apos;t been invited yet.</>
          : <>The biggest lever right now is activation: <b>{fmt(d.opportunities.dormant)}</b> invited parents haven&apos;t joined yet.</>}
      </p>

      <div className="grid g4">
        <Kpi label="Partner schools" value={fmt(T.schools)} delta={newThisMonth ? `+${newThisMonth}` : undefined} good note={newThisMonth ? 'joined this month' : 'active today'} spark={s.schools} />
        <Kpi label="Parents invited" value={fmt(T.invited)} delta={T.enrolled ? pct(T.invited, T.enrolled) : undefined} note="of enrolled families" spark={s.invitedCum} />
        <Kpi label="Active parents (30 days)" value={fmt(T.active30)} delta={a30Chg !== null ? `${a30Chg >= 0 ? '+' : ''}${Math.round(a30Chg * 100)}%` : undefined} good={a30Chg === null || a30Chg >= 0} note={`vs prior 30 days · ${fmt(direct30)} direct`} spark={s.activeInMonth} />
        <Kpi label="Monthly recurring revenue" value={money(d.revenue.mrr)} note={`${d.revenue.free.schools} schools on free access`} spark={s.schoolMrr.map((v, i) => v + s.parentMrr[i])} />
      </div>

      <div className="grid g32">
        <div className="card">
          <h2>Adoption funnel</h2>
          <p className="sub">Families at partner schools, from enrollment to weekly use</p>
          <Funnel steps={steps} />
        </div>
        <div className="card">
          <h2>Needs attention</h2>
          <p className="sub">Schools the team should reach out to this week</p>
          {attention.length ? (
            <ul className="alist">
              {attention.slice(0, 8).map((it, i) => (
                <li key={i}><span className={`chip ${it.c}`}>{it.k}</span><div><div className="t">{it.t}</div><div className="d">{it.d}</div></div><span className="n tnum">{it.n || ''}</span></li>
              ))}
            </ul>
          ) : <p className="empty">Nothing needs attention. Every school is launched and on track.</p>}
          {attention.length > 8 && <button className="linkbtn" onClick={() => go('schools')}>See all {attention.length} in Schools →</button>}
        </div>
      </div>

      <div className="card">
        <h2>Growth over time</h2>
        <p className="sub">Cumulative parents invited and joined, and parents active each month</p>
        <LineChart
          labels={d.monthLabels} tipLabels={d.monthLong}
          series={[
            { name: 'Invited', values: s.invitedCum, color: 'var(--navy-2)', dash: '5 4' },
            { name: 'Joined', values: s.activatedCum, color: 'var(--navy)', endLabel: true },
            { name: 'Active in month', values: s.activeInMonth, color: 'var(--gold)', area: true, endLabel: true },
          ]}
        />
      </div>

      <h3 className="section-title">Growth opportunities</h3>
      <div className="grid g4">
        <Opp big={fmt(d.opportunities.uninvited)} t="Families not yet invited" d={`At today's join rate that's about ${fmt(d.opportunities.uninvited * (T.invited ? T.activated / T.invited : 0))} more parents, with no new schools needed.`} a={`Invite drive with ${d.opportunities.underInvitedSchools} under-invited schools`} />
        <Opp big={fmt(d.opportunities.dormant)} t="Invited, never joined" d="Parents who got an invite but haven't created their account. A short reminder sequence usually recovers a share." a="Send reminder emails" />
        <Opp big={fmt(d.opportunities.leadParents)} t="School leads from direct parents" d={`Direct parents who named their child's school. They span ${d.opportunities.leadSchools} schools that aren't partners yet.`} a="Hand the list to school outreach" />
        <Opp big={money(d.opportunities.conversionAnnual)} t="Free schools to convert" d={`${d.opportunities.freeSchools} schools are on comped or free-code access. At $12 per family that's this much a year when they renew as paid.`} a="Plan the 27/28 renewal push" />
      </div>
    </section>
  )
}

/* ================================ SCHOOLS ================================= */
type SortKey = 'name' | 'health' | 'billing' | 'enrolled' | 'invited' | 'actRate' | 'active30' | 'trendPct' | 'renewsAt'
function Schools({ d }: { d: Data }) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'All' | Health>('All')
  const [sort, setSort] = useState<{ k: SortKey; dir: 1 | -1 }>({ k: 'health', dir: 1 })
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    d.schools.forEach(s => { c[s.health] = (c[s.health] || 0) + 1 })
    return c
  }, [d])
  const order: Health[] = ['Not launched', 'At risk', 'Under-invited', 'Healthy']
  const val = (s: SchoolRow, k: SortKey): number | string => {
    switch (k) {
      case 'health': return order.indexOf(s.health)
      case 'actRate': return s.invited ? s.activated / s.invited : -1
      case 'trendPct': return s.trendPct ?? -999
      case 'renewsAt': return s.renewsAt ? new Date(s.renewsAt).getTime() : Infinity
      case 'name': return s.name.toLowerCase()
      case 'billing': return BILLING_LABEL[s.billing]
      default: return s[k]
    }
  }
  const rows = d.schools
    .filter(s => (filter === 'All' || s.health === filter) && (!q || `${s.name} ${s.state || ''}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => { const va = val(a, sort.k), vb = val(b, sort.k); return (va > vb ? 1 : va < vb ? -1 : 0) * sort.dir })
  const cols: { k: SortKey; l: string; num?: boolean }[] = [
    { k: 'name', l: 'School' }, { k: 'health', l: 'Health' }, { k: 'billing', l: 'Access' },
    { k: 'enrolled', l: 'Families', num: true }, { k: 'invited', l: 'Invited', num: true }, { k: 'actRate', l: 'Joined', num: true },
    { k: 'active30', l: 'Active 30d', num: true }, { k: 'trendPct', l: 'Trend', num: true }, { k: 'renewsAt', l: 'Renews', num: true },
  ]
  const clickSort = (k: SortKey, num?: boolean) => setSort(p => p.k === k ? { k, dir: (p.dir * -1) as 1 | -1 } : { k, dir: num ? -1 : 1 })
  const renewals = d.schools.filter(s => s.renewsAt && daysUntil(s.renewsAt) >= 0 && daysUntil(s.renewsAt) <= 90)
    .sort((a, b) => new Date(a.renewsAt!).getTime() - new Date(b.renewsAt!).getTime())

  return (
    <section className="panel">
      <div className="grid g4">
        <Kpi label="Healthy" value={String(counts['Healthy'] || 0)} note="on track" />
        <Kpi label="Under-invited" value={String(counts['Under-invited'] || 0)} note="fewer than half of families invited" />
        <Kpi label="At risk" value={String(counts['At risk'] || 0)} note="low join rate or falling use" />
        <Kpi label="Not launched" value={String(counts['Not launched'] || 0)} note="active, no invites sent" />
      </div>
      <div className="card">
        <h2>Partner schools</h2>
        <p className="sub">Click a column to sort. Joined is the share of invited families who created their account.</p>
        <div className="toolbar">
          <input type="search" placeholder="Search schools or states" value={q} onChange={e => setQ(e.target.value)} aria-label="Search schools" />
          <div className="seg" role="group" aria-label="Filter by health">
            {(['All', 'Healthy', 'Under-invited', 'At risk', 'Not launched'] as const).map(h => (
              <button key={h} aria-pressed={filter === h} onClick={() => setFilter(h)}>{h}{h !== 'All' ? ` ${counts[h] || 0}` : ''}</button>
            ))}
          </div>
        </div>
        <div className="tscroll">
          <table className="schooltable">
            <thead><tr>{cols.map(c => (
              <th key={c.k} className={c.num ? 'num' : ''} aria-sort={sort.k === c.k ? (sort.dir > 0 ? 'ascending' : 'descending') : undefined} onClick={() => clickSort(c.k, c.num)} tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clickSort(c.k, c.num) } }}>{c.l}</th>
            ))}</tr></thead>
            <tbody>
              {rows.length ? rows.map(s => (
                <tr key={s.id}>
                  <td><div className="nm">{s.name}</div><div className="loc">{s.state || 'State not set'}</div></td>
                  <td><span className={`chip ${HEALTH_CHIP[s.health]}`} title={s.healthReason}>{s.health}</span></td>
                  <td><span className="plan">{BILLING_LABEL[s.billing]}</span>{s.billing === 'paid' || s.billing === 'past_due' ? <div className="loc">{s.tier}</div> : null}</td>
                  <td className="num">{fmt(s.enrolled)}</td>
                  <td className="num">{fmt(s.invited)} <span className="minibar"><i style={{ width: `${Math.min(100, s.enrolled ? (s.invited / s.enrolled) * 100 : 0)}%` }} /></span></td>
                  <td className="num">{s.invited ? pct(s.activated, s.invited) : '–'}</td>
                  <td className="num">{fmt(s.active30)}</td>
                  <td className="num">{s.trendPct === null ? '–' : <span className={s.trendPct >= 0 ? 'up' : 'down'}>{s.trendPct > 0 ? '+' : ''}{s.trendPct}%</span>}</td>
                  <td className="num">{s.renewsAt ? new Date(s.renewsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '–'}</td>
                </tr>
              )) : <tr><td colSpan={9} className="empty">No schools match. Clear the search or pick another filter.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid g2">
        <div className="card">
          <h2>New schools per month</h2>
          <p className="sub">Partner schools by the month they joined</p>
          <BarChart labels={d.monthLabels} tipLabels={d.monthLong} series={[{ name: 'New schools', values: d.series.newSchools, color: 'var(--navy)' }]} h={220} />
        </div>
        <div className="card">
          <h2>Renewals in the next 90 days</h2>
          <p className="sub">Sorted by renewal date, with current usage</p>
          {renewals.length ? (
            <ul className="alist">{renewals.map(s => (
              <li key={s.id}><span className={`chip ${HEALTH_CHIP[s.health]}`}>{s.health}</span><div><div className="t">{s.name}</div><div className="d">{BILLING_LABEL[s.billing]} · {fmt(s.enrolled)} families · {fmt(s.active30)} active parents</div></div><span className="n tnum small">{shortDate(s.renewsAt!)}</span></li>
            ))}</ul>
          ) : <p className="empty">No renewals in the next 90 days.</p>}
        </div>
      </div>
    </section>
  )
}

/* =============================== ENGAGEMENT =============================== */
function Engagement({ d }: { d: Data }) {
  const e = d.engagement
  const planeColors = ['var(--p1)', 'var(--p2)', 'var(--p3)', 'var(--p4)', 'var(--p5)']
  const planeMax = Math.max(1, ...e.planes.map(p => p.count))
  return (
    <section className="panel">
      <div className="grid g4">
        <Kpi label="Weekly active parents" value={fmt(d.totals.active7)} note="last 7 days" spark={e.wau.map(w => w.count)} />
        <Kpi label="Stickiness" value={`${e.stickiness}%`} note="weekly ÷ monthly actives" />
        <Kpi label="Questions asked of Abigail" value={fmt(e.abigail30)} note="last 30 days" />
        <Kpi label="3-month retention" value={e.retention3?.pct != null ? `${e.retention3.pct}%` : '–'} note={e.retention3 ? `of parents who joined in ${e.retention3.cohort}` : 'needs 3 months of data'} />
      </div>
      <div className="card">
        <h2>Weekly active parents</h2>
        <p className="sub">Parents who did something meaningful in the week: asked Abigail, logged a Moment, marked a milestone, or updated growth</p>
        <LineChart labels={e.wau.map(w => w.label)} series={[{ name: 'Weekly active parents', values: e.wau.map(w => w.count), color: 'var(--navy)', area: true, endLabel: true }]} every={4} />
      </div>
      <div className="grid g2">
        <div className="card">
          <h2>What parents use</h2>
          <p className="sub">Share of parents active in the last 30 days who used each feature</p>
          <HBars items={e.featureUsage.map(f => ({ k: f.label, v: f.pct }))} max={100} fmtV={v => `${v}%`} />
        </div>
        <div className="card">
          <h2>Active parents by plane of development</h2>
          <p className="sub">Grouped by the age of each child on the parent&apos;s profile (a parent can count in two planes)</p>
          <HBars items={e.planes.map((p, i) => ({ k: p.k, s: p.label, v: p.count, c: planeColors[i] }))} max={planeMax} fmtV={v => fmt(v)} />
        </div>
      </div>
      <div className="card">
        <h2>Parent retention by signup month</h2>
        <p className="sub">Share of each month&apos;s new parents still active N months later</p>
        <div className="tscroll">
          <table className="heat">
            <thead><tr><th className="rowh">Joined</th><th>Parents</th>{Array.from({ length: 8 }, (_, i) => <th key={i}>Month {i + 1}</th>)}</tr></thead>
            <tbody>{e.cohorts.map(c => (
              <tr key={c.label}>
                <th className="rowh">{c.label}</th><td>{c.size}</td>
                {c.values.map((v, i) => {
                  if (v === null || c.size === 0) return <td key={i} />
                  const a = 0.1 + Math.min(1, v / 80) * 0.8
                  return <td key={i} style={{ background: `rgba(var(--heat),${a.toFixed(2)})`, color: a > 0.5 ? 'var(--surface)' : 'var(--ink)' }} title={`${c.label} cohort, month ${i + 1}: ${v}% still active`}>{v}%</td>
                })}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

/* ================================ REVENUE ================================= */
function Revenue({ d }: { d: Data }) {
  const r = d.revenue
  const tierMax = Math.max(1, ...r.tiers.map(t => t.annual))
  return (
    <section className="panel">
      {!r.stripeOk && <div className="card errorcard">Stripe couldn&apos;t be reached, so revenue figures show $0. Try Refresh.</div>}
      <div className="grid g4">
        <Kpi label="MRR" value={money(r.mrr)} note="school sign-ups + direct parents" />
        <Kpi label="Annual run rate" value={money(r.mrr * 12)} note="MRR × 12" />
        <Kpi label="School sign-ups" value={money(r.schoolMrr)} note={`MRR · ${r.payingSchools} paying schools · ${fmt(r.paidFamilies)} families`} />
        <Kpi label="Direct parents" value={money(r.parentMrr)} note={`MRR · ${r.directSubscribers} subscribers (${r.directMonthly} monthly, ${r.directAnnual} annual)`} />
      </div>
      <div className="card">
        <h2>Monthly recurring revenue</h2>
        <p className="sub">Paying subscriptions at month end. Excludes free, comped, trialing and past-due.</p>
        <BarChart
          labels={d.monthLabels} tipLabels={d.monthLong} yFmt={v => (v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : `$${v}`)}
          series={[{ name: 'School sign-ups', values: d.series.schoolMrr, color: 'var(--navy)' }, { name: 'Direct parents', values: d.series.parentMrr, color: 'var(--gold)' }]}
        />
      </div>
      <div className="grid g4">
        <Kpi label="Free-access schools" value={fmt(r.free.schools)} note={`${r.free.comped} comped · ${r.free.freeCode} on free codes`} />
        <Kpi label="Families on free access" value={fmt(r.free.families)} note={`worth ${money(r.free.conversionAnnual)}/yr at $12 per family`} />
        <Kpi label="Schools in trial" value={fmt(r.trialSchools)} note={r.legacySchools ? `not yet paying · plus ${r.legacySchools} legacy (pre-Stripe-move)` : 'not yet paying'} />
        <Kpi label="Past due" value={fmt(r.pastDue.count)} note={`${r.pastDue.schools} schools · ${r.pastDue.parents} parents · ${money(r.pastDue.annual)}/yr at risk`} bad={r.pastDue.count > 0} />
      </div>
      <div className="grid g2">
        <div className="card">
          <h2>School revenue by tier</h2>
          <p className="sub">Paying schools only, annual value</p>
          <HBars items={r.tiers.map(t => ({ k: t.tier, s: `${t.schools} schools · ${fmt(t.families)} families`, v: t.annual }))} max={tierMax} fmtV={money} />
        </div>
        <div className="card">
          <h2>How revenue is counted</h2>
          <p className="sub">Two streams, nothing else</p>
          <ul className="alist">
            <li><span className="chip info">Schools</span><div><div className="t">Schools pay for their families</div><div className="d">$12 per family per year for Digital, $25 for Digital + Print. Parents they invite pay nothing.</div></div><span /></li>
            <li><span className="chip info">Parents</span><div><div className="t">Direct parents pay for themselves</div><div className="d">$8 per month or $59 per year. Annual plans count as ÷ 12 in MRR.</div></div><span /></li>
            <li><span className="chip warn">Excluded</span><div><div className="t">Free, comped, trial and past-due</div><div className="d">Shown separately above so free seats and failing payments stay visible without inflating revenue.</div></div><span /></li>
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ============================== DEFINITIONS =============================== */
function Definitions({ d }: { d: Data }) {
  const H = [
    ['info', 'Not launched', 'Active school, but no families have been invited.'],
    ['crit', 'At risk', 'Under 45% of invited families have joined, or active parents fell 15% or more versus the prior 30 days.'],
    ['warn', 'Under-invited', 'Fewer than half of the school’s families have been invited.'],
    ['good', 'Healthy', 'None of the above.'],
  ]
  const DEFS: [string, string, ReactNode][] = [
    ['Partner schools', 'Comped schools, plus schools whose live Stripe subscription is active, trialing or past due. Legacy schools from the previous Stripe account count only if families have joined. Test and internal schools are excluded.', <code key="a">schools</code>],
    ['Enrolled families', 'Family count the school gave at sign-up. Denominator for the invite rate.', <code key="b">schools.family_count</code>],
    ['Parents invited', 'Unique emails a school has invited. Resends don’t count twice.', <code key="c">invitations</code>],
    ['Joined (activated)', 'Families that accepted and are enrolled at their school.', <code key="d">school_families</code>],
    ['Active parents (30 days)', 'Parents who asked Abigail a question, logged a Moment, marked a milestone, or updated growth levels in the last 30 days. Logins alone don’t count, nor do the starting levels set during onboarding. Staff and admin accounts are excluded.', 'chat, observations, milestones, growth levels'],
    ['Weekly active parents', 'Same rule over the last 7 days.', 'same'],
    ['Stickiness', 'Weekly active ÷ monthly active. Above 50% means parents use it as a habit.', 'derived'],
    ['MRR', 'Paying school subscriptions (families × $12 or $25 ÷ 12) plus direct parents ($8/month, or $59/year ÷ 12). Excludes free, comped, trial and past-due.', 'Stripe'],
    ['Free-access schools', 'Comped schools plus schools on a 100%-off code. Full partners for adoption, $0 revenue.', <><code key="e">is_comped</code> + Stripe</>],
    ['Retention by month', 'Of parents who signed up in a month, the share active N months later.', 'activity + parents'],
    ['School leads', 'Direct parents who named a school that isn’t a partner yet.', <code key="f">children.school_name</code>],
  ]
  return (
    <section className="panel">
      <div className="card">
        <h2>Metric definitions</h2>
        <p className="sub">One definition per number, so partners and the team read the dashboard the same way</p>
        <div className="tscroll"><table className="defs"><thead><tr><th>Metric</th><th>Definition</th><th>Source</th></tr></thead>
          <tbody>{DEFS.map(([a, b, c]) => <tr key={a}><td>{a}</td><td>{b}</td><td>{c}</td></tr>)}</tbody></table></div>
      </div>
      <div className="card">
        <h2>School health rules</h2>
        <p className="sub">Applied in this order; a school gets the first status that matches</p>
        <ul className="alist">{H.map(([c, k, t]) => <li key={k}><span className={`chip ${c}`}>{k}</span><div><div className="d ink">{t}</div></div><span /></li>)}</ul>
      </div>
      <p className="note">Data refreshes every time the dashboard loads (last: {new Date(d.generatedAt).toLocaleString()}).</p>
    </section>
  )
}

/* ================================ PIECES ================================== */
function Kpi({ label, value, delta, good, note, spark, bad }: { label: string; value: string; delta?: string; good?: boolean; note: string; spark?: number[]; bad?: boolean }) {
  return (
    <div className={`card kpi ${bad ? 'badkpi' : ''}`}>
      <span className="label">{label}</span>
      <span className="val tnum">{value}</span>
      <span className="delta">{delta && <b className={good === undefined ? '' : good ? 'up' : 'down'}>{delta} </b>}{note}</span>
      {spark && spark.length > 1 && <Sparkline vals={spark} />}
    </div>
  )
}
function Sparkline({ vals }: { vals: number[] }) {
  const W = 200, H = 42, p = 3
  const max = Math.max(...vals), min = Math.min(...vals)
  const pts = vals.map((v, i) => [p + (i * (W - 2 * p)) / (vals.length - 1), H - p - ((v - min) / (max - min || 1)) * (H - 2 * p)])
  const dd = pts.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`${dd} L${pts[pts.length - 1][0]} ${H} L${pts[0][0]} ${H} Z`} fill="var(--navy)" fillOpacity={0.1} />
      <path d={dd} fill="none" stroke="var(--navy)" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  )
}
function Funnel({ steps }: { steps: { k: string; s: string; v: number }[] }) {
  const top = Math.max(1, steps[0].v, ...steps.map(s => s.v))
  return (
    <div className="funnel">
      {steps.map((st, i) => {
        const w = (st.v / top) * 100
        return (
          <div key={st.k}>
            <div className="fstep">
              <div className="fl">{st.k}<small>{st.s}</small></div>
              <div className="fbar"><i style={{ width: `${w}%`, opacity: 1 - i * 0.13 }} /><span className={w < 14 ? 'out' : ''} style={w < 14 ? { left: `calc(${w}% + 8px)` } : undefined}>{fmt(st.v)}</span></div>
            </div>
            {i < steps.length - 1 && <div className="fconv"><b>{pct(steps[i + 1].v, st.v)}</b> move to the next step</div>}
          </div>
        )
      })}
    </div>
  )
}
function Opp({ big, t, d, a }: { big: string; t: string; d: string; a: string }) {
  return <div className="opp"><span className="big tnum">{big}</span><span className="t">{t}</span><span className="d">{d}</span><span className="act">{a} →</span></div>
}
function HBars({ items, max, fmtV }: { items: { k: string; s?: string; v: number; c?: string }[]; max: number; fmtV: (v: number) => string }) {
  if (!items.length) return <p className="empty">No data yet.</p>
  return (
    <div className="hbars">{items.map(it => (
      <div className="hb" key={it.k}>
        <span>{it.k}{it.s && <><br /><span className="hbs">{it.s}</span></>}</span>
        <div className="track"><div className="fill" style={{ width: `${max ? (it.v / max) * 100 : 0}%`, background: it.c || 'var(--navy)' }} /></div>
        <span className="v">{fmtV(it.v)}</span>
      </div>
    ))}</div>
  )
}

function niceStep(v: number) { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p }
function ticks(max: number, count = 4) { const step = niceStep(Math.max(max, 1) / count); const top = Math.ceil(Math.max(max, 1) / step) * step; const t: number[] = []; for (let v = 0; v <= top + 1e-9; v += step) t.push(Math.round(v * 100) / 100); return t }
const short = (n: number) => (n >= 1000 ? (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k' : String(n))

interface Series { name: string; values: number[]; color: string; dash?: string; area?: boolean; endLabel?: boolean }
function LineChart({ labels, tipLabels, series, every = 1, yFmt }: { labels: string[]; tipLabels?: string[]; series: Series[]; every?: number; yFmt?: (v: number) => string }) {
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null)
  const W = 760, H = 280, m = { t: 14, r: 16, b: 30, l: 48 }
  const tk = ticks(Math.max(...series.flatMap(s => s.values), 1))
  const ymax = tk[tk.length - 1]
  const n = labels.length
  const x = (i: number) => m.l + (i * (W - m.l - m.r)) / Math.max(1, n - 1)
  const y = (v: number) => H - m.b - (v / ymax) * (H - m.t - m.b)
  const move = (ev: React.PointerEvent<SVGRectElement>) => {
    const r = (ev.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect()
    const px = ((ev.clientX - r.left) / r.width) * W
    const i = Math.max(0, Math.min(n - 1, Math.round((px - m.l) / ((W - m.l - m.r) / Math.max(1, n - 1)))))
    setHover({ i, x: ev.clientX, y: ev.clientY })
  }
  return (
    <div className="chart">
      <div className="legend">{series.map(s => <span key={s.name}><i style={{ background: s.color }} />{s.name}</span>)}</div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={series.map(s => s.name).join(', ')}>
        <g className="axis">
          {tk.map(t => <g key={t}><line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} className={t ? 'grid-line' : 'base-line'} /><text x={m.l - 8} y={y(t) + 4} textAnchor="end">{yFmt ? yFmt(t) : short(t)}</text></g>)}
          {labels.map((l, i) => ((i % every === 0 && n - 1 - i >= every * 0.6) || i === n - 1) ? <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>{l}</text> : null)}
        </g>
        {series.map(s => {
          const dd = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
          return (
            <g key={s.name}>
              {s.area && <path d={`${dd} L${x(n - 1)} ${y(0)} L${x(0)} ${y(0)} Z`} fill={s.color} fillOpacity={0.1} />}
              <path d={dd} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeDasharray={s.dash} />
              <circle cx={x(n - 1)} cy={y(s.values[n - 1])} r={4.5} fill={s.color} stroke="var(--surface)" strokeWidth={2} />
              {s.endLabel && <text x={x(n - 1) - 8} y={y(s.values[n - 1]) - 10} textAnchor="end" className="endlabel">{fmt(s.values[n - 1])}</text>}
            </g>
          )
        })}
        {hover && <line x1={x(hover.i)} x2={x(hover.i)} y1={m.t} y2={H - m.b} stroke="var(--line-2)" />}
        {hover && series.map(s => <circle key={s.name} cx={x(hover.i)} cy={y(s.values[hover.i])} r={4} fill={s.color} stroke="var(--surface)" strokeWidth={2} />)}
        <rect x={m.l} y={m.t} width={W - m.l - m.r} height={H - m.t - m.b} fill="transparent" onPointerMove={move} onPointerDown={move} onPointerLeave={() => setHover(null)} />
      </svg>
      {hover && <Tip x={hover.x} y={hover.y}><b>{(tipLabels || labels)[hover.i]}</b>{series.map(s => <div className="row" key={s.name}><span>{s.name}</span><span>{yFmt ? yFmt(s.values[hover.i]) : fmt(s.values[hover.i])}</span></div>)}</Tip>}
    </div>
  )
}
function BarChart({ labels, tipLabels, series, h = 260, yFmt }: { labels: string[]; tipLabels?: string[]; series: Series[]; h?: number; yFmt?: (v: number) => string }) {
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null)
  const W = 760, H = h, m = { t: 14, r: 12, b: 30, l: 52 }
  const totals = labels.map((_, i) => series.reduce((a, s) => a + (s.values[i] || 0), 0))
  const tk = ticks(Math.max(...totals, 1))
  const ymax = tk[tk.length - 1]
  const n = labels.length, band = (W - m.l - m.r) / n, bw = Math.min(40, band * 0.56)
  const y = (v: number) => H - m.b - (v / ymax) * (H - m.t - m.b)
  const f = yFmt || ((v: number) => fmt(v))
  return (
    <div className="chart">
      {series.length > 1 && <div className="legend">{series.map(s => <span key={s.name}><i style={{ background: s.color }} />{s.name}</span>)}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={series.map(s => s.name).join(', ')}>
        <g className="axis">
          {tk.map(t => <g key={t}><line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} className={t ? 'grid-line' : 'base-line'} /><text x={m.l - 8} y={y(t) + 4} textAnchor="end">{yFmt ? yFmt(t) : short(t)}</text></g>)}
          {labels.map((l, i) => <text key={i} x={m.l + band * i + band / 2} y={H - 8} textAnchor="middle">{l}</text>)}
        </g>
        {labels.map((_, i) => {
          const cx = m.l + band * i + band / 2
          let acc = 0
          return (
            <g key={i} opacity={hover && hover.i !== i ? 0.55 : 1}>
              {series.map((s, j) => {
                const v = s.values[i] || 0
                if (!v) return null
                const y0 = y(acc), y1 = y(acc + v); acc += v
                return <rect key={j} x={cx - bw / 2} y={y1} width={bw} height={Math.max(0, y0 - y1 - (j ? 1.5 : 0))} rx={j === series.length - 1 ? 3 : 0} fill={s.color} />
              })}
              <rect x={m.l + band * i} y={m.t} width={band} height={H - m.t - m.b} fill="transparent"
                onPointerMove={ev => setHover({ i, x: ev.clientX, y: ev.clientY })} onPointerDown={ev => setHover({ i, x: ev.clientX, y: ev.clientY })} onPointerLeave={() => setHover(null)} />
            </g>
          )
        })}
      </svg>
      {hover && <Tip x={hover.x} y={hover.y}><b>{(tipLabels || labels)[hover.i]}</b>{series.map(s => <div className="row" key={s.name}><span>{s.name}</span><span>{f(s.values[hover.i] || 0)}</span></div>)}{series.length > 1 && <div className="row"><span><b>Total</b></span><span><b>{f(totals[hover.i])}</b></span></div>}</Tip>}
    </div>
  )
}
function Tip({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  const left = typeof window !== 'undefined' ? Math.min(window.innerWidth - 250, x + 14) : x
  return <div className="tip" style={{ left: Math.max(8, left), top: Math.max(8, y - 70) }}>{children}</div>
}

function daysUntil(iso: string) { return (new Date(iso).getTime() - Date.now()) / 86_400_000 }
function shortDate(iso: string) { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Karla:wght@400;500;600;700&display=swap');
.pd{
  --bg:#f5f2eb; --surface:#fffdf8; --surface-2:#f0ece2; --line:#e3ddcf; --line-2:#d3cbb9;
  --ink:#18203a; --ink-2:#4a5167; --muted:#7a7f90;
  --navy:#1f3a68; --navy-2:#3a5a92; --gold:#b98522;
  --good:#2e7a4d; --good-bg:#e3f1e7; --warn:#a86b12; --warn-bg:#faeed7; --crit:#b53d33; --crit-bg:#f8e2df; --info:#3a5a92; --info-bg:#e4e9f2;
  --p1:#d0807f; --p2:#d09a2e; --p3:#5f9150; --p4:#4f8fc0; --p5:#7465bd; --heat:31,58,104;
  --shadow:0 1px 2px rgba(24,32,58,.05),0 4px 16px rgba(24,32,58,.05);
  --serif:"Fraunces",Georgia,"Times New Roman",serif; --sans:"Karla",-apple-system,"Segoe UI",Roboto,sans-serif;
  background:var(--bg); color:var(--ink); font-family:var(--sans); font-size:15px; line-height:1.5;
  margin:-16px; padding:0 clamp(16px,2.4vw,32px) 48px; min-height:100vh;
}
@media (min-width:640px){.pd{margin:-24px}}
.pd *{box-sizing:border-box}
.pd .tnum{font-variant-numeric:tabular-nums}
.pd header.top{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px;padding:24px 0 16px}
.pd .brand{display:flex;flex-direction:column;gap:2px}
.pd .eyebrow{font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:600}
.pd h1{font-family:var(--serif);font-weight:500;font-size:clamp(26px,3.4vw,36px);line-height:1.1;margin:0;letter-spacing:-.01em}
.pd .meta{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.pd .pill{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:999px;font-size:12px;font-weight:600;border:1px solid var(--line-2);background:var(--surface);color:var(--ink-2);white-space:nowrap}
.pd .pill.live{background:var(--good-bg);color:var(--good);border-color:transparent}
.pd .pill.btn{cursor:pointer;font-family:var(--sans)} .pd .pill.btn:hover{border-color:var(--navy);color:var(--navy)} .pd .pill.btn:disabled{opacity:.6;cursor:default}
.pd nav.tabs{position:sticky;top:64px;z-index:5;background:var(--bg);display:flex;gap:4px;border-bottom:1px solid var(--line);overflow-x:auto;scrollbar-width:none;margin-bottom:22px}
.pd .tab{appearance:none;background:none;border:0;border-bottom:2px solid transparent;padding:12px 14px 11px;font:600 14px var(--sans);color:var(--ink-2);cursor:pointer;white-space:nowrap}
.pd .tab:hover{color:var(--ink)} .pd .tab[aria-selected="true"]{color:var(--ink);border-bottom-color:var(--navy)}
.pd .tab .for{font-weight:500;color:var(--muted);font-size:12px;margin-left:6px}
.pd button:focus-visible,.pd input:focus-visible,.pd th:focus-visible{outline:2px solid var(--navy);outline-offset:2px;border-radius:6px}
.pd section.panel{display:flex;flex-direction:column;gap:20px}
.pd .grid{display:grid;gap:20px}
.pd .g4{grid-template-columns:repeat(4,minmax(0,1fr))} .pd .g2{grid-template-columns:repeat(2,minmax(0,1fr))} .pd .g32{grid-template-columns:minmax(0,3fr) minmax(0,2fr)}
@media (max-width:1100px){.pd .g4{grid-template-columns:repeat(2,minmax(0,1fr))}.pd .g32,.pd .g2{grid-template-columns:minmax(0,1fr)}}
@media (max-width:520px){.pd .g4{grid-template-columns:minmax(0,1fr)}}
.pd .card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:20px;box-shadow:var(--shadow);min-width:0}
.pd .card h2{font-family:var(--serif);font-weight:500;font-size:19px;margin:0;line-height:1.25}
.pd .card .sub{color:var(--muted);font-size:13px;margin:2px 0 14px}
.pd .errorcard{background:var(--crit-bg);color:var(--crit);border-color:transparent;font-weight:600}
.pd .skel{background:linear-gradient(90deg,var(--surface) 0%,var(--surface-2) 50%,var(--surface) 100%);background-size:200% 100%;animation:pdsk 1.4s infinite}
@keyframes pdsk{0%{background-position:200% 0}100%{background-position:-200% 0}}
.pd .summary{font-family:var(--serif);font-size:clamp(18px,2vw,22px);line-height:1.45;margin:0;max-width:66ch;font-weight:400}
.pd .summary b{font-weight:600}
.pd .up{color:var(--good)} .pd .down{color:var(--crit)}
.pd .kpi{display:flex;flex-direction:column;gap:6px}
.pd .kpi .label{font-size:13px;color:var(--ink-2);font-weight:600}
.pd .kpi .val{font-family:var(--serif);font-size:34px;font-weight:500;line-height:1;letter-spacing:-.01em}
.pd .kpi .delta{font-size:13px;color:var(--muted)} .pd .kpi .delta b{font-weight:700}
.pd .kpi svg{width:100%;height:42px;display:block;margin-top:6px}
.pd .badkpi{border-color:var(--crit)} .pd .badkpi .val{color:var(--crit)}
.pd .funnel{display:flex;flex-direction:column;gap:12px}
.pd .fstep{display:grid;grid-template-columns:minmax(120px,190px) 1fr;gap:14px;align-items:center}
.pd .fl{font-size:14px;font-weight:600;line-height:1.25} .pd .fl small{display:block;font-weight:400;color:var(--muted);font-size:12px}
.pd .fbar{position:relative;height:34px;border-radius:0 6px 6px 0;background:var(--surface-2)}
.pd .fbar i{position:absolute;inset:0 auto 0 0;background:var(--navy);border-radius:0 6px 6px 0;display:block}
.pd .fbar span{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-weight:700;font-size:14px;color:#fff;font-variant-numeric:tabular-nums}
.pd .fbar span.out{color:var(--ink)}
.pd .fconv{font-size:12px;color:var(--ink-2);padding-left:calc(min(190px,40%) + 14px);margin-top:6px} .pd .fconv b{color:var(--ink)}
@media (max-width:560px){.pd .fstep{grid-template-columns:1fr;gap:4px}.pd .fconv{padding-left:0}}
.pd .alist{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.pd .alist li{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:start;padding:12px 0;border-top:1px solid var(--line)}
.pd .alist li:first-child{border-top:0;padding-top:4px}
.pd .alist .t{font-weight:600;font-size:14px} .pd .alist .d{font-size:13px;color:var(--ink-2)} .pd .alist .d.ink{color:var(--ink)}
.pd .alist .n{font-family:var(--serif);font-size:20px;font-weight:500;white-space:nowrap} .pd .alist .n.small{font-family:var(--sans);font-size:14px;font-weight:700}
.pd .chip{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap}
.pd .chip::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
.pd .chip.good{background:var(--good-bg);color:var(--good)} .pd .chip.warn{background:var(--warn-bg);color:var(--warn)}
.pd .chip.crit{background:var(--crit-bg);color:var(--crit)} .pd .chip.info{background:var(--info-bg);color:var(--info)}
.pd .empty{color:var(--muted);font-size:14px;margin:4px 0}
.pd .linkbtn{appearance:none;border:0;background:none;color:var(--navy);font:600 13px var(--sans);cursor:pointer;padding:10px 0 0}
.pd .opp{display:flex;flex-direction:column;gap:8px;padding:16px;border:1px solid var(--line);border-radius:12px;background:var(--surface)}
.pd .opp .big{font-family:var(--serif);font-size:30px;font-weight:500;line-height:1}
.pd .opp .t{font-weight:700;font-size:14px} .pd .opp .d{font-size:13px;color:var(--ink-2)}
.pd .opp .act{margin-top:auto;font-size:13px;font-weight:600;color:var(--navy)}
.pd .section-title{font-family:var(--serif);font-size:22px;font-weight:500;margin:8px 0 0}
.pd .chart{position:relative;width:100%} .pd .chart svg{width:100%;height:auto;display:block;overflow:visible}
.pd .axis text{fill:var(--muted);font:12px var(--sans);font-variant-numeric:tabular-nums}
.pd .grid-line{stroke:var(--line);stroke-width:1} .pd .base-line{stroke:var(--line-2);stroke-width:1}
.pd .endlabel{fill:var(--ink);font:700 12px var(--sans)}
.pd .legend{display:flex;flex-wrap:wrap;gap:14px;font-size:13px;color:var(--ink-2);margin-bottom:8px}
.pd .legend span{display:inline-flex;align-items:center;gap:6px} .pd .legend i{width:10px;height:10px;border-radius:3px;display:inline-block}
.pd .tip{position:fixed;pointer-events:none;z-index:50;background:var(--ink);color:var(--bg);padding:8px 10px;border-radius:8px;font-size:12.5px;line-height:1.4;box-shadow:0 6px 20px rgba(0,0,0,.18);min-width:170px;max-width:240px}
.pd .tip .row{display:flex;justify-content:space-between;gap:14px;font-variant-numeric:tabular-nums}
.pd .hbars{display:flex;flex-direction:column;gap:10px}
.pd .hb{display:grid;grid-template-columns:minmax(120px,190px) 1fr 70px;gap:10px;align-items:center;font-size:14px}
.pd .hb .hbs{font-size:12px;color:var(--muted)}
.pd .hb .track{height:14px;background:var(--surface-2);border-radius:0 4px 4px 0}
.pd .hb .fill{height:100%;border-radius:0 4px 4px 0}
.pd .hb .v{text-align:right;font-weight:700;font-variant-numeric:tabular-nums}
.pd .toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:14px}
.pd .toolbar input{flex:1 1 220px;min-width:0;font:14px var(--sans);color:var(--ink);background:var(--surface);border:1px solid var(--line-2);border-radius:8px;padding:8px 10px}
.pd .seg{display:inline-flex;border:1px solid var(--line-2);border-radius:8px;overflow:hidden;flex-wrap:wrap}
.pd .seg button{appearance:none;border:0;background:var(--surface);color:var(--ink-2);font:600 13px var(--sans);padding:8px 12px;cursor:pointer;border-left:1px solid var(--line)}
.pd .seg button:first-child{border-left:0} .pd .seg button[aria-pressed="true"]{background:var(--navy);color:var(--surface)}
.pd .tscroll{overflow-x:auto;margin-inline:-20px;padding-inline:20px}
.pd table{border-collapse:collapse;width:100%;font-size:14px}
.pd table.schooltable{min-width:900px}
.pd th{text-align:left;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:700;padding:8px 10px;border-bottom:1px solid var(--line-2);white-space:nowrap;cursor:pointer;user-select:none}
.pd th.num,.pd td.num{text-align:right}
.pd th[aria-sort="ascending"]::after{content:" ↑"} .pd th[aria-sort="descending"]::after{content:" ↓"}
.pd td{padding:10px;border-bottom:1px solid var(--line);font-variant-numeric:tabular-nums;vertical-align:middle}
.pd td .nm{font-weight:600} .pd td .loc{font-size:12px;color:var(--muted)}
.pd tr:hover td{background:var(--surface-2)}
.pd .minibar{display:inline-block;width:56px;height:6px;background:var(--surface-2);border-radius:3px;vertical-align:middle;margin-left:8px;overflow:hidden}
.pd .minibar i{display:block;height:100%;background:var(--navy)}
.pd .plan{font-size:13px;font-weight:600;color:var(--ink-2)}
.pd .heat{border-collapse:separate;border-spacing:3px;min-width:640px;font-size:13px}
.pd .heat th{cursor:default;text-transform:none;letter-spacing:0;font-size:12px;border:0;padding:4px 6px;text-align:center}
.pd .heat th.rowh{text-align:left;white-space:nowrap}
.pd .heat td{border:0;text-align:center;padding:8px 4px;border-radius:4px;font-weight:600;font-size:12.5px}
.pd .heat tr:hover td{background:inherit}
.pd table.defs{min-width:720px} .pd .defs td{vertical-align:top} .pd .defs td:first-child{font-weight:700;white-space:nowrap}
.pd .defs th{cursor:default}
.pd .defs code{font-size:12.5px;background:var(--surface-2);padding:1px 5px;border-radius:4px}
.pd .note{font-size:13px;color:var(--ink-2)}
`
