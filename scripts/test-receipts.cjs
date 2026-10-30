// Runs the real Stripe webhook handler for invoice.paid with fake Stripe,
// email and database, plus checks on the receipt email itself.
//   npx tsx scripts/test-receipts.cjs
const Module = require('module')
const assert = require('assert')

let sent, updates, invoiceStore, sendResult
function reset() {
  sent = []
  updates = []
  invoiceStore = {}
  sendResult = {}
}

class FakeStripe {
  constructor() {
    this.webhooks = { constructEvent: body => JSON.parse(body) }
    this.invoices = {
      retrieve: async id => JSON.parse(JSON.stringify(invoiceStore[id])),
      update: async (id, patch) => { updates.push({ id, patch }); invoiceStore[id].metadata = patch.metadata; return invoiceStore[id] },
    }
  }
}

const realEmail = require('../lib/email.ts')
const orig = Module._load
Module._load = function (req, ...rest) {
  if (req === 'stripe') return FakeStripe
  if (req === '@supabase/supabase-js') return { createClient: () => ({}) }
  if (/lib\/email$/.test(req)) {
    return {
      ...realEmail,
      sendSchoolAdminWelcome: async () => ({}),
      sendPaymentReceipt: async p => { sent.push(p); return sendResult },
    }
  }
  return orig.call(this, req, ...rest)
}
process.env.STRIPE_SECRET_KEY = 'sk_test'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'x'
const webhook = require('../app/api/stripe/webhook/route.ts')

const paidInvoice = (over = {}) => ({
  id: 'in_1', number: 'ABCD-0001', amount_paid: 217500, currency: 'usd',
  customer_email: 'julie@topsailmontessori.com', customer_name: 'Julie Smith',
  hosted_invoice_url: 'https://invoice.stripe.com/i/x', invoice_pdf: 'https://pay.stripe.com/pdf/x',
  billing_reason: 'subscription_create', status_transitions: { paid_at: 1791300000 },
  parent: { subscription_details: { metadata: { schoolName: 'Topsail Montessori LLC' } } },
  lines: { data: [{ description: '87 × (Digital + Print) School Subscription (at $25.00 / year)', period: { start: 1791300000, end: 1822836000 } }] },
  metadata: {}, ...over,
})
const fire = inv => { invoiceStore[inv.id] = inv; return webhook.POST(new Request('http://t/api/stripe/webhook', { method: 'POST', headers: { 'stripe-signature': 'x' }, body: JSON.stringify({ type: 'invoice.paid', data: { object: { id: inv.id, amount_paid: inv.amount_paid } } }) })) }

const tests = []; const test = (n, f) => tests.push({ n, f })

test('a paid school invoice sends one receipt with the right details and is stamped', async () => {
  const r = await fire(paidInvoice()); assert.equal(r.status, 200)
  assert.equal(sent.length, 1)
  const p = sent[0]
  assert.equal(p.to, 'julie@topsailmontessori.com'); assert.equal(p.schoolName, 'Topsail Montessori LLC')
  assert.equal(p.amountPaidCents, 217500); assert.equal(p.invoiceNumber, 'ABCD-0001')
  assert.equal(p.isFirstSchoolPayment, true); assert.ok(p.receiptUrl && p.pdfUrl)
  assert.equal(updates.length, 1); assert.ok(updates[0].patch.metadata.mfa_receipt_sent)
})
test('a Stripe retry of the same event does not send a second receipt', async () => {
  await fire(paidInvoice())
  const again = invoiceStore['in_1']            // now carries the stamp
  await fire(again)
  assert.equal(sent.length, 1)
})
test('$0 invoices (free codes, trials) get no receipt', async () => {
  const r = await fire(paidInvoice({ amount_paid: 0 })); assert.equal(r.status, 200)
  assert.equal(sent.length, 0)
})
test('no customer email: skipped, no error', async () => {
  const r = await fire(paidInvoice({ customer_email: null })); assert.equal(r.status, 200)
  assert.equal(sent.length, 0)
})
test('a renewal is not flagged as the first payment', async () => {
  await fire(paidInvoice({ billing_reason: 'subscription_cycle' }))
  assert.equal(sent[0].isFirstSchoolPayment, false)
})
test('a direct-parent invoice has no school name', async () => {
  await fire(paidInvoice({ amount_paid: 800, parent: { subscription_details: { metadata: { plan: 'individual_monthly' } } } }))
  assert.equal(sent[0].schoolName, null); assert.equal(sent[0].isFirstSchoolPayment, false)
})
test('an outage or rate limit returns 500 so Stripe retries, and is NOT stamped', async () => {
  sendResult = { error: { statusCode: 500, message: 'down' } }
  assert.equal((await fire(paidInvoice())).status, 500); assert.equal(updates.length, 0)
  sendResult = { error: { statusCode: 429, message: 'slow down' } }
  assert.equal((await fire(paidInvoice())).status, 500)
})
test('a permanently rejected address returns 200 (no endless retries)', async () => {
  sendResult = { error: { statusCode: 422, message: 'invalid to address' } }
  assert.equal((await fire(paidInvoice())).status, 200); assert.equal(updates.length, 0)
})

// ---- the email itself ----
test('email: amount, school, period, links and next step are present', async () => {
  const e = realEmail.buildPaymentReceiptEmail({
    to: 'a@b.c', customerName: 'Julie Smith', schoolName: 'Topsail Montessori LLC', description: '87 × (Digital + Print) (at $25.00 / year)',
    amountPaidCents: 217500, currency: 'usd', invoiceNumber: 'ABCD-0001', paidAt: new Date('2026-10-06T16:00:00Z'),
    periodStart: new Date('2026-10-06T16:00:00Z'), periodEnd: new Date('2027-10-06T16:00:00Z'),
    receiptUrl: 'https://invoice.stripe.com/i/x', pdfUrl: 'https://pay.stripe.com/pdf/x', isFirstSchoolPayment: true,
  })
  assert.equal(e.subject, 'Your receipt from Montessori Family Alliance — $2,175.00')
  for (const s of ['$2,175.00', 'October 6, 2026', 'Topsail Montessori LLC', 'ABCD-0001', 'Hi Julie,', 'October 6, 2027', 'View receipt', 'Download a PDF copy', 'Roll out']) assert.ok(e.html.includes(s), 'html missing: ' + s)
  for (const s of ['Amount paid: $2,175.00', 'Receipt number: ABCD-0001', 'https://invoice.stripe.com/i/x']) assert.ok(e.text.includes(s), 'text missing: ' + s)
  assert.ok(!/\n{3,}/.test(e.text))
})
test('email: HTML in a school name is escaped', async () => {
  const e = realEmail.buildPaymentReceiptEmail({ to: 'a@b.c', schoolName: '<script>alert(1)</script> & Co', amountPaidCents: 100, currency: 'usd', paidAt: new Date() })
  assert.ok(!e.html.includes('<script>')); assert.ok(e.html.includes('&lt;script&gt;'))
})
test('email: renewal receipts have no "what\'s next" and no first name is fine', async () => {
  const e = realEmail.buildPaymentReceiptEmail({ to: 'a@b.c', amountPaidCents: 5900, currency: 'usd', paidAt: new Date() })
  assert.ok(e.html.includes('Hello,')); assert.ok(!e.html.includes('Roll out'))
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
