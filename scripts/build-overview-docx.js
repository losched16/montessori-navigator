/**
 * Generate the Family Alliance Overview as a polished .docx for sharing
 * with partners and schools.
 *
 * Run: node scripts/build-overview-docx.js
 * Output: docs/family-alliance-overview.docx
 */
const fs = require('fs')
const path = require('path')
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, ExternalHyperlink,
  TabStopType, TabStopPosition, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, PageOrientation,
} = require('docx')

// Brand colors
const PLUM = '1a0e2e'
const PURPLE = '4a2c82'
const SOFT_PURPLE = '7b5ea7'
const LAVENDER_BG = 'F4EEFB'
const TEAL = '2E8B8B'
const GRAY = '5c4a7e'
const LINE = 'CCCCCC'

// US Letter
const PAGE_WIDTH = 12240
const PAGE_HEIGHT = 15840
const MARGIN = 1440
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN  // 9360 DXA

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

const runText = (text, opts = {}) => new TextRun({ text, ...opts })

const para = (text, opts = {}) => new Paragraph({
  spacing: { after: 160 },
  children: [runText(text)],
  ...opts,
})

const heading1 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 480, after: 240 },
  children: [runText(text, { bold: true, color: PURPLE, size: 32 })],
})

const heading2 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 360, after: 200 },
  children: [runText(text, { bold: true, color: PLUM, size: 26 })],
})

const heading3 = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 240, after: 120 },
  children: [runText(text, { bold: true, color: PURPLE, size: 22 })],
})

const eyebrow = (text) => new Paragraph({
  spacing: { after: 80 },
  children: [runText(text, { bold: true, color: SOFT_PURPLE, size: 18 })],
})

const bullet = (text) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { after: 80 },
  children: [runText(text)],
})

// Bullet that supports inline mixed runs (label + description)
const bulletMixed = (children) => new Paragraph({
  numbering: { reference: 'bullets', level: 0 },
  spacing: { after: 80 },
  children,
})

const numbered = (text) => new Paragraph({
  numbering: { reference: 'numbers', level: 0 },
  spacing: { after: 80 },
  children: [runText(text)],
})

const numberedMixed = (children) => new Paragraph({
  numbering: { reference: 'numbers', level: 0 },
  spacing: { after: 80 },
  children,
})

const link = (text, url) => new ExternalHyperlink({
  link: url,
  children: [runText(text, { color: PURPLE, underline: {} })],
})

const featureBlock = (title, description) => [
  new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [runText(title, { bold: true, color: PLUM, size: 22 })],
  }),
  new Paragraph({
    spacing: { after: 160 },
    children: [runText(description)],
  }),
]

// Horizontal rule via paragraph border
const divider = () => new Paragraph({
  border: {
    bottom: { color: LINE, space: 1, style: BorderStyle.SINGLE, size: 6 },
  },
  spacing: { before: 240, after: 240 },
  children: [],
})

// Pricing comparison table — 3 columns
const pricingTable = () => {
  const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: LINE }
  const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder }
  const cellMargins = { top: 100, bottom: 100, left: 140, right: 140 }
  const colWidths = [3000, 3180, 3180]

  const headerCell = (text) => new TableCell({
    borders,
    width: { size: colWidths[0], type: WidthType.DXA },
    margins: cellMargins,
    shading: { fill: PURPLE, type: ShadingType.CLEAR, color: 'auto' },
    children: [new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [runText(text, { bold: true, color: 'FFFFFF', size: 20 })],
    })],
  })

  const labelCell = (text) => new TableCell({
    borders,
    width: { size: colWidths[0], type: WidthType.DXA },
    margins: cellMargins,
    shading: { fill: LAVENDER_BG, type: ShadingType.CLEAR, color: 'auto' },
    children: [new Paragraph({ children: [runText(text, { bold: true, color: PLUM, size: 20 })] })],
  })

  const valueCell = (text, idx) => new TableCell({
    borders,
    width: { size: colWidths[idx], type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({ children: [runText(text, { size: 20 })] })],
  })

  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            borders,
            width: { size: colWidths[0], type: WidthType.DXA },
            margins: cellMargins,
            shading: { fill: PURPLE, type: ShadingType.CLEAR, color: 'auto' },
            children: [new Paragraph({ children: [runText('', { size: 20 })] })],
          }),
          headerCell('Schools'),
          headerCell('Individual Parents'),
        ],
      }),
      new TableRow({ children: [labelCell('Cost'), valueCell('$12 / family / year', 1), valueCell('$8/month or $59/year', 2)] }),
      new TableRow({ children: [labelCell('Free Trial'), valueCell('14 days', 1), valueCell('7 days', 2)] }),
      new TableRow({ children: [labelCell('Minimum'), valueCell('10 families', 1), valueCell('—', 2)] }),
      new TableRow({ children: [labelCell('Card up front'), valueCell('Yes', 1), valueCell('Yes', 2)] }),
      new TableRow({ children: [labelCell('Family count'), valueCell('Set at signup, adjust anytime', 1), valueCell('N/A', 2)] }),
      new TableRow({ children: [labelCell('Includes'), valueCell('Same full access as parent plan, for every family', 1), valueCell('Full access', 2)] }),
    ],
  })
}

// ---------------------------------------------------------
// Document
// ---------------------------------------------------------

const numberingConfig = {
  config: [
    {
      reference: 'bullets',
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    },
    {
      reference: 'numbers',
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    },
  ],
}

const styles = {
  default: { document: { run: { font: 'Arial', size: 22 } } }, // 11pt default
  paragraphStyles: [
    {
      id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 32, bold: true, font: 'Arial', color: PURPLE },
      paragraph: { spacing: { before: 480, after: 240 }, outlineLevel: 0 },
    },
    {
      id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 26, bold: true, font: 'Arial', color: PLUM },
      paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 1 },
    },
    {
      id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 22, bold: true, font: 'Arial', color: PURPLE },
      paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 },
    },
  ],
}

// ---- Cover ----
const coverChildren = [
  new Paragraph({ spacing: { before: 1200, after: 0 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [runText('Montessori Family Alliance', { bold: true, color: PLUM, size: 56, font: 'Arial' })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 600 },
    children: [runText('Powered by The Montessori Foundation', { italics: true, color: SOFT_PURPLE, size: 24 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [runText(
      'A trusted home for Montessori families and the schools that guide them — an AI-powered platform that strengthens the bridge between the classroom and the home, built in partnership with Montessori schools, never to replace them.',
      { italics: true, color: GRAY, size: 22 }
    )],
  }),
  new Paragraph({ children: [new PageBreak()] }),
]

// ---- Why It Exists ----
const whySection = [
  heading1('Why It Exists'),
  para('Montessori schools share the same hard truth: families who don’t understand Montessori don’t see its value, and families who don’t see its value don’t re-enroll. Schools spend enormous time fielding the same parent questions over and over — at 10pm, on weekends, between work and pickup. Teachers can’t be everywhere. Parents Google, find conflicting answers, and arrive at conferences with ideas that contradict what the classroom teaches.'),
  para('The Montessori Family Alliance gives every family in your school a 24/7, philosophy-aligned resource that reinforces what their child experiences in your environment — so families come to conferences fluent in Montessori, retention goes up, and your teachers can focus on what they do best.'),
]

// ---- How It Works for Schools ----
const howItWorksSection = [
  heading1('How It Works for Schools'),

  heading2('Subscription'),
  bulletMixed([runText('$12 per family, per year', { bold: true }), runText(' — billed annually')]),
  bulletMixed([runText('10-family minimum', { bold: true }), runText(' ($120/year minimum)')]),
  bulletMixed([runText('14-day free trial', { bold: true }), runText(' — full access, card required up front, cancel anytime')]),
  bullet('Pay once for the school; every family you invite gets full access at no cost to them'),

  heading2('Setup (15 minutes)'),
  numbered('Subscribe at familyalliance.montessori.org/for-schools/pricing'),
  numbered('Stripe handles the trial + billing'),
  numbered('Create your admin account (email confirmed automatically)'),
  numbered('Land on your school dashboard'),

  heading2('School Admin Dashboard'),
  ...featureBlock('Overview', 'At-a-glance view of how many families are enrolled, how many invitations are pending, and engagement.'),
  ...featureBlock('Families', 'See every family that’s joined your school — when they signed up, who’s in the household.'),
  ...featureBlock('Invitations', 'Two ways to bring families on board: share a link to copy into your existing parent communications, or bulk invite by email — paste a list of emails and we send a branded invitation to each family on your behalf.'),
  ...featureBlock('Admins & Staff', 'Add other admins to help manage. Anyone you invite gets full admin access. They sign up with the email you invited them with — no separate account creation.'),
  ...featureBlock('School Settings', 'School profile (name, address, website, phone, credentials — AMI / AMS / MACTE / IMC / Other) plus subscription management via Stripe portal: update payment, change family count, view invoices, cancel anytime.'),

  heading2('What School Admins See'),
  bullet('Who has signed up'),
  bullet('Pending invitations and their status (sent, accepted, expired, revoked)'),
  bullet('Total seats used vs. seats available'),
  bullet('Trial end date or next billing date'),

  heading2('Co-Branded for Your School'),
  para('When a family clicks your invitation link, they see your school’s name and credentials on the signup page. The platform is unmistakably "their school’s resource."'),
]

// ---- What Families Get ----
const familiesSection = [
  heading1('What Your Families Get'),
  para('When you invite a family, they sign up for free (covered by your subscription) and get access to everything the platform offers:'),

  ...featureBlock('Abigail — The AI Montessori Guide',
    'A philosophy-aligned AI assistant trained on the Montessori Foundation’s teachings. Parents ask the questions they actually have — about biting, concentration, conferences, screen time — and Abigail answers in plain language, grounded in Foundation philosophy, and never contradicts what the classroom teaches. She knows the child’s age, sensitive periods, and the family’s communication preferences.'),

  ...featureBlock('Foundation Library',
    '495+ articles, videos, and webinars from Tim Seldin and Montessori Foundation contributors — searchable and filterable by topic, age group, or curriculum area.'),

  ...featureBlock('Tomorrow’s Child',
    'The Foundation’s flagship newsletter for parents and educators. 43 archived issues spanning 2010–2026, available to read or download as PDFs. New issues added as they’re released.'),

  ...featureBlock('Baby Milestones (0–36 Months)',
    'Month-by-month development guides covering gross motor, hand development, communication, and Montessori activities at each stage. Parents see what’s age-appropriate and how to support their child’s growth.'),

  ...featureBlock('Child Development & Curriculum Tracking',
    '2,566 skills from the official Montessori Scope & Sequence across 10 curriculum areas — Practical Life, Sensorial, Language, Mathematics, Geography, History, Cosmic Studies, Cultural, Movement, and Creative Arts. Per-child progress: what they’ve mastered, what’s emerging, what’s next.'),

  ...featureBlock('At-Home Learning Plans',
    'AI-generated plans aligned with the curriculum framework. Parents describe their child’s current interests, and Abigail builds a week of activities that complement the classroom — never duplicating or overriding what the school teaches.'),

  ...featureBlock('Progress Reports',
    'Parents can generate written progress reports for their child — useful for conferences, sharing with grandparents, or keeping a personal record of growth over time. Builds the same vocabulary teachers use.'),

  ...featureBlock('Home Environment & Room Vision',
    'Room-by-room guides (entryway, kitchen, bedroom, playroom, outdoor) plus AI-powered "Room Vision": parents upload a photo of a room and get a Montessori-aligned redesign suggestion. Helps parents create a prepared environment at home that mirrors the school’s principles.'),

  ...featureBlock('Daily Observations',
    'Parents log small moments — "Eli concentrated on the pink tower for 22 minutes today" — and build a journal of growth they can bring to conferences.'),

  ...featureBlock('School Evaluation Tool',
    'For families considering your school OR considering moving: a structured tour-debrief that helps them recognize authentic Montessori practice. When they’re already enrolled, it becomes a way to articulate why your school stands out.'),

  ...featureBlock('Memories & Notes',
    'Save important responses from Abigail, attach notes to specific children, build a private journal.'),
]

// ---- How It Helps Your School ----
const howItHelpsSection = [
  heading1('How It Helps Your School'),

  heading2('Re-enrollment'),
  para('Families who understand Montessori — who see their child’s growth, who know why work cycles matter, who recognize sensitive periods when they appear — don’t leave. Family Alliance is the year-round retention layer your school has been building manually.'),

  heading2('Onboarding'),
  para('New families spend their first months confused. The Alliance gives them the same vocabulary your teachers use, structured age-appropriate guidance, and a place to bring their late-night questions instead of your head of school’s inbox.'),

  heading2('Teacher Workload'),
  para('Stop being the only Montessori interpreter for your families. Abigail answers the questions that don’t actually require teacher time — so when teachers DO meet with parents, the conversation can be substantive.'),

  heading2('Marketing'),
  para('Prospective families who tour your school and ask "How do you support parents?" now have a concrete answer: every family at our school gets the Montessori Family Alliance — Tim Seldin’s AI guide, the Foundation library, child development tools — covered by our school. That’s a recruiting differentiator.'),

  heading2('Conference Quality'),
  para('Parents arrive at conferences having logged their own observations, having read up on their child’s sensitive periods, having generated their own progress notes. Your conferences become substantive partnerships, not Montessori 101 lectures.'),
]

// ---- Pricing ----
const pricingSection = [
  heading1('Pricing'),
  pricingTable(),
  new Paragraph({
    spacing: { before: 240, after: 200 },
    children: [
      runText('For schools, '),
      runText('the per-family price reflects the underlying cost of providing access', { bold: true }),
      runText(' — Abigail (AI), the library hosting, the Foundation content licenses. There is no markup for "the platform" — schools subsidize their families because keeping them engaged is what schools want.'),
    ],
  }),
]

// ---- Plain English ----
const plainEnglishSection = [
  heading1('What Schools Are Paying For (Plain English)'),
  para('When a school subscribes:'),
  numberedMixed([runText('Every family at your school gets a free account', { bold: true }), runText(' — for as long as your subscription is active')]),
  numberedMixed([runText('Your school gets a co-branded experience', { bold: true }), runText(' — when families log in, they see your school’s name; when they get the welcome email, it mentions your school')]),
  numberedMixed([runText('You get a school admin dashboard', { bold: true }), runText(' — see who’s enrolled, send invitations, manage billing')]),
  numberedMixed([runText('You get multi-admin support', { bold: true }), runText(' — your team can co-manage; if you leave, the next admin can take over')]),
  numberedMixed([runText('You get continued Foundation content', { bold: true }), runText(' — new Tomorrow’s Child issues, new articles, new webinars are added on a regular cadence and instantly available to your families')]),
]

// ---- Privacy ----
const privacySection = [
  heading1('Privacy & Data'),
  bullet('Each family’s observations, child profiles, and notes are private to that family — not visible to the school admin, not visible to other families'),
  bullet('The school admin can see enrollment (who’s signed up) but not content (what they’ve logged or asked Abigail)'),
  bullet('All data is stored in a SOC2-compliant Supabase Postgres database with row-level security'),
  bullet('Stripe handles all payment data — we never store card numbers'),
  bullet('Families can export or delete all their data from Settings at any time'),
]

// ---- Roadmap ----
const roadmapSection = [
  heading1('What’s New & Coming Soon'),
  heading2('Live now'),
  bullet('Full parent dashboard with Abigail, library, curriculum tracking, plans, reports'),
  bullet('School admin dashboard with families, invitations, multi-admin'),
  bullet('14-day school trial + 7-day parent trial via Stripe'),
  bullet('Branded transactional emails (welcome, invitations, password reset)'),
  bullet('Tomorrow’s Child PDF archive'),
  bullet('Free Montessori readiness assessment (public)'),
  bullet('Free guides for parents (public)'),
  heading2('On the roadmap'),
  bullet('School resource library (playbooks, professional development, templates) — exclusive to school admins'),
  bullet('Parent preview mode for school admins (see what your families see, with sample data)'),
  bullet('Email digest for school admins (weekly: new families, engagement, content highlights)'),
  bullet('Live webinar series for school subscribers'),
  bullet('Resend-powered email automation for trial reminders, re-engagement, and onboarding sequences'),
]

// ---- Get Started ----
const getStartedSection = [
  heading1('Get Started'),

  new Paragraph({
    spacing: { before: 200, after: 120 },
    children: [runText('For schools', { bold: true, color: PLUM, size: 22 })],
  }),
  new Paragraph({
    spacing: { after: 160 },
    children: [
      runText('Start your 14-day trial: '),
      link('familyalliance.montessori.org/for-schools/pricing', 'https://familyalliance.montessori.org/for-schools/pricing'),
    ],
  }),

  new Paragraph({
    spacing: { before: 200, after: 120 },
    children: [runText('For schools wanting a walkthrough first', { bold: true, color: PLUM, size: 22 })],
  }),
  new Paragraph({
    spacing: { after: 160 },
    children: [
      runText('Book a 30-minute demo: '),
      link('familyalliance.montessori.org/for-schools/demo', 'https://familyalliance.montessori.org/for-schools/demo'),
    ],
  }),

  new Paragraph({
    spacing: { before: 200, after: 120 },
    children: [runText('For individual parents (no school subscription)', { bold: true, color: PLUM, size: 22 })],
  }),
  new Paragraph({
    spacing: { after: 160 },
    children: [
      runText('Start your 7-day trial: '),
      link('familyalliance.montessori.org/pricing', 'https://familyalliance.montessori.org/pricing'),
    ],
  }),

  new Paragraph({
    spacing: { before: 200, after: 120 },
    children: [runText('Questions', { bold: true, color: PLUM, size: 22 })],
  }),
  new Paragraph({
    spacing: { after: 160 },
    children: [
      runText('Email '),
      link('hello@montessori.org', 'mailto:hello@montessori.org'),
    ],
  }),
]

// ---- Footer ----
const footer = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        runText('Montessori Family Alliance  •  Powered by The Montessori Foundation  •  Page ', { color: GRAY, size: 18 }),
        new TextRun({ children: [PageNumber.CURRENT], color: GRAY, size: 18 }),
      ],
    }),
  ],
})

// ---------------------------------------------------------
// Build & save
// ---------------------------------------------------------

const doc = new Document({
  creator: 'Montessori Family Alliance',
  title: 'Montessori Family Alliance — Overview',
  description: 'Sales and overview document for partners and schools',
  styles,
  numbering: numberingConfig,
  sections: [{
    properties: {
      page: {
        size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
        margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
      },
    },
    footers: { default: footer },
    children: [
      ...coverChildren,
      ...whySection,
      ...howItWorksSection,
      ...familiesSection,
      ...howItHelpsSection,
      ...pricingSection,
      ...plainEnglishSection,
      ...privacySection,
      ...roadmapSection,
      ...getStartedSection,
    ],
  }],
})

const outPath = path.join(__dirname, '..', 'docs', 'family-alliance-overview.docx')
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf)
  console.log('Wrote ' + outPath + ' (' + Math.round(buf.length / 1024) + ' KB)')
}).catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
