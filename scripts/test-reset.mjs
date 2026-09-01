// Diagnose the forgot-password flow. Tests ONLY the Supabase recovery-link
// generation (admin.generateLink does not send an email), so it's safe to run.
//   node scripts/test-reset.mjs someone@example.com
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const envText = readFileSync('.env.local', 'utf8')
const env = {}
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].replace(/^"|"$/g, '')
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const email = process.argv[2] || 'clint@getaims.co'
const appUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
console.log('Testing recovery link generation for:', email)
console.log('redirectTo:', `${appUrl}/auth/reset-password`)

const { data, error } = await supabase.auth.admin.generateLink({
  type: 'recovery',
  email,
  options: { redirectTo: `${appUrl}/auth/reset-password` },
})

if (error) {
  console.log('❌ generateLink FAILED:', error.message)
} else if (!data?.properties?.action_link) {
  console.log('❌ No action_link returned')
} else {
  // Mask the token but show the structure so we can see the domain + redirect
  const link = data.properties.action_link
  const masked = link.replace(/token=[^&]+/, 'token=***').replace(/access_token=[^&]+/, 'access_token=***')
  console.log('✅ generateLink OK')
  console.log('   link:', masked)
}
