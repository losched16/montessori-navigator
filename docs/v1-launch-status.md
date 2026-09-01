# Montessori Family Alliance — v1 Launch Status

Verified 2026-09-01 (automated operational pass; see "Verification method" notes
per section — authenticated/physical checks are explicitly marked).

## Deployment

- **Production URL:** https://familyalliance.montessori.org
- **Platform:** Vercel — project `montessori-navigator` (team `clints-projects-2a091ff7`), `main` auto-deploys to Production
- **Production SHA:** `c718c0c` — verified from the live deployment's build log ("Cloning … Commit: c718c0c"); aliases confirmed on deployment `dpl_4wnBdpmjcw8DDa5yoYYk7wAbfff5` (Ready)
- **Status:** ✅ Production is running the exact v1 candidate commit

## Analytics

- **GA4 configured:** ❌ NOT configured
- **Measurement variable present:** `NEXT_PUBLIC_GA_MEASUREMENT_ID` is absent from Vercel Production env (verified via `vercel env ls production`); the GA script is correspondingly absent from served production HTML — analytics is safely dark by design
- **DebugView verified:** N/A until configured
- **Privacy check:** ✅ at code level (call-site audit at checkpoint); production request inspection N/A while GA4 is off
- **Debug mode:** `NEXT_PUBLIC_ANALYTICS_DEBUG` not present in production ✅

## Parent Product (production)

| Surface | Status | Notes |
|---|---|---|
| Marketing home `/` | PASS | 200, clean console, correct GA-absent state |
| Auth gate | PASS | `/dashboard/*` → 307 → `/auth/login` (200); no redirect loop |
| Login page | PASS | renders, clean console |
| Home `/dashboard` | BLOCKED | authenticated session required |
| My Child | BLOCKED | authenticated session required |
| Abigail | BLOCKED | authenticated session required |
| Explore | BLOCKED | authenticated session required |
| Full Library | BLOCKED | authenticated session required |
| Saved Guidance | BLOCKED | authenticated session required |
| Deep tools | BLOCKED | authenticated session required |
| `/dashboard/journey` redirect | PARTIAL | middleware auth-redirect verified; in-app redirect needs authenticated check |
| Static assets (TC covers, sitemap, robots) | PASS | 200; sitemap/robots emit correct production domain |
| Phase-5 build actually live | PASS | `:not(.mfa-app` CSS marker present in production stylesheet |

All BLOCKED rows were verified in pre-production emulation during Phases 1–5 +
the launch pass; production re-verification requires a signed-in parent account
(see docs/v1-launch-qa.md §1).

## School/Admin Regression

- **School:** BLOCKED — requires authenticated school account (checklist: docs/v1-launch-qa.md §4)
- **Admin:** BLOCKED — requires authenticated admin account

## Mobile

- **Physical iPhone:** NOT TESTED — no physical device available to the automated pass
- **Status:** MANUAL REQUIRED
- **Outstanding checks:** full list in docs/v1-launch-qa.md §3 (keyboard/composer, sheets, carousels, bottom-nav clearance)

## Abigail Live Test

- **Status:** BLOCKED — manual authenticated Abigail test required
- **Notes:** exact prompt + 10-point rubric in docs/v1-launch-qa.md §2. Not fabricated here.

## Analytics Events

- **Verified:** none in production (GA4 unconfigured — nothing fires, by design)
- **Manual confirmation required after GA4 setup:** home_viewed, abigail_viewed, abigail_message_sent, explore_viewed, explore_topic_opened, explore_search_used, article_opened, activity_opened, my_child_viewed, guidance_saved (full table: docs/v1-launch-qa.md §5)

## Launch Blockers

- **P0:** none found
- **P1:** GA4 measurement ID must be supplied — set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel Production, then **redeploy** (it is a build-time `NEXT_PUBLIC_*` var; the script only ships on a fresh build). Product launch itself is not blocked — analytics-informed decisions are.
- **P2:** `montessori-navigator.com` (fallback BASE_URL in robots/sitemap and a dead DNS record) — harmless in production because `NEXT_PUBLIC_APP_URL` is set; tidy the fallback or the DNS later.

## Launch Verdict

**READY AFTER MANUAL QA**

Code and infrastructure checks pass: production runs the exact v1 SHA, public
surfaces are healthy, the auth gate works, and analytics is correctly dark
until configured. What remains cannot be truthfully automated:

1. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel Production → redeploy →
   verify events in GA4 DebugView (docs/v1-launch-qa.md §5)
2. Signed-in production smoke test of all parent surfaces (§1)
3. One live Abigail conversation with the exact test prompt (§2)
4. Physical iPhone Safari pass (§3)
5. School + admin regression click-through (§4)
