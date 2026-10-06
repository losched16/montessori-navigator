import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createServerSupabase } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// School logo — shown to parents as "made possible by <School>".
//   POST   multipart { file }  → upload + set schools.logo_url
//   DELETE                     → clear schools.logo_url
// School admins only. The school is the caller's own (from school_staff), never
// taken from the request. Stored in the public 'resources' bucket because the
// logo is displayed to every parent at the school.

const BUCKET = 'resources'
const MAX_BYTES = 2 * 1024 * 1024
const TYPES: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }

function service() {
  return createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

async function adminSchoolId(): Promise<{ schoolId: string } | { error: string; status: number }> {
  const { data: { user } } = await createServerSupabase().auth.getUser()
  if (!user) return { error: 'Not authenticated', status: 401 }
  const { data: staff } = await service()
    .from('school_staff')
    .select('school_id')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .limit(1)
    .maybeSingle()
  if (!staff) return { error: 'Only school admins can change the logo', status: 403 }
  return { schoolId: staff.school_id }
}

export async function POST(req: NextRequest) {
  const auth = await adminSchoolId()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: 'Choose an image file.' }, { status: 400 })
  const ext = TYPES[file.type]
  if (!ext) return NextResponse.json({ error: 'Use a PNG, JPG, or WEBP image.' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'That image is over 2 MB. Please use a smaller file.' }, { status: 400 })

  const svc = service()
  const path = `school-logos/${auth.schoolId}/${Date.now()}.${ext}`
  const { error: upErr } = await svc.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    upsert: false,
  })
  if (upErr) {
    console.error('[school/logo] upload failed:', upErr)
    return NextResponse.json({ error: 'The logo couldn’t be uploaded. Please try again.' }, { status: 500 })
  }
  const logoUrl = svc.storage.from(BUCKET).getPublicUrl(path).data.publicUrl

  const { data: prev } = await svc.from('schools').select('logo_url').eq('id', auth.schoolId).maybeSingle()
  const { error: dbErr } = await svc.from('schools').update({ logo_url: logoUrl }).eq('id', auth.schoolId)
  if (dbErr) {
    await svc.storage.from(BUCKET).remove([path])
    return NextResponse.json({ error: 'The logo couldn’t be saved. Please try again.' }, { status: 500 })
  }
  await removeOldLogo(prev?.logo_url)
  return NextResponse.json({ logoUrl })
}

export async function DELETE() {
  const auth = await adminSchoolId()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const svc = service()
  const { data: prev } = await svc.from('schools').select('logo_url').eq('id', auth.schoolId).maybeSingle()
  await svc.from('schools').update({ logo_url: null }).eq('id', auth.schoolId)
  await removeOldLogo(prev?.logo_url)
  return NextResponse.json({ logoUrl: null })
}

// Only ever deletes files inside this app's school-logos folder.
async function removeOldLogo(url: string | null | undefined) {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const i = url ? url.indexOf(marker) : -1
  if (!url || i < 0) return
  const path = url.slice(i + marker.length)
  if (path.startsWith('school-logos/')) await service().storage.from(BUCKET).remove([path])
}
