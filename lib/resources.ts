// Unified resources library — playbooks, workbooks, articles, newsletters,
// and any other content the Foundation publishes for member schools and
// parents. Backed by the `resources` Postgres table; managed via /admin.
//
// Audience model: each resource has an audience of 'school' | 'parent' |
// 'both'. The school resource page (/school/resources) shows audience IN
// ('school', 'both'); the parent page (/dashboard/resources) shows
// ('parent', 'both').

export type ResourceType = 'playbook' | 'workbook' | 'template' | 'guide' | 'article' | 'newsletter'
export type Audience = 'school' | 'parent' | 'both'

export interface Resource {
  id: string
  slug: string
  title: string
  description: string
  type: ResourceType
  audience: Audience
  pdfPath: string | null      // either /resources/foo.pdf (public/) or storage path
  coverPath: string | null
  bodyMarkdown: string | null // legacy: articles authored as markdown
  bodyHtml: string | null     // rich-text article body (sanitized HTML)
  highlights: string[]
  inResources: boolean  // show in the Resources section (parent/school)
  inLibrary: boolean    // also show in the parent article Library
  isPublished: boolean
  publishedAt: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

interface RawResource {
  id: string
  slug: string
  title: string
  description: string
  type: string
  audience: string
  pdf_path: string | null
  cover_path: string | null
  body_markdown: string | null
  body_html: string | null
  highlights: string[] | null
  in_resources: boolean | null
  in_library: boolean | null
  is_published: boolean
  published_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

function mapResource(r: RawResource): Resource {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    type: r.type as ResourceType,
    audience: r.audience as Audience,
    pdfPath: r.pdf_path,
    coverPath: r.cover_path,
    bodyMarkdown: r.body_markdown,
    bodyHtml: r.body_html,
    highlights: Array.isArray(r.highlights) ? r.highlights : [],
    inResources: r.in_resources !== false, // default true
    inLibrary: r.in_library === true,      // default false
    isPublished: r.is_published,
    publishedAt: r.published_at,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

/**
 * List published resources for a given audience.
 * For 'school', returns resources with audience = 'school' or 'both'.
 * For 'parent', returns resources with audience = 'parent' or 'both'.
 */
export async function listPublishedResources(
  supabase: any,
  audience: 'school' | 'parent',
): Promise<Resource[]> {
  const { data } = await supabase
    .from('resources')
    .select('*')
    .eq('is_published', true)
    .in('audience', [audience, 'both'])
    .order('published_at', { ascending: false })

  // Only items flagged to appear in the Resources section (library-only items
  // are excluded here). in_resources defaults to true via mapResource.
  return (data || []).map(mapResource).filter((r: Resource) => r.inResources)
}

/**
 * List published resources flagged to appear in the parent article Library.
 * These are merged with the imported Foundation articles on /dashboard/library.
 */
export async function listLibraryResources(supabase: any): Promise<Resource[]> {
  const { data } = await supabase
    .from('resources')
    .select('*')
    .eq('is_published', true)
    .eq('in_library', true)
    .in('audience', ['parent', 'both'])
    .order('published_at', { ascending: false })

  return (data || []).map(mapResource)
}

/** List all resources (published or not). For the admin portal. */
export async function listAllResources(supabase: any): Promise<Resource[]> {
  const { data } = await supabase
    .from('resources')
    .select('*')
    .order('updated_at', { ascending: false })

  return (data || []).map(mapResource)
}

/** Look up a single resource by slug. Used by detail pages. */
export async function getResourceBySlug(
  supabase: any,
  slug: string,
): Promise<Resource | null> {
  const { data } = await supabase
    .from('resources')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  return data ? mapResource(data) : null
}

/** Look up a single resource by id (for the admin edit page). */
export async function getResourceById(
  supabase: any,
  id: string,
): Promise<Resource | null> {
  const { data } = await supabase
    .from('resources')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return data ? mapResource(data) : null
}

export function resourceTypeLabel(type: ResourceType): string {
  switch (type) {
    case 'playbook': return 'Playbook'
    case 'workbook': return 'Workbook'
    case 'template': return 'Template'
    case 'guide': return 'Guide'
    case 'article': return 'Article'
    case 'newsletter': return 'Newsletter'
  }
}

export function audienceLabel(audience: Audience): string {
  switch (audience) {
    case 'school': return 'Schools'
    case 'parent': return 'Parents'
    case 'both': return 'Both'
  }
}

/**
 * Resolve a stored pdf_path to a URL the browser can fetch.
 * - If it starts with "/", it's a public/ asset, use as-is.
 * - Otherwise, it's a Supabase Storage path inside the 'resources' bucket;
 *   build the public URL.
 */
export function resolvePdfUrl(
  pdfPath: string | null,
  supabaseUrl: string,
): string | null {
  if (!pdfPath) return null
  if (pdfPath.startsWith('/')) return pdfPath
  // Public URL pattern for Supabase Storage:
  //   {SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}
  return `${supabaseUrl}/storage/v1/object/public/resources/${pdfPath}`
}
