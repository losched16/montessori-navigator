// Reproduce the real chat code path: calls generateChatResponse (same model
// call + MEMORY_SUGGESTIONS parsing the app uses) and prints what comes back.
//   npx tsx scripts/test-chat.ts
import { readFileSync } from 'node:fs'

async function main() {
  const env: Record<string, string> = {}
  for (const l of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = l.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, '')
  }
  process.env.NAVIGATOR_ANTHROPIC_API_KEY = env.NAVIGATOR_ANTHROPIC_API_KEY

  const { generateChatResponse } = await import('../lib/anthropic')

  const context: any = {
    parent: { display_name: 'Test Parent', montessori_experience: 'new', communication_style: 'gentle', education_context: '' },
    children: [],
    parentPreferences: {},
    homeEnvironment: [],
    activities: [],
    familyNotes: [],
    recentPlans: [],
    savedMemories: [],
    memorySummary: '',
  }

  const r = await generateChatResponse('How do I help my 3 year old with tantrums?', context, [])
  console.log('--- parsed message (what the UI shows) ---')
  console.log(JSON.stringify(r.message))
  console.log('--- message length:', r.message.length)
  console.log('--- memory_suggestions:', JSON.stringify(r.memory_suggestions))
}

main().catch(e => { console.error('ERROR:', e?.message || e) })
