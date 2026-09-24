// Verifies the Content Studio migration against the live project.
//   node scripts/verify-content-studio.mjs
import { readFileSync } from 'node:fs'

const env = {}
for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = l.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, '').trim()
}
const URL = env.NEXT_PUBLIC_SUPABASE_URL
const svc = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` }
const anon = { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` }

let ok = true
const check = (label, pass, detail = '') => { console.log(`${pass ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`); if (!pass) ok = false }

const t = await fetch(`${URL}/rest/v1/content_submissions?select=id&limit=1`, { headers: svc })
check('content_submissions table exists', t.ok, t.ok ? '' : (await t.json()).message)

if (t.ok) {
  const a = await fetch(`${URL}/rest/v1/content_submissions?select=id&limit=5`, { headers: anon })
  const rows = a.ok ? await a.json() : []
  check('signed-out (anon) requests see no submissions (RLS)', Array.isArray(rows) && rows.length === 0)
  const ins = await fetch(`${URL}/rest/v1/content_submissions`, {
    method: 'POST', headers: { ...anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ submission_type: 'idea', title: 'rls probe', source_text: 'x' }),
  })
  check('signed-out (anon) requests cannot insert (RLS)', !ins.ok, `HTTP ${ins.status}`)
}

const b = await fetch(`${URL}/storage/v1/bucket/content-intake`, { headers: svc })
const bucket = b.ok ? await b.json() : null
check('content-intake bucket exists', !!bucket)
if (bucket) {
  check('bucket is private', bucket.public === false)
  check('bucket file limit is 250 MB', bucket.file_size_limit === 262144000, String(bucket.file_size_limit))
  const up = await fetch(`${URL}/storage/v1/object/upload/sign/content-intake/verify/${Date.now()}.txt`, { method: 'POST', headers: svc })
  check('server can issue signed upload URLs', up.ok, `HTTP ${up.status}`)
}

console.log(ok ? '\nContent Studio database setup: READY' : '\nContent Studio database setup: NOT READY — run supabase-migration-content-studio.sql')
process.exit(ok ? 0 : 1)
