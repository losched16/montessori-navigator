// Runs the real /api/invite/info, /api/invite/accept and /api/school/families
// handlers against an in-memory database. RLS is not modelled — these tests
// cover the logic; the live checks cover what RLS blocks.
//   npx tsx scripts/test-invite-routes.cjs
const Module = require('module')
const assert = require('assert')

let db, authUser, seq
function reset() {
  seq = 0
  authUser = null
  db = { invitations: [], parents: [], family_members: [], families: [], children: [], school_families: [], school_staff: [], schools: [] }
}

function table(name) {
  const q = { op: 'select', filters: [], payload: null, head: false, count: false, returning: false }
  const match = r => q.filters.every(([k, op, v]) => (op === 'eq' ? r[k] === v : op === 'neq' ? r[k] !== v : v.includes(r[k])))
  const run = () => {
    if (q.op === 'insert') {
      const row = { id: `${name}-${++seq}`, created_at: new Date(2026, 0, seq).toISOString(), ...q.payload }
      db[name].push(row)
      return { data: row, error: null }
    }
    if (q.op === 'update') { const hit = db[name].filter(match); hit.forEach(r => Object.assign(r, q.payload)); return { data: hit, error: null } }
    if (q.op === 'delete') { const keep = db[name].filter(r => !match(r)); db[name].length = 0; db[name].push(...keep); return { data: null, error: null } }
    const rows = db[name].filter(match).map(r => withJoins(name, r))
    if (q.head) return { count: rows.length, data: null, error: null }
    return { data: rows, error: null }
  }
  const one = (maybe) => { const r = run(); return Promise.resolve({ data: r.data[0] ?? null, error: null }) }
  const b = {
    select(_c, o) { if (o?.head) { q.head = true } else if (q.op !== 'select') q.returning = true; return b },
    insert(p) { q.op = 'insert'; q.payload = p; return b },
    update(p) { q.op = 'update'; q.payload = p; return b },
    delete() { q.op = 'delete'; return b },
    eq(k, v) { q.filters.push([k, 'eq', v]); return b },
    neq(k, v) { q.filters.push([k, 'neq', v]); return b },
    in(k, v) { q.filters.push([k, 'in', v]); return b },
    order() { return b }, limit() { return b },
    maybeSingle() { if (q.op === 'insert') return Promise.resolve(run()); return one(true) },
    single() { if (q.op === 'insert') return Promise.resolve(run()); return one(false) },
    then(res, rej) { return Promise.resolve(run()).then(res, rej) },
  }
  return b
}
// family_members.parents(...) join used by /api/school/families
function withJoins(name, r) {
  if (name === 'family_members') return { ...r, parents: db.parents.find(p => p.id === r.parent_id) || null }
  return r
}
const client = { from: table, auth: { getUser: async () => ({ data: { user: authUser } }) } }

const orig = Module._load
Module._load = function (req, ...rest) {
  if (req === 'next/headers') return { cookies: () => ({ get: () => undefined, set() {} }) }
  if (req === '@supabase/ssr') return { createServerClient: () => client }
  if (req === '@supabase/supabase-js') return { createClient: () => client }
  if (/lib\/school-invite-limits$/.test(req)) return { getInviteUsage: async () => ({ reachedLimit: false }) }
  return orig.call(this, req, ...rest)
}
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'a'
process.env.SUPABASE_SERVICE_ROLE_KEY = 's'

const info = require('../app/api/invite/info/route.ts')
const accept = require('../app/api/invite/accept/route.ts')
const families = require('../app/api/school/families/route.ts')
const getInfo = t => info.GET({ nextUrl: new URL('http://t/api?token=' + encodeURIComponent(t)) })
const postAccept = t => accept.POST(new Request('http://t/api', { method: 'POST', body: JSON.stringify({ token: t }) }))

const future = new Date(Date.now() + 86400000).toISOString()
function seedInvite(over = {}) {
  db.families.push({ id: 'fam-shared', name: "Raquel Dean's Family" })
  db.invitations.push({ id: 'inv-1', type: 'co_parent', token: 'tok-1', family_id: 'fam-shared', email: 'matthew@x.com', status: 'pending', expires_at: future, ...over })
}

const tests = []; const test = (n, f) => tests.push({ n, f })

test('info: a signed-out visitor can read a valid invitation', async () => {
  seedInvite()
  const r = await getInfo('tok-1'); assert.equal(r.status, 200)
  const b = await r.json(); assert.equal(b.type, 'co_parent'); assert.equal(b.familyName, "Raquel Dean's Family"); assert.equal(b.email, 'matthew@x.com'); assert.equal(b.expired, false)
})
test('info: unknown / empty tokens are 404', async () => {
  assert.equal((await getInfo('nope')).status, 404)
  assert.equal((await getInfo('')).status, 404)
})
test('accept: signed-out is 401', async () => {
  seedInvite(); assert.equal((await postAccept('tok-1')).status, 401)
})
test('accept: a different email is refused with guidance', async () => {
  seedInvite(); authUser = { id: 'u2', email: 'someone.else@x.com' }
  const r = await postAccept('tok-1'); assert.equal(r.status, 403)
  assert.match((await r.json()).error, /sent to matthew@x\.com/)
  assert.equal(db.family_members.length, 0)
})
test('accept: brand-new spouse (no parent profile) joins and the invite is marked accepted', async () => {
  seedInvite(); authUser = { id: 'u-matt', email: 'Matthew@X.com' } // case differs on purpose
  const r = await postAccept('tok-1'); assert.equal(r.status, 200)
  const parent = db.parents.find(p => p.user_id === 'u-matt'); assert.ok(parent)
  assert.ok(db.family_members.find(m => m.family_id === 'fam-shared' && m.parent_id === parent.id && m.role === 'parent'))
  assert.equal(db.invitations[0].status, 'accepted')
  assert.equal(db.invitations[0].accepted_by, 'u-matt')
})
test('accept: an empty solo family is dropped so the app opens the shared one', async () => {
  seedInvite(); authUser = { id: 'u-matt', email: 'matthew@x.com' }
  db.parents.push({ id: 'p-matt', user_id: 'u-matt', email: 'matthew@x.com', display_name: 'Matthew' })
  db.families.push({ id: 'fam-solo', name: "Matthew's Family" })
  db.family_members.push({ id: 'fm-solo', family_id: 'fam-solo', parent_id: 'p-matt', role: 'primary' })
  assert.equal((await postAccept('tok-1')).status, 200)
  assert.ok(!db.family_members.find(m => m.id === 'fm-solo'), 'solo membership should be removed')
  assert.ok(db.family_members.find(m => m.family_id === 'fam-shared' && m.parent_id === 'p-matt'))
})
test('accept: a solo family WITH a child is never touched', async () => {
  seedInvite(); authUser = { id: 'u-matt', email: 'matthew@x.com' }
  db.parents.push({ id: 'p-matt', user_id: 'u-matt', email: 'matthew@x.com', display_name: 'Matthew' })
  db.families.push({ id: 'fam-solo', name: "Matthew's Family" })
  db.family_members.push({ id: 'fm-solo', family_id: 'fam-solo', parent_id: 'p-matt', role: 'primary' })
  db.children.push({ id: 'c1', family_id: 'fam-solo' })
  await postAccept('tok-1')
  assert.ok(db.family_members.find(m => m.id === 'fm-solo'), 'solo family with a child must be kept')
})
test('accept: a solo family enrolled at a school is never touched', async () => {
  seedInvite(); authUser = { id: 'u-matt', email: 'matthew@x.com' }
  db.parents.push({ id: 'p-matt', user_id: 'u-matt', email: 'matthew@x.com', display_name: 'Matthew' })
  db.family_members.push({ id: 'fm-solo', family_id: 'fam-solo', parent_id: 'p-matt', role: 'primary' })
  db.school_families.push({ id: 'sf1', school_id: 's1', family_id: 'fam-solo' })
  await postAccept('tok-1')
  assert.ok(db.family_members.find(m => m.id === 'fm-solo'))
})
test('accept: revoked and expired invitations are refused', async () => {
  seedInvite({ status: 'revoked' }); authUser = { id: 'u', email: 'matthew@x.com' }
  assert.equal((await postAccept('tok-1')).status, 400)
  reset(); seedInvite({ expires_at: new Date(Date.now() - 1000).toISOString() }); authUser = { id: 'u', email: 'matthew@x.com' }
  assert.equal((await postAccept('tok-1')).status, 400)
  assert.equal(db.invitations[0].status, 'expired')
})
test('accept: joining twice is refused', async () => {
  seedInvite(); authUser = { id: 'u-matt', email: 'matthew@x.com' }
  assert.equal((await postAccept('tok-1')).status, 200)
  db.invitations[0].status = 'pending'
  assert.equal((await postAccept('tok-1')).status, 400)
})

// ---- /api/school/families ----
function seedSchool() {
  db.school_staff.push({ user_id: 'maya', school_id: 's1' })
  db.parents.push({ id: 'p1', display_name: 'Raquel Dean', email: 'raquel@private.com' }, { id: 'p2', display_name: 'Matthew', email: 'matt@private.com' }, { id: 'p3', display_name: null, email: 'casey@private.com' })
  db.families.push({ id: 'f1', name: 'The Dean Family' }, { id: 'f2', name: 'My Family' }, { id: 'f3', name: null })
  db.school_families.push({ id: 'e1', school_id: 's1', family_id: 'f1', status: 'active', joined_at: '2026-09-01' }, { id: 'e2', school_id: 's1', family_id: 'f2', status: 'active', joined_at: '2026-09-02' }, { id: 'e3', school_id: 's1', family_id: 'f3', status: 'active', joined_at: '2026-09-03' }, { id: 'e4', school_id: 'OTHER', family_id: 'f9', status: 'active', joined_at: '2026-09-03' })
  db.family_members.push({ id: 'm1', family_id: 'f1', parent_id: 'p1', role: 'primary' }, { id: 'm2', family_id: 'f1', parent_id: 'p2', role: 'parent' }, { id: 'm3', family_id: 'f2', parent_id: 'p2', role: 'primary' }, { id: 'm4', family_id: 'f3', parent_id: 'p3', role: 'primary' })
  db.children.push({ id: 'c1', family_id: 'f1' }, { id: 'c2', family_id: 'f1' }, { id: 'c3', family_id: 'f2' })
}
test('families: signed-out 401, non-staff 403', async () => {
  seedSchool(); assert.equal((await families.GET()).status, 401)
  authUser = { id: 'random-parent' }; assert.equal((await families.GET()).status, 403)
})
test('families: names, counts and linked parents for the admin’s own school only', async () => {
  seedSchool(); authUser = { id: 'maya' }
  const r = await families.GET(); assert.equal(r.status, 200)
  const { families: list } = await r.json()
  assert.equal(list.length, 3, 'other school’s family must not appear')
  const byName = Object.fromEntries(list.map(f => [f.displayName, f]))
  assert.equal(byName['The Dean Family'].childrenCount, 2)
  assert.deepEqual(byName['The Dean Family'].parents, ['Raquel Dean', 'Matthew'])
  assert.ok(byName["Matthew's Family"], 'generic "My Family" falls back to the primary parent')
  assert.equal(byName["Matthew's Family"].childrenCount, 1)
  assert.ok(byName["casey's Family"], 'no display name falls back to the email prefix')
})
test('families: never leaks emails or child details', async () => {
  seedSchool(); authUser = { id: 'maya' }
  const text = JSON.stringify(await (await families.GET()).json())
  assert.ok(!/@private\.com/.test(text), 'no parent emails in the response')
  assert.ok(!/"c[0-9]"/.test(text), 'no child ids in the response')
})

;(async () => {
  const err = console.error; console.error = () => {}
  let failed = 0
  for (const t of tests) {
    reset()
    try { await t.f(); console.log('  ✓', t.n) } catch (e) { failed++; console.log('  ✗', t.n, '\n     ', e.message) }
  }
  console.error = err
  console.log(`\n${tests.length - failed}/${tests.length} passed`)
  process.exit(failed ? 1 : 0)
})()
