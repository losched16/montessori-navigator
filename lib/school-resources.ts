// School-side resource library.
//
// Resources are static files served from /public/resources. Metadata is
// hardcoded here for now — at this volume (single digits) a DB table would be
// over-engineering. Once we cross ~10 resources or want admin upload UI, we
// promote this to a `school_resources` table with the same shape.
//
// To add a new resource:
//   1. Drop the PDF in /public/resources/ (use a kebab-case filename)
//   2. Add an entry to SCHOOL_RESOURCES below
//   3. Optional: drop a cover image in /public/resources/ at the same slug

export type ResourceType = 'playbook' | 'workbook' | 'template' | 'guide'

export interface SchoolResource {
  slug: string
  title: string
  description: string
  type: ResourceType
  pdfPath: string         // e.g. /resources/foo.pdf
  coverPath?: string      // optional thumbnail
  publishedAt: string     // YYYY-MM-DD
  /** Optional teaser of what's inside, shown on the detail card */
  highlights?: string[]
}

export const SCHOOL_RESOURCES: SchoolResource[] = [
  {
    slug: 'new-family-onboarding-playbook',
    title: 'New Family Onboarding Playbook',
    description:
      'A complete playbook showing what a great new-family onboarding looks like at a Montessori school — from acceptance through their first month. Use it as a model for your own.',
    type: 'playbook',
    pdfPath: '/resources/new-family-onboarding-playbook.pdf',
    publishedAt: '2026-04-01',
    highlights: [
      'Acceptance-to-first-day timeline',
      'Welcome packet templates',
      'First-month family touchpoints',
      'Example school in action',
    ],
  },
  {
    slug: 'family-onboarding-workbook',
    title: 'Family Onboarding Workbook',
    description:
      'A fillable customization workbook to design your own new-family onboarding flow. Pairs with the playbook above — work through it as a leadership team to build your school’s version.',
    type: 'workbook',
    pdfPath: '/resources/family-onboarding-workbook.pdf',
    publishedAt: '2026-04-01',
    highlights: [
      'Step-by-step customization prompts',
      'Pulls in your school’s voice and rhythms',
      'Ready to use with your admin team',
    ],
  },
]

export function getSchoolResource(slug: string): SchoolResource | undefined {
  return SCHOOL_RESOURCES.find(r => r.slug === slug)
}

export function resourceTypeLabel(type: ResourceType): string {
  switch (type) {
    case 'playbook': return 'Playbook'
    case 'workbook': return 'Workbook'
    case 'template': return 'Template'
    case 'guide': return 'Guide'
  }
}
