// Export every article from lib/articles.ts into its own markdown file in
// exported-articles/. Each file has YAML frontmatter (slug, title, author,
// date, categories, tags, excerpt, videoIds) followed by the content body.
//
// The content field is HTML (preserved from the original WordPress export).
// Markdown allows embedded HTML, so the .md files render fine as-is.
//
// Run from the project root:
//   npx tsx scripts/export-articles.ts

import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { ARTICLES, type Article } from '../lib/articles'

const OUT_DIR = join(process.cwd(), 'exported-articles')

// YAML doesn't have a single canonical way to escape strings; for our use we
// quote everything as a double-quoted string with backslash escapes for "
// and \. Newlines and special chars stay readable.
function yamlString(s: string): string {
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ') + '"'
}

function yamlList(items: string[]): string {
  if (items.length === 0) return '[]'
  return '\n' + items.map(i => '  - ' + yamlString(i)).join('\n')
}

function frontmatter(a: Article): string {
  const parts = [
    `slug: ${yamlString(a.slug)}`,
    `title: ${yamlString(a.title)}`,
    `author: ${yamlString(a.author || '')}`,
    `date: ${yamlString(a.date || '')}`,
    `categories: ${yamlList(a.categories || [])}`,
    `tags: ${yamlList(a.tags || [])}`,
    `excerpt: ${yamlString(a.excerpt || '')}`,
  ]
  if (a.videoIds && a.videoIds.length > 0) {
    parts.push(`videoIds: ${yamlList(a.videoIds)}`)
  }
  return '---\n' + parts.join('\n') + '\n---\n'
}

function safeSlug(s: string): string {
  // Files on Windows can't contain: \ / : * ? " < > |
  return s.replace(/[\\/:*?"<>|]/g, '-').slice(0, 150)
}

function main() {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true })
  }

  let written = 0
  let skipped = 0
  const slugSeen = new Set<string>()

  for (const article of ARTICLES) {
    let slug = safeSlug(article.slug || `article-${written}`)
    if (!slug) {
      skipped++
      continue
    }
    // Handle duplicate slugs by suffixing
    let candidate = slug
    let dupCounter = 2
    while (slugSeen.has(candidate)) {
      candidate = `${slug}-${dupCounter}`
      dupCounter++
    }
    slugSeen.add(candidate)

    const fm = frontmatter(article)
    const body = article.content || ''
    const md = fm + '\n' + body + '\n'

    writeFileSync(join(OUT_DIR, candidate + '.md'), md, 'utf8')
    written++
  }

  console.log(`Wrote ${written} articles to ${OUT_DIR}`)
  if (skipped > 0) console.log(`Skipped ${skipped} articles with empty slugs`)
}

main()
