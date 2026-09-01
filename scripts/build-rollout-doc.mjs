// Builds a clean, shareable rollout document (HTML artifact) from schools.json.
import { readFileSync, writeFileSync } from 'node:fs'

const SRC = process.argv[2]
const OUT = process.argv[3]
const rows = JSON.parse(readFileSync(SRC, 'utf8'))

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const totalUsers = rows.reduce((a, r) => a + (r.users || 0), 0)
const totalSeats = rows.reduce((a, r) => a + (r.seats || 0), 0)

const trs = rows.map((r, i) => {
  const badEmail = /\.coma\b/.test(r.email) || !/@/.test(r.email)
  return `<tr>
    <td class="num">${i + 1}</td>
    <td class="school">${esc(r.school)}</td>
    <td>${esc(r.contact)}</td>
    <td class="${badEmail ? 'email flag' : 'email'}">${esc(r.email)}${badEmail ? ' <span class="warn">⚠ check</span>' : ''}</td>
    <td class="n">${r.users ?? '—'}</td>
    <td class="n seats">${r.seats ?? '—'}</td>
    <td><code>${esc(r.code)}</code></td>
  </tr>`
}).join('\n')

const html = `<style>
  :root{
    --paper:#ffffff; --cream:#faf7f2; --ink:#211636; --soft:#5f5470; --line:#e8e0d4;
    --plum:#2d1b4e; --purple:#4a2c82; --terra:#c07a38; --sage:#3f7a6d;
    --serif:Georgia,'Cormorant Garamond',serif; --sans:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  }
  *{box-sizing:border-box;}
  body{margin:0;background:var(--cream);}
  .doc{max-width:1080px;margin:0 auto;padding:48px 28px 80px;color:var(--ink);font-family:var(--sans);line-height:1.55;}
  .doc .kicker{font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:700;color:var(--terra);}
  .doc h1{font-family:var(--serif);font-weight:700;font-size:clamp(1.9rem,4vw,2.7rem);line-height:1.1;margin:8px 0 10px;}
  .doc .lede{color:var(--soft);font-size:1.05rem;max-width:680px;margin:0 0 28px;}
  .doc .stats{display:flex;gap:16px;flex-wrap:wrap;margin:0 0 32px;}
  .doc .stat{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:16px 20px;min-width:130px;}
  .doc .stat b{display:block;font-family:var(--serif);font-size:1.9rem;color:var(--plum);line-height:1;}
  .doc .stat span{font-size:12px;color:var(--soft);}
  .doc h2{font-family:var(--serif);font-size:1.4rem;margin:38px 0 12px;border-top:1px solid var(--line);padding-top:26px;}
  .doc ol.steps{padding-left:20px;margin:0;}
  .doc ol.steps li{margin-bottom:8px;color:var(--ink);}
  .doc .notes{background:var(--paper);border:1px solid var(--line);border-left:3px solid var(--terra);border-radius:10px;padding:18px 22px;margin-top:6px;}
  .doc .notes li{margin-bottom:8px;}
  .doc .notes b{color:var(--plum);}
  .doc .tablewrap{overflow-x:auto;border:1px solid var(--line);border-radius:14px;margin-top:6px;background:var(--paper);}
  .doc table{border-collapse:collapse;width:100%;font-size:13.5px;}
  .doc thead th{background:var(--plum);color:#fff;text-align:left;padding:12px 14px;font-weight:600;font-size:12px;letter-spacing:.02em;white-space:nowrap;}
  .doc tbody td{padding:11px 14px;border-top:1px solid var(--line);vertical-align:middle;}
  .doc tbody tr:nth-child(even){background:#fcfaf6;}
  .doc td.num{color:var(--soft);font-variant-numeric:tabular-nums;}
  .doc td.school{font-weight:600;}
  .doc td.email{color:var(--soft);}
  .doc td.n{text-align:right;font-variant-numeric:tabular-nums;}
  .doc td.seats{font-weight:600;color:var(--plum);}
  .doc code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;background:#f3edff;color:#3a2568;padding:3px 7px;border-radius:5px;white-space:nowrap;}
  .doc .warn{color:#b4541f;font-size:11px;font-weight:600;}
  .doc .foot{margin-top:34px;color:var(--soft);font-size:12.5px;}
</style>

<div class="doc">
  <div class="kicker">Implementation · The Montessori Foundation</div>
  <h1>MFA 26/27 School Memberships — Codes &amp; Rollout</h1>
  <p class="lede">Each partner school below has a unique, single-use code for <b>free access</b> to Montessori Family Alliance for 26/27 — <b>no credit card required</b>. This sheet is the source of truth for the rollout.</p>

  <div class="stats">
    <div class="stat"><b>${rows.length}</b><span>partner schools</span></div>
    <div class="stat"><b>${totalUsers.toLocaleString()}</b><span>paid family users</span></div>
    <div class="stat"><b>${totalSeats.toLocaleString()}</b><span>total seats (incl. +20 staff each)</span></div>
    <div class="stat"><b>100%</b><span>off · no card</span></div>
  </div>

  <h2>How each school redeems</h2>
  <ol class="steps">
    <li>Go to <b>familyalliance.montessori.org/for-schools/pricing</b></li>
    <li>Enter the school's <b>number of family users</b> (the "Paid Users" value in the table)</li>
    <li>Click <b>Add promotion code</b> and enter the school's <b>Unique Code</b></li>
    <li>Total drops to <b>$0</b> — <b>no credit card is requested</b></li>
    <li>The school's admin account is created — they can invite up to <b>Seats</b> (users + 20 staff)</li>
  </ol>

  <h2>Notes for the team</h2>
  <ul class="notes">
    <li><b>Single-use:</b> each code works exactly once — it can't be shared or reused.</li>
    <li><b>Free, no card, no auto-charge:</b> the coupon is 100% off ongoing, so checkout never asks for a card and <b>nobody will be auto-billed</b>. The subscription stays free until you convert it — <b>renewals for 27/28 are handled manually</b> by your team (issue a paid checkout or new codes when the time comes).</li>
    <li><b>+20 staff buffer is automatic:</b> "Seats" already includes 20 staff on top of paid users. The school only enters its paid-user count; the buffer is applied by the platform.</li>
    <li><b>One email needs fixing:</b> any address flagged <span class="warn">⚠ check</span> below (e.g. a <code>.coma</code> typo) should be corrected before sending.</li>
    <li><b>Tracking:</b> Stripe → Products → Coupons → "MFA 26/27 School Membership Free" → Promotion codes shows redemption status as schools sign up.</li>
  </ul>

  <h2>Schools &amp; codes</h2>
  <div class="tablewrap">
    <table>
      <thead><tr>
        <th>#</th><th>School</th><th>Contact</th><th>Email</th><th>Paid&nbsp;Users</th><th>Seats</th><th>Unique&nbsp;Code</th>
      </tr></thead>
      <tbody>
        ${trs}
      </tbody>
    </table>
  </div>

  <p class="foot">Generated from the MFA 26/27 School Memberships sheet. Codes are live in Stripe. Seats = paid users + 20 staff buffer.</p>
</div>`

writeFileSync(OUT, html, 'utf8')
console.log('Wrote', OUT, `(${Math.round(html.length / 1024)} KB)`)
