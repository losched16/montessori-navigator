# Family Alliance v1 — Launch QA Checklist

Operational checklist for the founder to run **after deployment**, in a real
browser with a real authenticated parent account. These are the checks that
cannot be automated in the development environment.

---

## 1. Production Smoke Test

Sign in as a parent with at least one child. Visit each surface and confirm it
loads, looks like one product, and has no console errors:

- [ ] **Home** (`/dashboard`) — greeting, hero insight, activities, Abigail card, growth, article, moment/prompt
- [ ] **My Child** (`/dashboard/children`) — all four tabs: Overview, Journey, Moments, Growth
- [ ] **Abigail** (`/dashboard/chat`) — empty state, history sheet (mobile), thread rail (desktop)
- [ ] **Explore** (`/dashboard/explore`) — topics, For [Child], Things to Try, Watch, Tomorrow's Child
- [ ] **Full Library** (`/dashboard/library`) — search, filters, pagination, open an article
- [ ] **Saved Guidance** (`/dashboard/memories`)
- [ ] **Milestones** (`/dashboard/milestones`) — load/initialize, toggle one
- [ ] **Montessori Learning** (`/dashboard/curriculum`) — open an area, toggle a skill
- [ ] **Development Guide** (`/dashboard/development`) — correct state for your child's age
- [ ] **Montessori at Home** (`/dashboard/environment`) — switch rooms
- [ ] **More** (`/dashboard/more`) — every row routes correctly; Sign Out works
- [ ] `/dashboard/journey` redirects to My Child → Journey

---

## 2. Live Abigail Test

Use this exact prompt:

> My 4-year-old melts down every morning when it's time to get dressed. What should I do?

Check the response:

- [ ] A direct answer comes **first** (not preamble)
- [ ] Answer is not excessively long (~150–350 words)
- [ ] **Try this** is one concrete, doable action
- [ ] **Why it helps** uses plain language before Montessori terminology
- [ ] Wording is non-diagnostic ("may", "one possibility" — never "this means")
- [ ] **What to notice** is a useful observation cue
- [ ] **Log a Moment** routes to My Child → Moments with the composer open
- [ ] **Save Guidance** works; item appears in Saved Guidance; **Open Conversation** loads this thread
- [ ] Activity/article attachments (if any) are relevant — conservative is fine, irrelevant is not
- [ ] Follow-up chips send and get sensible answers

---

## 3. Physical iPhone Safari

On a real device (not simulator):

- [ ] Page scrolling everywhere (no rubber-band weirdness under sheets)
- [ ] Bottom nav — safe-area padding above the home indicator
- [ ] Chat composer — keyboard opens without hiding the input
- [ ] Keyboard closes cleanly; composer returns above the bottom nav
- [ ] Sending a message scrolls smoothly to the reply
- [ ] BottomSheets (composer, child picker, filters, activity detail) open/close/trap focus
- [ ] Child picker switch takes effect on the current screen
- [ ] Explore carousels swipe with card snap
- [ ] ActivityDetailSheet scrolls internally on a long activity
- [ ] Full Library filter sheet applies filters

---

## 4. School/Admin Regression

Sign in as a school admin:

- [ ] School dashboard renders exactly as before
- [ ] Admin portal renders exactly as before
- [ ] Typography sizes unchanged (the legacy text-size bumps still apply outside the parent app)
- [ ] Gray text is still the darkened legacy color (not faded)
- [ ] Primary navigation works
- [ ] No `.mfa-app` styling leakage (no ivory canvas, serif headers, or purple accents appearing in school/admin)

---

## 5. Analytics Verification

Product events flow through `lib/analytics.ts` → GA4 (when
`NEXT_PUBLIC_GA_MEASUREMENT_ID` is set). Verify in **GA4 → Admin → DebugView**
(easiest: temporarily set `NEXT_PUBLIC_ANALYTICS_DEBUG=1` and watch the
browser console — every event logs as `[analytics] <name> {props}`).

| Action | Expected event | Key properties |
|---|---|---|
| Open Home | `home_viewed` | has_child, age_plane |
| Tap Ask Abigail card/chip/hero link | `home_abigail_clicked` | source: card/chip/hero |
| Open an activity card (any surface) | `activity_opened` | source, activity_category |
| Open Abigail | `abigail_viewed` | has_existing_thread |
| Send a message | `abigail_message_sent` | thread_state, topic (no text!) |
| Tap a follow-up chip | `abigail_followup_clicked` | topic |
| Tap Log a Moment under a response | `abigail_log_moment_clicked` | topic |
| Save a response | `guidance_saved` | topic |
| Open My Child / switch tab | `my_child_viewed` | tab |
| Open the moment composer | `moment_composer_opened` | source: home/abigail/my_child |
| Save a moment | `moment_logged` | has_type, has_curriculum_area, source (no text!) |
| Tap a development area | `growth_area_opened` | area |
| Save a level | `growth_level_updated` | area, previous_label, new_label |
| Toggle a milestone | `milestone_updated` | achieved, curriculum_area |
| Open Explore | `explore_viewed` | has_child |
| Open a topic | `explore_topic_opened` | topic key |
| Search (after typing settles) | `explore_search_used` | result_count, has_results (no query text!) |
| Open any search/feed result | `explore_result_opened` + the matching content event | item_kind, source_state |
| Open an article (Home/Abigail/Explore/Library) | `article_opened` | source, category |
| Open a DB resource | `resource_opened` | resource_type, source |
| Open a Tomorrow's Child issue | `tomorrows_child_opened` | issue_year, source |
| Switch child | `child_switched` | source_screen, previous/new age_plane |
| Open Saved Guidance | `saved_guidance_viewed` | item_count bucket |
| Tap Open Conversation | `guidance_open_conversation_clicked` | — |

Also verify NO event ever contains: a child's name, date of birth, chat text,
observation text, saved guidance content, search queries, or emails.

---

## 6. Setup notes

- Analytics is **off by default**. To enable: set `NEXT_PUBLIC_GA_MEASUREMENT_ID`
  (a GA4 web stream ID, `G-XXXXXXXXXX`) in the production environment and
  redeploy. Without it the app ships no analytics script and events no-op.
- `NEXT_PUBLIC_ANALYTICS_DEBUG=1` adds console logging of every event (safe to
  use in a staging deploy; remove for production).
