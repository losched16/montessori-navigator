// Link a spouse's existing account to a family ("merge" two parent accounts).
//
//   node scripts/link-coparent.mjs <primary-parent-email> <spouse-email>            # dry run: shows the plan
//   node scripts/link-coparent.mjs <primary-parent-email> <spouse-email> --apply    # does it
//   add --move-children if the spouse already entered the same child separately
//       and you want those children moved into the shared family.
//
// What it does:
//   1. Adds the spouse to the primary parent's family (role 'parent', full access).
//   2. Removes the spouse's membership in any OTHER family only if that family
//      is empty: no children, no other members, no school enrollment. Nothing
//      holding real data is ever deleted; families with children are left in
//      place (or, with --move-children, their children move to the shared family).
//   3. Marks any pending spouse invitation for that family as accepted.
// Uses the service role from .env.local. Safe to re-run.
import { readFileSync } from 'node:fs'

const [primaryEmail, spouseEmail, ...flags] = process.argv.slice(2)
const APPLY = flags.includes('--apply')
const MOVE_CHILDREN = flags.includes('--move-children')
if (!primaryEmail || !spouseEmail) { console.error('Usage: node scripts/link-coparent.mjs <primary-email> <spouse-email> [--apply] [--move-children]'); process.exit(1) }

const env = {}
for (const l of readFileSync('.env.local', 'utf8').split('\n')) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2].replace(/^"|"$/g, '').trim() }
const H = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }
const rest = async (method, path, body) => {
  const r = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${path}`, { method, headers: H, body: body ? JSON.stringify(body) : undefined })
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${await r.text()}`)
  return r.status === 204 ? null : r.json()
}
const count = async (table, query) => (await rest('GET', `${table}?${query}&select=id`)).length
const enc = encodeURIComponent

const findParent = async (email) => {
  const rows = await rest('GET', `parents?email=ilike.${enc(email)}&select=id,user_id,display_name,email`)
  return rows[0] || null
}

const primary = await findParent(primaryEmail)
if (!primary) { console.error(`No account found for ${primaryEmail}.`); process.exit(2) }
const spouse = await findParent(spouseEmail)
if (!spouse) {
  console.log(`${spouseEmail} doesn't have an account yet — nothing to link.`)
  console.log('Have them create one from their invitation link (it joins the family automatically), then re-run this.')
  process.exit(2)
}

// The family to join: the primary parent's family that has the most children.
const pf = await rest('GET', `family_members?parent_id=eq.${primary.id}&role=eq.primary&select=family_id,created_at`)
if (!pf.length) { console.error(`${primaryEmail} isn't the primary parent of any family.`); process.exit(2) }
const scored = await Promise.all(pf.map(async f => ({ ...f, kids: await count('children', `family_id=eq.${f.family_id}`) })))
scored.sort((a, b) => b.kids - a.kids || a.created_at.localeCompare(b.created_at))
const target = scored[0]
const [fam] = await rest('GET', `families?id=eq.${target.family_id}&select=name`)

console.log(`${APPLY ? 'APPLYING' : 'DRY RUN'} — link ${spouse.display_name || spouse.email} <${spouse.email}>`)
console.log(`   into ${fam?.name || target.family_id} (${target.kids} child${target.kids === 1 ? '' : 'ren'}), primary: ${primary.display_name || primary.email}\n`)

const steps = []
const already = await count('family_members', `family_id=eq.${target.family_id}&parent_id=eq.${spouse.id}`)
if (already) console.log('✓ already a member of the shared family')
else steps.push({ say: 'add spouse to the shared family as a parent (full access)', run: () => rest('POST', 'family_members', { family_id: target.family_id, parent_id: spouse.id, role: 'parent', permissions: 'full' }) })

const others = (await rest('GET', `family_members?parent_id=eq.${spouse.id}&family_id=neq.${target.family_id}&select=id,family_id,role`))
for (const o of others) {
  const [kids, people, enrolled] = await Promise.all([
    count('children', `family_id=eq.${o.family_id}`),
    count('family_members', `family_id=eq.${o.family_id}`),
    count('school_families', `family_id=eq.${o.family_id}`),
  ])
  const [of] = await rest('GET', `families?id=eq.${o.family_id}&select=name`)
  const label = `${of?.name || o.family_id.slice(0, 8)} (${kids} children, ${people} member${people === 1 ? '' : 's'}${enrolled ? ', school-enrolled' : ''})`
  if (!kids && people === 1 && !enrolled) {
    steps.push({ say: `remove the spouse's empty personal family: ${label}`, run: () => rest('DELETE', `family_members?id=eq.${o.id}`) })
  } else if (kids && people === 1 && !enrolled && MOVE_CHILDREN) {
    steps.push({ say: `move ${kids} child(ren) from ${label} into the shared family, then remove the empty membership`, run: async () => {
      await rest('PATCH', `children?family_id=eq.${o.family_id}`, { family_id: target.family_id })
      await rest('DELETE', `family_members?id=eq.${o.id}`)
    } })
  } else {
    console.log(`! leaving ${label} in place — it has ${kids ? 'children' : 'other members or a school enrollment'}.` +
      (kids ? ' If it is the same child entered twice, re-run with --move-children (or tell me and we will review it).' : ''))
  }
}

const pending = await rest('GET', `invitations?type=eq.co_parent&status=eq.pending&family_id=eq.${target.family_id}&email=ilike.${enc(spouse.email)}&select=id`)
if (pending.length) steps.push({ say: `mark ${pending.length} pending invitation(s) to ${spouse.email} as accepted`, run: () => rest('PATCH', `invitations?id=in.(${pending.map(p => p.id).join(',')})`, { status: 'accepted', accepted_at: new Date().toISOString(), accepted_by: spouse.user_id }) })

if (!steps.length) { console.log('\nNothing to do.'); process.exit(0) }
steps.forEach((s, i) => console.log(`${i + 1}. ${s.say}`))
if (!APPLY) { console.log('\nDry run only. Re-run with --apply to make these changes.'); process.exit(0) }
for (const s of steps) await s.run()
console.log('\nDone.')
