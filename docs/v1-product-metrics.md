# Family Alliance v1 — Product Metrics Plan

What we monitor first, built entirely from the events in `lib/analytics.ts`.
No sensitive family content is ever collected — every metric below derives
from behavioral events with categorical properties (age planes, topic keys,
categories, booleans, counts).

The goal: the next product decision is based on what parents actually do,
not opinion.

---

## Activation (within a parent's first session)

| Metric | From |
|---|---|
| % who send an Abigail message | `abigail_message_sent` / new users |
| % who open an activity | `activity_opened` / new users |
| % who open My Child | `my_child_viewed` / new users |
| % who log a Moment | `moment_logged` / new users |

Watch: which of the four surfaces first-time parents reach, and which one
converts a visit into an action.

## Engagement (weekly, per active parent)

- Abigail messages sent (`abigail_message_sent`)
- Activities opened (`activity_opened`, split by `source`)
- Articles/resources opened (`article_opened`, `resource_opened`)
- Moments logged (`moment_logged`, split by `source`)
- Explore topics opened (`explore_topic_opened`, split by `topic`)
- Explore searches (`explore_search_used`, watch `has_results` rate)
- Growth updates (`growth_level_updated`, `milestone_updated`)

## Conversion loops (the product's core bets)

| Loop | Measure |
|---|---|
| Home → Abigail | `home_abigail_clicked` → `abigail_message_sent` in-session |
| Abigail → action | `abigail_message_sent` → `activity_opened` (source=abigail) or `abigail_log_moment_clicked` |
| Abigail → Moment | `abigail_log_moment_clicked` → `moment_logged` (source=abigail) |
| Explore → content | `explore_viewed` → `explore_result_opened` / `activity_opened` (source=explore*) |
| Explore → Abigail | topic view → `abigail_message_sent` in-session |
| Growth → repeat visit | `growth_level_updated` → return session within 7 days |

## Retention (derived in GA4 — never fabricated client-side)

- D1 / D7 / D30 retention from first-seen cohorts
- Weekly active parents
- Returning-parent rate (2+ active weeks per month)
- Behavior correlates: compare 7-day retention of parents who did vs. didn't
  (a) send an Abigail message, (b) log a Moment, (c) open My Child in week 1

GA4's device identity is sufficient for v1; no PII-based identity is sent.

---

## The ten questions this instrumentation answers

1. **Do parents use Abigail?** — `abigail_message_sent` volume + % of actives
2. **Does Abigail lead to action?** — Abigail→action loop above
3. **Do parents return to My Child?** — `my_child_viewed` frequency per parent, by tab
4. **Are Moments actually being logged?** — `moment_logged` volume + source mix
5. **Which Explore topics get used?** — `explore_topic_opened` by topic key
6. **What kinds of resources get opened?** — `article_opened`/`resource_opened`/`tomorrows_child_opened` by category/type
7. **Does Home route parents deeper?** — `home_abigail_clicked` + `activity_opened` (source=home) + `article_opened` (source=home) per `home_viewed`
8. **What correlates with 7-day retention?** — retention cohort splits above
9. **Do multi-child families switch?** — `child_switched` volume + source_screen
10. **Which major surface is ignored?** — compare `home_viewed` / `my_child_viewed` / `abigail_viewed` / `explore_viewed` per active parent

---

## Guardrails

- Do NOT add "Popular/Trending/Most Used" labels to Explore until weeks of
  real `explore_result_opened` data exist.
- Do NOT add properties containing names, birth dates, message/observation/
  guidance text, or search queries — see the privacy contract at the top of
  `lib/analytics.ts`.
- Retention is computed in the analytics platform from event timestamps;
  never emit synthetic "day_7_return"-style client events.
