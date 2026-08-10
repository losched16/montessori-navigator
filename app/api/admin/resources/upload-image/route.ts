import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { isSuperAdmin } from '@/lib/super-admin'

export const dynamic = 'force-dynamic'

const BUCKET = 'resources'
const MAX_BYTES = 8 * 1024 * 1024 // 8 MB
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])

// POST /api/admin/resources/upload-image  (multipart: file)
// Super-admin only. Uploads an image into the resources bucket and returns its
// public URL, which the editor drops into the article body as ![](url).
export async function POST(req: NextRequest) {
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
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  if (!(await isSuperAdmin(user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No image file provided' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `Image too large (${Math.round(file.size / 1024 / 1024)} MB). Max 8 MB.` }, { status: 400 })
  }
  if (file.type && !ALLOWED.has(file.type)) {
    return NextResponse.json({ error: `Unsupported type ${file.type}. Use PNG, JPG, WEBP, or GIF.` }, { status: 400 })
  }

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '')
  const objectPath = `images/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`
  const buf = Buffer.from(await file.arrayBuffer())

  const { error } = await service.storage.from(BUCKET).upload(objectPath, buf, {
    contentType: file.type || 'image/png',
    upsert: false,
  })
  if (error) {
    return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 })
  }

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectPath}`
  return NextResponse.json({ ok: true, url })
}
