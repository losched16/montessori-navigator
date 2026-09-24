import { NextRequest, NextResponse } from 'next/server'
import { authorizeStudioRequest, studioServiceClient } from '@/lib/content-studio/server'
import { CONTENT_INTAKE_BUCKET, isHttpUrl, isSubmissionType } from '@/lib/content-studio/shared'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MAX_TEXT = 200_000
const PIPELINE_FILE_URL_TTL = 60 * 60 * 24 // 24h for n8n to fetch the file

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

// POST /api/content-studio/submissions  (JSON)
// Super-admin only. The row is inserted with the caller's own session, so the
// table's RLS policy is enforced in addition to the check above. Any file was
// already uploaded directly to storage via /api/content-studio/uploads.
export async function POST(req: NextRequest) {
  const auth = await authorizeStudioRequest()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { user, supabase } = auth
  const service = studioServiceClient()

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  const submissionType = str(body.submission_type)
  const title = str(body.title)
  const notes = str(body.notes) || null
  const sourceText = str(body.source_text) || null
  const sourceUrl = str(body.source_url) || null
  const filePath = str(body.file_path) || null
  const fileName = str(body.file_name).slice(0, 255) || null
  const fileSize = Number.isFinite(Number(body.file_size)) ? Number(body.file_size) : null

  if (!isSubmissionType(submissionType)) return NextResponse.json({ error: 'Choose Article, Video, or Idea.' }, { status: 400 })
  if (!title || title.length > 240) return NextResponse.json({ error: 'A title between 1 and 240 characters is required.' }, { status: 400 })
  if (sourceText && sourceText.length > MAX_TEXT) return NextResponse.json({ error: 'The pasted text is too long. Upload it as a document instead.' }, { status: 400 })
  if (notes && notes.length > 10_000) return NextResponse.json({ error: 'Instructions are too long.' }, { status: 400 })
  if (sourceUrl && !isHttpUrl(sourceUrl)) return NextResponse.json({ error: 'The video or source URL isn’t valid. It should start with https://' }, { status: 400 })
  if (!sourceText && !sourceUrl && !filePath) return NextResponse.json({ error: 'Add some text, a link, or a file before submitting.' }, { status: 400 })

  // A file must live in the caller's own folder and must actually exist.
  // Creating a signed read URL doubles as the existence check and gives the
  // pipeline a way to fetch a file from the private bucket.
  let fileUrl: string | null = null
  if (filePath) {
    if (!filePath.startsWith(`${user.id}/`) || filePath.includes('..')) {
      return NextResponse.json({ error: 'Invalid file reference.' }, { status: 400 })
    }
    const { data: signed, error: signErr } = await service.storage
      .from(CONTENT_INTAKE_BUCKET)
      .createSignedUrl(filePath, PIPELINE_FILE_URL_TTL)
    if (signErr || !signed) return NextResponse.json({ error: 'The uploaded file wasn’t found. Please attach it again.' }, { status: 400 })
    fileUrl = signed.signedUrl
  }

  const { data: submission, error: insertError } = await supabase
    .from('content_submissions')
    .insert({
      submission_type: submissionType,
      title,
      notes,
      source_text: sourceText,
      source_url: sourceUrl,
      file_path: filePath,
      file_name: filePath ? fileName : null,
      file_size: filePath ? fileSize : null,
      submitted_by: user.id,
    })
    .select('id, submission_type, title, notes, source_text, source_url, file_path, status, submitted_by, created_at')
    .single()

  if (insertError || !submission) {
    console.error('[content-studio] insert failed:', insertError)
    if (filePath) await service.storage.from(CONTENT_INTAKE_BUCKET).remove([filePath])
    return NextResponse.json({ error: 'The submission couldn’t be saved. Please try again.' }, { status: 500 })
  }

  // Optional n8n hand-off. Never fails the submission: if automation is down,
  // the row stays 'submitted' with pipeline_notified_at null and can be
  // replayed later.
  const webhookUrl = process.env.CONTENT_PIPELINE_WEBHOOK_URL
  let pipelineNotified = false
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(process.env.CONTENT_PIPELINE_WEBHOOK_SECRET
            ? { 'x-content-pipeline-secret': process.env.CONTENT_PIPELINE_WEBHOOK_SECRET }
            : {}),
        },
        body: JSON.stringify({
          submission_id: submission.id,
          submission_type: submission.submission_type,
          title: submission.title,
          notes: submission.notes,
          source_text: submission.source_text,
          source_url: submission.source_url,
          file_path: submission.file_path,
          file_url: fileUrl,
          submitted_by: submission.submitted_by,
          created_at: submission.created_at,
        }),
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        pipelineNotified = true
        await service.from('content_submissions').update({ pipeline_notified_at: new Date().toISOString() }).eq('id', submission.id)
      } else {
        console.error(`[content-studio] pipeline webhook returned ${res.status}`)
      }
    } catch (err) {
      console.error('[content-studio] pipeline webhook failed:', err)
    }
  }

  return NextResponse.json(
    { ok: true, submission: { id: submission.id, status: submission.status }, pipelineNotified },
    { status: 201 },
  )
}
