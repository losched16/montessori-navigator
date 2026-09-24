import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { authorizeStudioRequest, studioServiceClient } from '@/lib/content-studio/server'
import { CONTENT_INTAKE_BUCKET, MAX_UPLOAD_BYTES, cleanFilename, isAllowedFile, formatBytes } from '@/lib/content-studio/shared'

export const dynamic = 'force-dynamic'

// POST /api/content-studio/uploads  { fileName, fileSize }
// Super-admin only. Returns a one-time signed upload URL token so the browser
// uploads straight to Supabase Storage. Files never pass through this
// function — Vercel caps request bodies at 4.5 MB, far below video sizes.
export async function POST(req: NextRequest) {
  const auth = await authorizeStudioRequest()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await req.json().catch(() => null)
  const fileName = typeof body?.fileName === 'string' ? body.fileName : ''
  const fileSize = Number(body?.fileSize)

  if (!fileName || !isAllowedFile(fileName)) {
    return NextResponse.json({ error: 'That file type isn’t supported. Use a document (doc, docx, pdf, txt, md, rtf), video (mp4, mov, m4v, webm) or audio (mp3, m4a, wav) file.' }, { status: 400 })
  }
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return NextResponse.json({ error: 'The file is empty.' }, { status: 400 })
  }
  if (fileSize > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: `The file is ${formatBytes(fileSize)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)} — for longer videos, paste a YouTube or Vimeo link instead.` }, { status: 400 })
  }

  // Path is always under the uploader's own folder; the submissions route
  // re-checks this prefix before accepting a file_path.
  const path = `${auth.user.id}/${randomUUID()}-${cleanFilename(fileName) || 'upload'}`
  const { data, error } = await studioServiceClient().storage.from(CONTENT_INTAKE_BUCKET).createSignedUploadUrl(path)
  if (error || !data) {
    console.error('[content-studio] signed upload URL failed:', error)
    return NextResponse.json({ error: 'Uploads aren’t available right now. Try again, or paste the content instead.' }, { status: 500 })
  }
  return NextResponse.json({ path: data.path, token: data.token })
}
