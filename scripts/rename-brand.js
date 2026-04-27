/**
 * Rename "Montessori Navigator" -> "Montessori Family Alliance"
 * and standalone "Navigator" branding -> "Family Alliance"
 *
 * Excludes: node_modules, .next, articles.ts (large content file),
 * package-lock.json, and this script itself.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const EXCLUDE_DIRS = new Set(['node_modules', '.next', '.git', 'public'])
const EXCLUDE_FILES = new Set([
  'articles.ts',
  'package-lock.json',
  'rename-brand.js',
])
const INCLUDE_EXT = new Set(['.tsx', '.ts', '.json', '.md', '.css'])

let totalFilesChanged = 0
let totalReplacements = 0

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) walk(full)
    } else if (entry.isFile() && !EXCLUDE_FILES.has(entry.name)) {
      const ext = path.extname(entry.name)
      if (INCLUDE_EXT.has(ext)) processFile(full)
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')
  const original = content
  let count = 0

  // 1) Specific phrase first (more precise)
  const beforeSpecific = content
  content = content.replace(/Montessori Navigator/g, 'Montessori Family Alliance')
  count += (beforeSpecific.match(/Montessori Navigator/g) || []).length

  // 2) Standalone "Navigator" used as brand (case-sensitive, must be word boundary,
  //    avoid replacing inside already-replaced "Family Alliance" or other contexts)
  //
  //    We replace `\bNavigator\b` (word boundary) with `Family Alliance` —
  //    but ONLY when it's used as a brand reference. Checking for these patterns:
  //    - "Welcome to Navigator"
  //    - "Navigator account"
  //    - "of Navigator"
  //    - "your Navigator"
  //    - "Navigator's"
  //    - "to Navigator"
  //    - "in Navigator"
  //    - just `Navigator` standalone in JSX text
  //
  //    Simpler: replace all standalone Navigator (with word boundary)
  const beforeBare = content
  content = content.replace(/\bNavigator\b/g, 'Family Alliance')
  count += (beforeBare.match(/\bNavigator\b/g) || []).length

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8')
    totalFilesChanged++
    totalReplacements += count
    console.log(`  ${path.relative(ROOT, filePath)} (${count} replacements)`)
  }
}

console.log('Renaming brand across codebase...\n')
walk(ROOT)
console.log(`\nDone. ${totalReplacements} replacements across ${totalFilesChanged} files.`)
