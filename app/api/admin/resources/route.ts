import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { isSuperAdmin } from '@/lib/super-admin'

export const dynamic = 'force-dynamic'

const STORAGE_BUCKET = 'resources'
const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25 MB

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function authedSuperAdmin(req: NextRequest) {
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

  const allowed = await isSuperAdmin(user.id)
  if (!allowed) return { error: 'Forbidden', status: 403 as const }

  return { user }
}

/**
 * Upload a PDF to Supabase Storage. Returns the storage path (e.g.
 * "playbooks/foo-1714756800.pdf"). The path is shaped as `{type}/{slug}-{ts}.pdf`
 * so files are loosely organized and we don't accidentally overwrite when
 * two resources share a slug stem.
 */
async function uploadPdf(
  service: ReturnType<typeof getServiceClient>,
  file: File,
  slug: string,
  type: string,
): Promise<{ path: string } | { error: string }> {
  if (file.size > MAX_FILE_BYTES) {
    return { error: `File is too large (${Math.round(file.size / 1024 / 1024)} MB). Max 25 MB.` }
  }
  if (file.type && file.type !== 'application/pdf') {
    return { error: `Only PDF files are supported (got ${file.type}).` }
  }
  const buf = Buffer.from(await file.arrayBuffer())
  const objectPath = `${type}s/${slug}-${Date.now()}.pdf`

  const { error } = await service.storage
    .from(STORAGE_BUCKET)
    .upload(objectPath, buf, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (error) return { error: `Upload failed: ${error.message}` }
  return { path: objectPath }
}

// POST /api/admin/resources — create a new resource (with PDF upload)
export async function POST(req: NextRequest) {
  const auth = await authedSuperAdmin(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const form = await req.formData()
  const title = String(form.get('title') || '').trim()
  const slug = String(form.get('slug') || '').trim()
  const description = String(form.get('description') || '').trim()
  const type = String(form.get('type') || '').trim()
  const audience = String(form.get('audience') || '').trim()
  const highlightsRaw = String(form.get('highlights') || '[]')
  const bodyMarkdown = String(form.get('body_markdown') || '').trim()
  const isPublished = String(form.get('is_published') || 'false') === 'true'
  const file = form.get('file')

  if (!title || !slug || !description || !type || !audience) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const hasFile = file instanceof File && file.size > 0
  const hasBody = bodyMarkdown.length > 0
  if (!hasFile && !hasBody) {
    return NextResponse.json(
      { error: 'Either a PDF file or markdown body content is required.' },
      { status: 400 },
    )
  }

  let highlights: string[] = []
  try { highlights = JSON.parse(highlightsRaw) } catch {}

  const service = getServiceClient()

  // Upload the PDF first if there is one — so we don't end up with a DB row
  // pointing at a file that never got stored.
  let pdfPath: string | null = null
  if (hasFile) {
    const upload = await uploadPdf(service, file as File, slug, type)
    if ('error' in upload) {
      return NextResponse.json({ error: upload.error }, { status: 400 })
    }
    pdfPath = upload.path
  }

  const { data, error } = await service
    .from('resources')
    .insert({
      slug,
      title,
      description,
      type,
      audience,
      highlights,
      pdf_path: pdfPath,
      body_markdown: hasBody ? bodyMarkdown : null,
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
      created_by: auth.user.id,
    })
    .select('id')
    .single()

  if (error) {
    // Roll back the storage upload if there was one
    if (pdfPath) {
      await service.storage.from(STORAGE_BUCKET).remove([pdfPath])
    }
    if (error.code === '23505') {
      return NextResponse.json(
        { error: `A resource with slug "${slug}" already exists. Pick a different slug.` },
        { status: 400 },
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}
