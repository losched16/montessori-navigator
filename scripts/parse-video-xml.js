const fs = require('fs')
const path = require('path')

// ── Config ──
const XML_DIR = path.resolve('C:/Users/thelo/Downloads')
const ARTICLES_FILE = path.join(__dirname, '..', 'lib', 'articles.ts')

const XML_FILES = [
  'montessorifoundationmontessorifamilyalliance.WordPress.2026-03-24.xml',
]

// Categories to filter out
const EXCLUDED_CATEGORIES = [
  'The International Montessori Council',
  'Webcasts / IMC',
  'IMC',
  'MFA',
  'Uncategorized',
]

// Skip articles with any of these categories (admin-focused content)
const SKIP_CATEGORIES = [
  'Administrative Team',
  'Montessori Administrators',
  'Boards',
  'Communication',
  'School Leadership',
]

// ── Helpers ──

function extractCDATA(text) {
  const match = text.match(/<!\[CDATA\[([\s\S]*?)\]\]>/)
  return match ? match[1] : text.replace(/<[^>]+>/g, '').trim()
}

function extractYouTubeIds(html) {
  const ids = new Set()
  // Match youtube.com/embed/VIDEO_ID
  const embedRegex = /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/g
  let m
  while ((m = embedRegex.exec(html)) !== null) {
    ids.add(m[1])
  }
  // Match youtu.be/VIDEO_ID
  const shortRegex = /youtu\.be\/([a-zA-Z0-9_-]+)/g
  while ((m = shortRegex.exec(html)) !== null) {
    ids.add(m[1])
  }
  // Match youtube.com/watch?v=VIDEO_ID
  const watchRegex = /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g
  while ((m = watchRegex.exec(html)) !== null) {
    ids.add(m[1])
  }
  return Array.from(ids)
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80)
}

function htmlToText(html) {
  if (!html) return ''
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8230;/g, '...')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function parseItems(xml) {
  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]

    // Only published posts (status and type wrapped in CDATA)
    const statusMatch = itemXml.match(/<wp:status>[\s\S]*?<\/wp:status>/)
    const statusText = statusMatch ? extractCDATA(statusMatch[0].replace(/<\/?wp:status>/g, '')) : ''
    if (statusText !== 'publish') continue

    const typeMatch = itemXml.match(/<wp:post_type>[\s\S]*?<\/wp:post_type>/)
    const typeText = typeMatch ? extractCDATA(typeMatch[0].replace(/<\/?wp:post_type>/g, '')) : ''
    if (typeText !== 'post') continue

    // Title
    const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/)
    const title = titleMatch ? extractCDATA(titleMatch[1]).trim() : ''
    if (!title) continue

    // Author
    const authorMatch = itemXml.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/)
    const authorRaw = authorMatch ? extractCDATA(authorMatch[1]).trim() : ''

    // Date
    const dateMatch = itemXml.match(/<wp:post_date>([\s\S]*?)<\/wp:post_date>/)
    const dateRaw = dateMatch ? extractCDATA(dateMatch[1]).trim() : ''
    const date = dateRaw ? dateRaw.split(' ')[0] : ''

    // Content
    const contentMatch = itemXml.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/)
    const contentHtml = contentMatch ? extractCDATA(contentMatch[1]) : ''

    // Extract YouTube IDs
    const videoIds = extractYouTubeIds(contentHtml)
    if (videoIds.length === 0) continue // skip posts without videos

    // Categories
    const categories = []
    const catRegex = /<category domain="category"[^>]*><!\[CDATA\[(.*?)\]\]><\/category>/g
    let catMatch
    while ((catMatch = catRegex.exec(itemXml)) !== null) {
      const cat = catMatch[1].trim()
      if (!EXCLUDED_CATEGORIES.includes(cat)) {
        categories.push(cat)
      }
    }

    // Tags
    const tags = []
    const tagRegex = /<category domain="post_tag"[^>]*><!\[CDATA\[(.*?)\]\]><\/category>/g
    let tagMatch
    while ((tagMatch = tagRegex.exec(itemXml)) !== null) {
      tags.push(tagMatch[1].trim())
    }

    // Always include Video category
    if (!categories.includes('Video')) {
      categories.push('Video')
    }

    // Convert content to text
    const contentText = htmlToText(contentHtml)
    const excerpt = contentText.substring(0, 200).replace(/\n/g, ' ').trim() + (contentText.length > 200 ? '...' : '')

    const slug = slugify(title)

    items.push({
      slug,
      title,
      author: authorRaw,
      date,
      categories,
      tags,
      excerpt,
      content: contentText,
      videoIds,
    })
  }

  return items
}

// ── Main ──

console.log('Parsing WordPress XML files for video content...\n')

let allVideoPosts = []
const seenSlugs = new Set()

for (const file of XML_FILES) {
  const filePath = path.join(XML_DIR, file)
  console.log(`Reading: ${file}`)
  const xml = fs.readFileSync(filePath, 'utf-8')
  const items = parseItems(xml)
  console.log(`  Found ${items.length} posts with YouTube videos`)

  for (const item of items) {
    // Deduplicate by slug
    if (seenSlugs.has(item.slug)) {
      // Try adding a suffix
      let suffix = 2
      let newSlug = `${item.slug}-${suffix}`
      while (seenSlugs.has(newSlug)) {
        suffix++
        newSlug = `${item.slug}-${suffix}`
      }
      item.slug = newSlug
    }
    seenSlugs.add(item.slug)
    allVideoPosts.push(item)
  }
}

// Filter out admin-focused content
const beforeFilter = allVideoPosts.length
allVideoPosts = allVideoPosts.filter(p => !p.categories.some(c => SKIP_CATEGORIES.includes(c)))
console.log(`\nFiltered out ${beforeFilter - allVideoPosts.length} admin-focused posts`)
console.log(`Total unique video posts: ${allVideoPosts.length}`)

// Count total unique YouTube IDs
const allYouTubeIds = new Set()
allVideoPosts.forEach(p => p.videoIds.forEach(id => allYouTubeIds.add(id)))
console.log(`Total unique YouTube videos: ${allYouTubeIds.size}`)

// Show category distribution
const catCounts = {}
allVideoPosts.forEach(p => p.categories.forEach(c => {
  catCounts[c] = (catCounts[c] || 0) + 1
}))
console.log('\nCategory distribution:')
Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([cat, count]) => {
  console.log(`  ${count} - ${cat}`)
})

// ── Check for existing video articles in the library ──
const articlesContent = fs.readFileSync(ARTICLES_FILE, 'utf-8')
const existingSlugs = new Set()
const slugRegex = /slug:\s*["'`]([^"'`]+)["'`]/g
let slugMatch
while ((slugMatch = slugRegex.exec(articlesContent)) !== null) {
  existingSlugs.add(slugMatch[1])
}

// Filter out duplicates
const newPosts = allVideoPosts.filter(p => {
  if (existingSlugs.has(p.slug)) {
    console.log(`  Skipping duplicate: ${p.slug}`)
    return false
  }
  return true
})

console.log(`\nNew articles to add: ${newPosts.length} (${allVideoPosts.length - newPosts.length} duplicates skipped)`)

if (newPosts.length === 0) {
  console.log('Nothing to add.')
  process.exit(0)
}

// ── Generate article entries ──
function escapeForTemplate(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
}

const entries = newPosts.map(post => {
  const cats = JSON.stringify(post.categories)
  const tags = JSON.stringify(post.tags)
  const vids = JSON.stringify(post.videoIds)
  return `  {
    slug: "${post.slug}",
    title: \`${escapeForTemplate(post.title)}\`,
    author: \`${escapeForTemplate(post.author)}\`,
    date: "${post.date}",
    categories: ${cats},
    tags: ${tags},
    videoIds: ${vids},
    excerpt: \`${escapeForTemplate(post.excerpt)}\`,
    content: \`${escapeForTemplate(post.content)}\`,
  }`
}).join(',\n')

// ── Append to articles file ──
// Find the closing bracket of the ARTICLES array
const closingIndex = articlesContent.lastIndexOf(']')
if (closingIndex === -1) {
  console.error('Could not find closing bracket of ARTICLES array')
  process.exit(1)
}

const before = articlesContent.substring(0, closingIndex)
const after = articlesContent.substring(closingIndex)

// Check if there's a trailing comma before the bracket
const trimmedBefore = before.trimEnd()
const needsComma = !trimmedBefore.endsWith(',') && !trimmedBefore.endsWith('[')

const newContent = before + (needsComma ? ',' : '') + '\n' + entries + ',\n' + after

fs.writeFileSync(ARTICLES_FILE, newContent, 'utf-8')
console.log(`\nDone! Added ${newPosts.length} video articles to lib/articles.ts`)
console.log(`Total articles now: ${existingSlugs.size + newPosts.length}`)
