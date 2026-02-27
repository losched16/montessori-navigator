# Montessori Navigator

**A Prepared Environment for Parents** — AI-powered Montessori guidance, curriculum planning, and child development tracking. Built by the Montessori Foundation.

## What This Is

Montessori Navigator is a subscription-based parent intelligence platform that helps families implement Montessori principles at home. It combines Foundation-curated content with AI personalization to provide:

- **AI Montessori Guide** — Conversational assistant grounded in authentic Montessori pedagogy, with 400+ line knowledge base covering all four planes of development, sensitive periods, scope & sequence, discipline framework, and parent coaching
- **Intelligent Dashboard** — Personalized insights, sensitive period alerts, observation prompts, and smart next-action recommendations
- **Child Development Dashboard** — Track 10 curriculum areas with observation logging
- **Milestone Tracking** — 150+ pre-loaded developmental milestones with one-tap achievement
- **Learning Plan Generator** — AI creates daily/weekly/focus plans based on your child's stage
- **School Evaluation Toolkit** — Tour evaluation, AI debrief, credential guide, school comparison
- **Progress Reports** — Formatted developmental summaries for portfolios and conferences
- **Journey Map** — Growth celebration with observation streaks, seasonal reflections, and growth moments
- **Home Environment Tracker** — Room-by-room setup with material tracking
- **Activity Library** — 30+ curated Montessori activities with presentation steps
- **Readiness Assessment** — Public lead-generation tool with AI-powered analysis
- **Account Settings** — Profile editing, child management, password change, data export, account deletion

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **AI**: Anthropic Claude API (Sonnet)
- **Auth**: Supabase Auth
- **Deployment**: Vercel

## Setup

### Prerequisites

- Node.js 18+
- A Supabase account (free tier works)
- An Anthropic API key ($10-20 in credits)
- A GitHub account
- A Vercel account (free tier works)

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/montessori-navigator.git
cd montessori-navigator
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Name it `montessori-navigator`
3. Wait for it to provision
4. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key

### 3. Run Database Schema

1. In Supabase, go to **SQL Editor**
2. Open `supabase-schema.sql` from this repo
3. Paste and run the entire file
4. Then open `seed-activities.sql` and run it (this populates the activity library)

### 4. Configure Authentication

1. In Supabase, go to **Authentication → Settings**
2. Under **Email Auth**, ensure it's enabled
3. (Optional) Disable "Confirm email" for easier development
4. Under **URL Configuration**, set Site URL to `http://localhost:3000`
5. Add `http://localhost:3000/auth/callback` to Redirect URLs

### 5. Get Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add $10-20 in credits (the app uses Claude Sonnet which is cost-efficient)

### 6. Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
ANTHROPIC_API_KEY=sk-ant-your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the marketing landing page.

### 8. Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Add the same environment variables in Vercel's project settings
4. Deploy

Update your Supabase auth settings to include your Vercel URL:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth/callback`

## Project Structure

```
montessori-navigator/
├── app/
│   ├── (marketing)/page.tsx    # Landing/sales page
│   ├── auth/
│   │   ├── login/page.tsx      # Login
│   │   ├── signup/page.tsx     # Signup
│   │   └── callback/route.ts   # OAuth callback
│   ├── onboarding/page.tsx     # 4-step onboarding wizard
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout + nav
│   │   ├── page.tsx            # Dashboard home
│   │   ├── chat/page.tsx       # AI Montessori Guide
│   │   ├── children/page.tsx   # Child development tracking
│   │   ├── plans/page.tsx      # Learning plan generator
│   │   ├── reports/page.tsx    # Progress report generator
│   │   ├── schools/page.tsx    # School evaluation toolkit
│   │   ├── notes/page.tsx      # Family notes
│   │   └── environment/page.tsx # Home environment tracker
│   ├── api/
│   │   ├── chat/route.ts       # AI chat endpoint
│   │   ├── learning-plan/route.ts
│   │   ├── observations/route.ts
│   │   ├── school-evaluation/route.ts
│   │   └── progress-report/route.ts
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Root (marketing or redirect)
│   └── globals.css
├── lib/
│   ├── supabase.ts             # DB client, types, helpers
│   ├── anthropic.ts            # AI engine + system prompt
│   └── utils.ts                # Utility functions
├── supabase-schema.sql         # Database schema
├── seed-activities.sql         # Activity library data
└── middleware.ts               # Auth middleware
```

## Key Architecture Decisions

**AI Context Injection**: Every AI interaction loads the full family context — parent profile, all children with development levels and traits, recent observations, home environment materials, and family notes. This is assembled in `lib/supabase.ts` (`getFamilyContext()`) and injected into the system prompt in `lib/anthropic.ts`.

**Memory System**: The AI suggests memory items after each conversation (parent preferences, child observations, family notes). High-confidence suggestions are auto-saved. This means the AI gets smarter about your family over time.

**Row Level Security**: All data is isolated per parent via Supabase RLS policies. No parent can see another parent's data. The `activities` table is public read (it's the shared library).

**School Data Privacy**: The school evaluation toolkit stores data per parent. School licensing (future) will show aggregate engagement only, never individual family data.

## Phase Roadmap

**Phase 1 (Current)**: AI Guide, Child Dashboard, Learning Plans, Reports, School Toolkit, Onboarding, Parent subscriptions.

**Phase 2**: Curated marketplace, Tomorrow's Child archive integration, Stripe subscriptions, school admin portal.

**Phase 3**: Mobile app, multi-language support, advanced analytics, community features.

## Guardrails

- **Philosophically grounded**: Authentic Montessori pedagogy only
- **Calm over noisy**: No social feeds, comments, or gamification
- **Commercially restrained**: Editorial integrity over revenue
- **School-protective**: Complements schools, never competes
- **Parent-empowering**: Builds independence, not dependency
- **Privacy-first**: Family data ownership, aggregate-only for schools

## License

Proprietary — Montessori Foundation
