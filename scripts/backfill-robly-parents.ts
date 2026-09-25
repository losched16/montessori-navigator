// One-time backfill: push every existing parent into the Robly parent list.
// Uses the same syncParentToRobly() as the live per-session sync, so behavior
// matches exactly. Robly's V1 API allows only 5–20 requests/minute and each
// parent takes up to 2 calls, so parents are paced (default 10 rpm → ~12s each).
// Resumable: emails already pushed are recorded in the progress file and skipped.
//   npx tsx scripts/backfill-robly-parents.ts --only you@example.com   (test one)
//   npx tsx scripts/backfill-robly-parents.ts                          (everyone)
//   ROBLY_RPM=20 npx tsx scripts/backfill-robly-parents.ts             (faster plan)
//   ... --skip a@x.com,b@y.com                                        (exclude test accounts)
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { syncParentToRobly } from '../lib/robly'

const PROGRESS_FILE = 'scripts/.robly-backfill-done.json'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function main() {
  const env: Record<string, string> = {}
  for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) env[m[1]] = m[2].trim().replace(/^"|"$/g, '')
  }
  for (const k of ['ROBLY_API_ID', 'ROBLY_API_KEY', 'ROBLY_PARENT_LIST_ID']) {
    if (!env[k]) throw new Error(`${k} missing from .env.local`)
    process.env[k] = env[k]
  }

  const onlyIdx = process.argv.indexOf('--only')
  const only = onlyIdx > -1 ? process.argv[onlyIdx + 1]?.toLowerCase() : null
  const skipIdx = process.argv.indexOf('--skip')
  const skip = new Set(skipIdx > -1 ? process.argv[skipIdx + 1].toLowerCase().split(',') : [])
  const rpm = Number(process.env.ROBLY_RPM || 10)
  const perParentMs = Math.ceil((2 * 60_000) / rpm)

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const { data: parents, error } = await supabase
    .from('parents')
    .select('email, display_name')
    .not('email', 'is', null)
    .order('created_at', { ascending: true })
  if (error) throw error

  const done = new Set<string>(existsSync(PROGRESS_FILE) ? JSON.parse(readFileSync(PROGRESS_FILE, 'utf8')) : [])
  const todo = (parents || [])
    .map(p => ({ email: p.email!.trim().toLowerCase(), name: p.display_name }))
    .filter(p => (only ? p.email === only : !done.has(p.email) && !skip.has(p.email)))

  if (only && todo.length === 0) throw new Error(`${only} is not a parent`)
  console.log(`${todo.length} parent(s) to push (${done.size} already done), ~${Math.round((todo.length * perParentMs) / 60_000)} min at ${rpm} rpm`)

  const failed: string[] = []
  for (const [i, p] of todo.entries()) {
    const ok = await syncParentToRobly({ email: p.email, name: p.name })
    console.log(`${i + 1}/${todo.length} ${ok ? 'ok  ' : 'FAIL'} ${p.email}`)
    if (ok) {
      done.add(p.email)
      writeFileSync(PROGRESS_FILE, JSON.stringify([...done], null, 2))
    } else {
      failed.push(p.email)
    }
    if (i < todo.length - 1) await sleep(perParentMs)
  }

  console.log(`\nDone: ${todo.length - failed.length} pushed, ${failed.length} failed`)
  if (failed.length) console.log('Failed (re-run the script to retry):\n' + failed.join('\n'))
}

main().catch(e => { console.error(e); process.exit(1) })
