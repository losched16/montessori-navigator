# Navigator Partner Dashboard: Build Spec

Handoff for Claude Code. Pairs with the interactive mockup ("Navigator Partner Dashboard" artifact), which shows the layout, charts, and sample data.

**Stack:** Next.js 14 (App Router), Supabase (Postgres + RLS), Tailwind + shadcn/ui, Recharts for charts. Route: `/admin/dashboard`. Visual system: Family Alliance tokens (navy primary, warm off-white, Fraunces + Karla, plane-of-development colors).

> **Schema note:** Table and column names below are assumptions. I could not reach the Navigator Supabase project from this session (only Bench Coach is connected). Map each one to the real tables before writing the migrations.

---

## 1. Who uses it

| Audience | Tabs they live in | Question it answers |
|---|---|---|
| Foundation partners (Tim, leadership) | Overview, Revenue | Is this working, is it growing, where is the upside? |
| Internal ops team | Schools, Parent engagement | Which schools and parents need a nudge this week? |

Everyone sees every tab. Order and labels steer partners to Overview first.

## 2. Tabs and contents

**Overview (partners)**
- One-paragraph summary built from the numbers (schools, activation rate, active-parent growth, biggest lever).
- KPI row with 12-month sparklines: Partner schools · Parents invited · Active parents (30d) · MRR.
- Adoption funnel: Enrolled families → Invited → Activated → Active monthly → Active weekly, with the conversion rate between each step.
- Needs attention: Not-launched schools, At-risk schools, renewals within 60 days that aren't healthy.
- Growth over time: invited, activated, active-30d lines by month.
- Growth opportunities (4 cards): families not yet invited, invited-never-activated, school leads from direct parents, plan upgrade potential.

**Schools (ops)**
- Health counts (Healthy / Under-invited / At risk / Not launched).
- Sortable, searchable, filterable school table: health, plan, families, invited, activation %, active 30d, 30-day trend, renewal date.
- New schools per month (bar).
- Renewals in the next 90 days.

**Parent engagement**
- KPIs: weekly active parents, stickiness (WAU/MAU), Abigail questions (30d), 3-month retention.
- Weekly active parents, 26 weeks.
- Feature usage (% of 30-day actives using each feature).
- Active parents by plane of development (0–3, 3–6, 6–9, 9–12, 12–18).
- Retention heatmap by activation month.

**Revenue**
- KPIs: MRR, run rate, school license MRR (with avg per school), direct parent subscribers.
- MRR by month, stacked: school licenses + parent subscriptions (one axis).
- Licenses by plan.

**Metric definitions** — the table in §4, rendered in-app so partners and the team read numbers the same way.

## 3. Assumed data model

```
schools            id, name, city, state, enrolled_families, created_at
school_licenses    id, school_id, plan ('essentials'|'growth'|'campus'), status, monthly_amount_cents,
                   started_at, renews_at, cancelled_at, stripe_subscription_id
parent_invites     id, school_id, email (lowercased), sent_at, accepted_at, parent_id
parents            id (auth.users), school_id nullable, source ('school'|'direct'), created_at
children           id, parent_id, birthdate, school_name (free text for direct parents)
subscriptions      id, parent_id, status, monthly_amount_cents, started_at, cancelled_at, source
activity_events    id, parent_id, event_type, created_at
                   event_type in ('abigail_question','milestone_logged','activity_opened',
                                  'report_viewed','journey_map_viewed','home_env_updated','eval_tool_used')
```

If `activity_events` doesn't exist yet, it's the one table worth adding now. Everything in the engagement tab depends on it. Log from server actions / API routes, not the client.

## 4. Metric definitions

| Metric | Definition |
|---|---|
| Partner schools | Licenses with `status = 'active'` and `cancelled_at is null`. |
| Enrolled families | `schools.enrolled_families`; school reports it at onboarding, update each term. |
| Parents invited | `count(distinct lower(email))` from `parent_invites`. Resends don't double count. |
| Activated | Invites with `accepted_at` set **and** at least one child profile. |
| Active parents (30d / 7d) | Parents with ≥1 `activity_events` row in the window. Logins alone don't count. |
| Stickiness | Weekly active ÷ monthly active. |
| Direct parents | `parents.source = 'direct'` with an active subscription. |
| MRR | Active license `monthly_amount_cents` + active direct subscriptions; annual ÷ 12. |
| Retention (month N) | Of parents activated in month M, share with activity in month M+N. |
| School leads | Direct parents whose `children.school_name` doesn't match a licensed school. |

**School health** (first match wins):
1. **Not launched** — active license, zero invites.
2. **At risk** — activation < 45%, or 30-day actives down ≥ 15% vs prior 30 days.
3. **Under-invited** — invited < 50% of enrolled families.
4. **Healthy** — none of the above.

Keep thresholds in one config object so they can be tuned without a deploy.

## 5. SQL (views / RPCs)

Put these in a `reporting` schema. Expose to the app only via `security definer` functions that check an admin role.

```sql
create schema if not exists reporting;

-- Per-school rollup: feeds the Schools table, health, funnel, and opportunity cards
create or replace view reporting.school_rollup as
with inv as (
  select school_id,
         count(distinct lower(email))                                  as invited,
         count(distinct parent_id) filter (where accepted_at is not null) as activated
  from parent_invites group by school_id
),
act as (
  select p.school_id,
         count(distinct e.parent_id) filter (where e.created_at >= now() - interval '30 days')  as active_30,
         count(distinct e.parent_id) filter (where e.created_at >= now() - interval '60 days'
                                              and e.created_at <  now() - interval '30 days') as active_prev_30,
         count(distinct e.parent_id) filter (where e.created_at >= now() - interval '7 days')   as active_7
  from activity_events e join parents p on p.id = e.parent_id
  where p.school_id is not null
  group by p.school_id
)
select s.id, s.name, s.city, s.state, s.enrolled_families,
       l.plan, l.monthly_amount_cents, l.started_at, l.renews_at,
       coalesce(inv.invited,0)   as invited,
       coalesce(inv.activated,0) as activated,
       coalesce(act.active_30,0) as active_30,
       coalesce(act.active_7,0)  as active_7,
       case when coalesce(act.active_prev_30,0) = 0 then null
            else round(100.0*(act.active_30 - act.active_prev_30)/act.active_prev_30) end as trend_pct,
       case
         when coalesce(inv.invited,0) = 0 then 'not_launched'
         when inv.activated::numeric/nullif(inv.invited,0) < 0.45 then 'at_risk'
         when act.active_prev_30 > 0
              and (act.active_30 - act.active_prev_30)::numeric/act.active_prev_30 <= -0.15 then 'at_risk'
         when inv.invited::numeric/nullif(s.enrolled_families,0) < 0.5 then 'under_invited'
         else 'healthy'
       end as health
from schools s
join school_licenses l on l.school_id = s.id and l.status = 'active' and l.cancelled_at is null
left join inv on inv.school_id = s.id
left join act on act.school_id = s.id;

-- Monthly series for sparklines, growth chart, and MRR chart (last 12 months)
create or replace view reporting.monthly_series as
with months as (
  select generate_series(date_trunc('month', now()) - interval '11 months',
                         date_trunc('month', now()), interval '1 month') as m
)
select m as month,
  (select count(*) from school_licenses l
     where l.started_at < m + interval '1 month'
       and (l.cancelled_at is null or l.cancelled_at >= m + interval '1 month')) as schools,
  (select count(*) from school_licenses l
     where date_trunc('month', l.started_at) = m) as new_schools,
  (select count(distinct lower(email)) from parent_invites where sent_at < m + interval '1 month') as invited_cum,
  (select count(*) from parent_invites where accepted_at < m + interval '1 month') as activated_cum,
  (select count(distinct parent_id) from activity_events
     where created_at >= m and created_at < m + interval '1 month') as active_in_month,
  (select coalesce(sum(monthly_amount_cents),0)/100 from school_licenses l
     where l.started_at < m + interval '1 month'
       and (l.cancelled_at is null or l.cancelled_at >= m + interval '1 month')) as school_mrr,
  (select coalesce(sum(monthly_amount_cents),0)/100 from subscriptions s
     where s.source = 'direct' and s.started_at < m + interval '1 month'
       and (s.cancelled_at is null or s.cancelled_at >= m + interval '1 month')) as parent_mrr
from months;

-- Weekly actives, 26 weeks
create or replace view reporting.weekly_active as
select date_trunc('week', created_at) as week, count(distinct parent_id) as wau
from activity_events
where created_at >= date_trunc('week', now()) - interval '25 weeks'
group by 1 order by 1;

-- Feature usage among 30-day actives
create or replace view reporting.feature_usage_30d as
with a as (select distinct parent_id from activity_events where created_at >= now() - interval '30 days')
select e.event_type,
       round(100.0*count(distinct e.parent_id)/nullif((select count(*) from a),0)) as pct
from activity_events e
where e.created_at >= now() - interval '30 days'
group by 1 order by 2 desc;

-- Retention cohorts
create or replace view reporting.retention_cohorts as
with c as (
  select parent_id, date_trunc('month', accepted_at) as cohort
  from parent_invites where accepted_at is not null
),
m as (
  select distinct parent_id, date_trunc('month', created_at) as active_month from activity_events
)
select c.cohort,
       (extract(year from age(m.active_month, c.cohort))*12 + extract(month from age(m.active_month, c.cohort)))::int as month_n,
       count(distinct m.parent_id) as retained,
       (select count(*) from c c2 where c2.cohort = c.cohort) as cohort_size
from c join m using (parent_id)
where m.active_month > c.cohort
group by 1,2;

-- School leads from direct parents
create or replace view reporting.school_leads as
select lower(trim(ch.school_name)) as school_name_norm,
       count(distinct p.id) as parents
from parents p join children ch on ch.parent_id = p.id
where p.source = 'direct' and ch.school_name is not null
  and lower(trim(ch.school_name)) not in (select lower(trim(name)) from schools)
group by 1 order by 2 desc;
```

Plane of development: bucket `children.birthdate` into 0–3, 3–6, 6–9, 9–12, 12–18 using `age(now(), birthdate)`; count distinct 30-day-active parents per bucket (a parent with two children counts in both).

## 6. Performance and refresh

- Start with plain views. When `activity_events` passes ~1M rows, convert `school_rollup` and `monthly_series` to materialized views refreshed nightly with `pg_cron`, and add indexes on `activity_events (created_at)` and `(parent_id, created_at)`.
- Show "Data as of <timestamp>" in the header from the last refresh.

## 7. Access

- New role `admin` / `partner` in `profiles.role`. Partners get read-only access to the dashboard; ops gets the same plus school actions later (resend invites, mark contacted).
- No parent PII on the partner view beyond school names. Never show parent emails in this dashboard.

## 8. Build order

1. `activity_events` table + logging in the 6–7 key actions.
2. `reporting` views + admin-guarded RPCs.
3. Overview tab (KPIs, funnel, attention list, growth chart).
4. Schools tab (table, health filters, renewals).
5. Revenue tab (wire to Stripe-backed `subscriptions`; parent subscriptions can show as 0 until Stripe goes live).
6. Engagement tab (needs a few weeks of event data to look meaningful).
7. Later: weekly email digest of the Overview to partners; "Mark contacted" actions on the Needs-attention list.

## 9. Open questions

- Where does `enrolled_families` come from, and who updates it?
- Is an annual school license billed through Stripe, or invoiced manually? (Affects MRR source.)
- Do partners get their own logins, or a shared read-only link?
- Should Growth Suite / GHL pipeline data (schools in sales conversations) appear as a "Pipeline" card on Overview?
