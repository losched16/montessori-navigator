// Runs the real Stripe webhook handler for school checkouts against an
// in-memory Supabase fake, covering admin auto-linking.
//   npx tsx scripts/test-school-admin-autolink.cjs
const Module = require('module')
const assert = require('assert')

// ---------- in-memory Supabase fake ----------
let db, users, emails
function reset() {
  db = { schools: [], school_staff: [], parents: [] }
  users = []
  emails = []
}
let seq = 0
function table(name) {
  const q = { op: 'select', filters: [], payload: null, returning: false, single: false, maybe: false }
  const rows = () => db[name].filter(r => q.filters.every(([k, v]) => r[k] === v))
  const run = () => {
    if (q.op === 'insert') {
      const row = { id: `${name}-${++seq}`, ...q.payload }
      db[name].push(row)
      return { data: q.single ? row : [row], error: null }
    }
    if (q.op === 'update') {
      const hit = rows(); hit.forEach(r => Object.assign(r, q.payload))
      return { data: q.returning ? hit : null, error: null }
    }
    const hit = rows()
    if (q.maybe || q.single) return { data: hit[0] ?? null, error: null }
    return { data: hit, error: null }
  }
  const b = {
    select() { if (q.op !== 'select') q.returning = true; return b },
    insert(p) { q.op = 'insert'; q.payload = p; return b },
    update(p) { q.op = 'update'; q.payload = p; return b },
    eq(k, v) { q.filters.push([k, v]); return b },
    or() { return b },
    maybeSingle() { q.maybe = true; return Promise.resolve(run()) },
    single() { q.single = true; return Promise.resolve(run()) },
    then(res, rej) { return Promise.resolve(run()).then(res, rej) },
  }
  return b
}
const fakeSupabase = {
  from: table,
  auth: {
    admin: {
      getUserById: async id => ({ data: { user: users.find(u => u.id === id) || null } }),
      listUsers: async ({ page }) => ({ data: { users: page === 1 ? users : [] }, error: null }),
    },
  },
}

// ---------- fake Stripe ----------
class FakeStripe {
  constructor() {
    this.webhooks = { constructEvent: body => JSON.parse(body) }
    this.subscriptions = { retrieve: async id => ({ id, status: 'active', trial_end: null, current_period_end: 1800000000, items: { data: [] } }) }
  }
}

const orig = Module._load
Module._load = function (req, ...rest) {
  if (req === 'stripe') return FakeStripe
  if (req === '@supabase/supabase-js') return { createClient: () => fakeSupabase }
  if (/lib\/email$/.test(req)) return { sendSchoolAdminWelcome: async a => { emails.push(a) } }
  return orig.call(this, req, ...rest)
}
const webhook = require('../app/api/stripe/webhook/route.ts')

function checkout({ email, adminUserId, customer = 'cus_1' }) {
  const event = {
    type: 'checkout.session.completed',
    data: { object: {
      customer, subscription: 'sub_1', customer_email: email, customer_details: { email },
      metadata: { plan: 'school', schoolName: 'Staunton Montessori School', billedQuantity: '73', ...(adminUserId ? { admin_user_id: adminUserId } : {}) },
    } },
  }
  return webhook.POST(new Request('http://t/api/stripe/webhook', { method: 'POST', headers: { 'stripe-signature': 'x' }, body: JSON.stringify(event) }))
}
const staffFor = uid => db.school_staff.filter(s => s.user_id === uid)

const tests = []
const test = (n, f) => tests.push({ n, f })

test('existing verified account with the checkout email becomes admin + gets welcome', async () => {
  users.push({ id: 'kim', email: 'Kim@StauntonMontessori.org', email_confirmed_at: '2026-05-21' })
  assert.equal((await checkout({ email: 'kim@stauntonmontessori.org' })).status, 200)
  assert.equal(db.schools.length, 1)
  assert.equal(db.schools[0].admin_user_id, 'kim')
  assert.equal(staffFor('kim')[0]?.role, 'admin')
  assert.equal(emails.length, 1)
})
test('signed-in buyer wins even when billing email differs (Kim’s office-email case)', async () => {
  users.push({ id: 'kim', email: 'kim@stauntonmontessori.org', email_confirmed_at: 'x' })
  await checkout({ email: 'office@stauntonmontessori.org', adminUserId: 'kim' })
  assert.equal(db.schools[0].admin_user_id, 'kim')
  assert.equal(staffFor('kim').length, 1)
})
test('unverified account is NOT linked', async () => {
  users.push({ id: 'u1', email: 'new@school.org', email_confirmed_at: null })
  await checkout({ email: 'new@school.org' })
  assert.equal(db.schools[0].admin_user_id, undefined)
  assert.equal(db.school_staff.length, 0)
  assert.equal(emails.length, 0)
})
test('brand-new buyer (no account): school created, left for signup + claim', async () => {
  const r = await checkout({ email: 'nobody@school.org' })
  assert.equal(r.status, 200)
  assert.equal(db.schools.length, 1)
  assert.equal(db.school_staff.length, 0)
})
test('never replaces a different existing admin', async () => {
  users.push({ id: 'kim', email: 'kim@x.org', email_confirmed_at: 'x' })
  db.schools.push({ id: 'school-9', stripe_customer_id: 'cus_1', admin_user_id: 'someone-else' })
  await checkout({ email: 'kim@x.org' })
  assert.equal(db.schools[0].admin_user_id, 'someone-else')
  assert.equal(staffFor('kim').length, 0)
})
test('webhook retry is idempotent: one staff row, one welcome email', async () => {
  users.push({ id: 'kim', email: 'kim@x.org', email_confirmed_at: 'x' })
  await checkout({ email: 'kim@x.org' })
  await checkout({ email: 'kim@x.org' })
  assert.equal(db.schools.length, 1)
  assert.equal(staffFor('kim').length, 1)
  assert.equal(emails.length, 1)
})
test('bogus admin_user_id in metadata falls back to email match', async () => {
  users.push({ id: 'kim', email: 'kim@x.org', email_confirmed_at: 'x' })
  await checkout({ email: 'kim@x.org', adminUserId: 'does-not-exist' })
  assert.equal(db.schools[0].admin_user_id, 'kim')
})

;(async () => {
  const log = console.log, err = console.error
  let failed = 0
  for (const t of tests) {
    reset(); console.log = () => {}; console.error = () => {}
    try { await t.f(); console.log = log; console.log('  ✓', t.n) }
    catch (e) { console.log = log; failed++; console.log('  ✗', t.n, '\n     ', e.message) }
  }
  console.error = err
  console.log(`\n${tests.length - failed}/${tests.length} passed`)
  process.exit(failed ? 1 : 0)
})()
