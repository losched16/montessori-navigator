import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { isSuperAdmin } from '@/lib/super-admin'
import { cleanArticleHtml } from '@/lib/sanitize'

export const dynamic = 'force-dynamic'

const STORAGE_BUCKET = 'resources'
const MAX_FILE_BYTES = 25 * 1024 * 1024

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function authedSuperAdmin() {
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

// PATCH /api/admin/resources/[id] — update metadata, optionally replace PDF
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await authedSuperAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const form = await req.formData()
  const title = String(form.get('title') || '').trim()
  const slug = String(form.get('slug') || '').trim()
  const description = String(form.get('description') || '').trim()
  const type = String(form.get('type') || '').trim()
  const audience = String(form.get('audience') || '').trim()
  const highlightsRaw = String(form.get('highlights') || '[]')
  const bodyHtmlRaw = String(form.get('body_html') || '').trim()
  const bodyHtml = bodyHtmlRaw ? cleanArticleHtml(bodyHtmlRaw) : ''
  const inResources = String(form.get('in_resources') || 'true') === 'true'
  const inLibrary = String(form.get('in_library') || 'false') === 'true'
  const isPublished = String(form.get('is_published') || 'false') === 'true'
  const file = form.get('file')

  if (!title || !slug || !description || !type || !audience) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  let highlights: string[] = []
  try { highlights = JSON.parse(highlightsRaw) } catch {}

  const service = getServiceClient()

  // Look up the existing row so we know its current pdf_path and published state
  const { data: existing } = await service
    .from('resources')
    .select('pdf_path, is_published, published_at')
    .eq('id', params.id)
    .maybeSingle()

  if (!existing) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
  }

  // If they uploaded a new file, store it and queue the old one for deletion.
  // We only delete from storage on success, after the DB update lands.
  let newPdfPath: string | null = null
  let oldStoragePathToRemove: string | null = null
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `File is too large (${Math.round(file.size / 1024 / 1024)} MB). Max 25 MB.` },
        { status: 400 },
      )
    }
    if (file.type && file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported.' }, { status: 400 })
    }
    const buf = Buffer.from(await file.arrayBuffer())
    const objectPath = `${type}s/${slug}-${Date.now()}.pdf`
    const { error: upErr } = await service.storage
      .from(STORAGE_BUCKET)
      .upload(objectPath, buf, { contentType: 'application/pdf', upsert: false })
    if (upErr) return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500 })
    newPdfPath = objectPath
    // Only mark the old file for deletion if it's a storage path (not a /resources/* public file)
    if (existing.pdf_path && !existing.pdf_path.startsWith('/')) {
      oldStoragePathToRemove = existing.pdf_path
    }
  }

  // Compute published_at: set it the first time published goes true, clear when unpublishing
  const wasPublished = existing.is_published
  const publishedAt = isPublished
    ? (wasPublished ? existing.published_at : new Date().toISOString())
    : null

  const updates: Record<string, any> = {
    title,
    slug,
    description,
    type,
    audience,
    highlights,
    body_html: bodyHtml.replace(/<[^>]*>/g, '').trim().length > 0 ? bodyHtml : null,
    in_resources: inResources,
    in_library: inLibrary,
    is_published: isPublished,
    published_at: publishedAt,
  }
  if (newPdfPath) updates.pdf_path = newPdfPath

  const { error } = await service
    .from('resources')
    .update(updates)
    .eq('id', params.id)

  if (error) {
    // If we uploaded a new file but the DB update failed, clean it up
    if (newPdfPath) {
      await service.storage.from(STORAGE_BUCKET).remove([newPdfPath])
    }
    if (error.code === '23505') {
      return NextResponse.json(
        { error: `A different resource already uses slug "${slug}".` },
        { status: 400 },
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (oldStoragePathToRemove) {
    await service.storage.from(STORAGE_BUCKET).remove([oldStoragePathToRemove])
  }

  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/resources/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await authedSuperAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const service = getServiceClient()

  const { data: existing } = await service
    .from('resources')
    .select('pdf_path')
    .eq('id', params.id)
    .maybeSingle()

  const { error } = await service.from('resources').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Best-effort cleanup of the storage file. Don't fail the delete if cleanup fails.
  if (existing?.pdf_path && !existing.pdf_path.startsWith('/')) {
    await service.storage.from(STORAGE_BUCKET).remove([existing.pdf_path])
  }

  return NextResponse.json({ ok: true })
}
