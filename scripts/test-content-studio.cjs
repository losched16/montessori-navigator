// Route-level tests for Content Studio. Runs the real API handlers with auth,
// Supabase, and storage mocked, plus a local HTTP server standing in for n8n.
//   npx tsx scripts/test-content-studio.cjs
const http = require('http')
const Module = require('module')
const assert = require('assert')

// ---- controllable mocks ---------------------------------------------------
const state = { user: null, superAdmin: false, inserted: null, insertError: null, signedExists: true, updates: [], removed: [] }
const reset = () => Object.assign(state, { user: null, superAdmin: false, inserted: null, insertError: null, signedExists: true, updates: [], removed: [] })

const ssrClient = () => ({
  auth: { getUser: async () => ({ data: { user: state.user } }) },
  from: () => ({
    insert: row => ({
      select: () => ({
        single: async () => {
          if (state.insertError) return { data: null, error: state.insertError }
          state.inserted = row
          return { data: { id: 'sub-123', status: 'submitted', created_at: '2026-09-24T00:00:00Z', ...row }, error: null }
        },
      }),
    }),
  }),
})
const serviceClient = () => ({
  storage: {
    from: () => ({
      createSignedUrl: async p => (state.signedExists ? { data: { signedUrl: `https://storage.test/${p}?sig` }, error: null } : { data: null, error: { message: 'not found' } }),
      createSignedUploadUrl: async p => ({ data: { path: p, token: 'tok' }, error: null }),
      remove: async paths => { state.removed.push(...paths); return {} },
    }),
  },
  from: () => ({ update: patch => ({ eq: async () => { state.updates.push(patch); return {} } }) }),
})

const orig = Module._load
Module._load = function (req, ...rest) {
  if (req === 'next/headers') return { cookies: () => ({ get: () => undefined, set() {} }) }
  if (req === '@supabase/ssr') return { createServerClient: ssrClient }
  if (req === '@supabase/supabase-js') return { createClient: serviceClient }
  if (/lib\/super-admin$/.test(req)) return { isSuperAdmin: async () => state.superAdmin }
  return orig.call(this, req, ...rest)
}
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service'

const submissions = require('../app/api/content-studio/submissions/route.ts')
const uploads = require('../app/api/content-studio/uploads/route.ts')
const post = (mod, body) => mod.POST(new Request('http://t/api', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }))

const TIM = { id: 'tim-uuid' }
const good = { submission_type: 'article', title: 'Real responsibility', source_text: 'Draft…', notes: 'Ages 3–6' }

const tests = []
const test = (name, fn) => tests.push({ name, fn })

test('signed-out user gets 401 (submissions + uploads)', async () => {
  assert.equal((await post(submissions, good)).status, 401)
  assert.equal((await post(uploads, { fileName: 'a.pdf', fileSize: 10 })).status, 401)
})
test('signed-in parent (not super admin) gets 403', async () => {
  state.user = { id: 'parent' }
  assert.equal((await post(submissions, good)).status, 403)
  assert.equal((await post(uploads, { fileName: 'a.pdf', fileSize: 10 })).status, 403)
  assert.equal(state.inserted, null)
})
test('rejects invalid type, missing title, missing source, bad URL', async () => {
  Object.assign(state, { user: TIM, superAdmin: true })
  assert.equal((await post(submissions, { ...good, submission_type: 'podcast' })).status, 400)
  assert.equal((await post(submissions, { ...good, title: '' })).status, 400)
  assert.equal((await post(submissions, { submission_type: 'idea', title: 'x' })).status, 400)
  assert.equal((await post(submissions, { ...good, source_url: 'javascript:alert(1)' })).status, 400)
})
test('rejects a file path outside the caller’s own folder', async () => {
  Object.assign(state, { user: TIM, superAdmin: true })
  assert.equal((await post(submissions, { ...good, file_path: 'someone-else/f.pdf' })).status, 400)
  assert.equal((await post(submissions, { ...good, file_path: 'tim-uuid/../x.pdf' })).status, 400)
})
test('rejects a file path that was never uploaded', async () => {
  Object.assign(state, { user: TIM, superAdmin: true, signedExists: false })
  assert.equal((await post(submissions, { ...good, file_path: 'tim-uuid/abc-f.pdf' })).status, 400)
})
test('uploads: blocks bad extension and oversize, signs into own folder', async () => {
  Object.assign(state, { user: TIM, superAdmin: true })
  assert.equal((await post(uploads, { fileName: 'evil.exe', fileSize: 10 })).status, 400)
  assert.equal((await post(uploads, { fileName: 'big.mp4', fileSize: 251 * 1024 * 1024 })).status, 400)
  const r = await post(uploads, { fileName: 'My Talk (final).MP4', fileSize: 5_000_000 })
  assert.equal(r.status, 200)
  const j = await r.json()
  assert.match(j.path, /^tim-uuid\/[0-9a-f-]{36}-my-talk-final-.mp4$/)
  assert.equal(j.token, 'tok')
})
test('valid submission inserts as the caller with status defaulted', async () => {
  Object.assign(state, { user: TIM, superAdmin: true })
  delete process.env.CONTENT_PIPELINE_WEBHOOK_URL
  const r = await post(submissions, good)
  assert.equal(r.status, 201)
  assert.equal(state.inserted.submitted_by, 'tim-uuid')
  assert.equal(state.inserted.status, undefined) // DB default + RLS forces 'submitted'
  assert.equal((await r.json()).pipelineNotified, false)
})
test('failed insert removes the uploaded file', async () => {
  Object.assign(state, { user: TIM, superAdmin: true, insertError: { message: 'rls' } })
  const r = await post(submissions, { ...good, file_path: 'tim-uuid/abc-f.pdf', file_name: 'f.pdf', file_size: 10 })
  assert.equal(r.status, 500)
  assert.deepEqual(state.removed, ['tim-uuid/abc-f.pdf'])
})
test('n8n webhook: payload, secret header, signed file URL, notified flag', async () => {
  const received = []
  const server = http.createServer((req, res) => {
    let b = ''; req.on('data', c => (b += c)); req.on('end', () => { received.push({ headers: req.headers, body: JSON.parse(b) }); res.end('ok') })
  })
  await new Promise(r => server.listen(0, r))
  process.env.CONTENT_PIPELINE_WEBHOOK_URL = `http://127.0.0.1:${server.address().port}/hook`
  process.env.CONTENT_PIPELINE_WEBHOOK_SECRET = 's3cret'
  Object.assign(state, { user: TIM, superAdmin: true })
  const r = await post(submissions, { ...good, submission_type: 'video', source_url: 'https://youtu.be/abc', file_path: 'tim-uuid/abc-talk.mp4', file_name: 'talk.mp4', file_size: 99 })
  server.close()
  assert.equal(r.status, 201)
  assert.equal((await r.json()).pipelineNotified, true)
  assert.equal(received.length, 1)
  assert.equal(received[0].headers['x-content-pipeline-secret'], 's3cret')
  const b = received[0].body
  for (const k of ['submission_id', 'submission_type', 'title', 'notes', 'source_text', 'source_url', 'file_path', 'submitted_by']) assert.ok(k in b, `payload missing ${k}`)
  assert.equal(b.file_url, 'https://storage.test/tim-uuid/abc-talk.mp4?sig')
  assert.ok(state.updates.some(u => u.pipeline_notified_at))
})
test('webhook down never fails the submission', async () => {
  process.env.CONTENT_PIPELINE_WEBHOOK_URL = 'http://127.0.0.1:1/unreachable'
  Object.assign(state, { user: TIM, superAdmin: true })
  const r = await post(submissions, good)
  assert.equal(r.status, 201)
  assert.equal((await r.json()).pipelineNotified, false)
})

;(async () => {
  const origErr = console.error; console.error = () => {}
  let failed = 0
  for (const t of tests) {
    reset()
    try { await t.fn(); console.log('  ✓', t.name) } catch (e) { failed++; console.log('  ✗', t.name, '\n     ', e.message) }
  }
  console.error = origErr
  console.log(`\n${tests.length - failed}/${tests.length} passed`)
  process.exit(failed ? 1 : 0)
})()
