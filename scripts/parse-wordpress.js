// Script to parse WordPress XML export and generate TypeScript content file
const fs = require('fs');
const path = require('path');

const xmlPath = path.join('C:', 'Users', 'thelo', 'Downloads', 'montessorifoundationmontessorifamilyalliance.WordPress.2026-02-28.xml');
const xml = fs.readFileSync(xmlPath, 'utf-8');

// Extract all <item>...</item> blocks
const items = [];
let idx = 0;
while (true) {
  const start = xml.indexOf('<item>', idx);
  if (start === -1) break;
  const end = xml.indexOf('</item>', start);
  if (end === -1) break;
  items.push(xml.substring(start, end + 7));
  idx = end + 7;
}

console.log(`Found ${items.length} total items`);

function extractCDATA(tag, text) {
  // Match <tag><![CDATA[...]]></tag> or <tag>...</tag>
  const cdataRegex = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`);
  const match = text.match(cdataRegex);
  if (match) return match[1];
  const simpleRegex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
  const simpleMatch = text.match(simpleRegex);
  return simpleMatch ? simpleMatch[1] : '';
}

function extractWP(tag, text) {
  return extractCDATA(`wp:${tag}`, text);
}

function extractCategories(text) {
  const cats = [];
  const regex = /category domain="category"[^>]*><!\[CDATA\[(.*?)\]\]>/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    cats.push(m[1]);
  }
  return cats;
}

function extractTags(text) {
  const tags = [];
  const regex = /category domain="post_tag"[^>]*><!\[CDATA\[(.*?)\]\]>/g;
  let m;
  while ((m = regex.exec(text)) !== null) {
    tags.push(m[1]);
  }
  return tags;
}

function stripHTML(html) {
  if (!html) return '';
  // Remove Divi shortcodes
  let text = html.replace(/\[\/?(et_pb_[^\]]*)\]/g, '');
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Decode HTML entities
  text = text.replace(/&#8217;/g, "'");
  text = text.replace(/&#8216;/g, "'");
  text = text.replace(/&#8220;/g, '"');
  text = text.replace(/&#8221;/g, '"');
  text = text.replace(/&#8211;/g, '–');
  text = text.replace(/&#8212;/g, '—');
  text = text.replace(/&#038;/g, '&');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&#8230;/g, '…');
  text = text.replace(/&#\d+;/g, '');
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

function htmlToCleanContent(html) {
  if (!html) return '';
  // Remove Divi shortcodes but preserve content
  let text = html.replace(/\[\/?(et_pb_[^\]]*)\]/g, '');

  // Convert <h1>-<h6> to markdown-like headings
  text = text.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (_, level, content) => {
    return '\n' + stripHTML(content) + '\n';
  });

  // Convert <p> to paragraphs
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<p[^>]*>/gi, '');

  // Convert <br> to newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Convert <li> to bullet points
  text = text.replace(/<li[^>]*>/gi, '• ');
  text = text.replace(/<\/li>/gi, '\n');

  // Convert <strong>/<b> markers (strip them, keep content)
  text = text.replace(/<\/?(strong|b|em|i)[^>]*>/gi, '');

  // Remove remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = text.replace(/&#8217;/g, "'");
  text = text.replace(/&#8216;/g, "'");
  text = text.replace(/&#8220;/g, '"');
  text = text.replace(/&#8221;/g, '"');
  text = text.replace(/&#8211;/g, '–');
  text = text.replace(/&#8212;/g, '—');
  text = text.replace(/&#038;/g, '&');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&#8230;/g, '…');
  text = text.replace(/&#\d+;/g, '');

  // Normalize whitespace but keep paragraph breaks
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

function generateExcerpt(content, maxLen = 200) {
  const clean = stripHTML(content);
  if (clean.length <= maxLen) return clean;
  return clean.substring(0, maxLen).replace(/\s+\S*$/, '') + '…';
}

const posts = [];

for (const item of items) {
  const postType = extractWP('post_type', item);
  const status = extractWP('status', item);

  // Only include published posts (not pages, attachments, etc.)
  if (postType !== 'post' || status !== 'publish') continue;

  const title = extractCDATA('title', item);
  if (!title || title.trim() === '') continue;

  const content = extractCDATA('content:encoded', item);
  const cleanContent = htmlToCleanContent(content);

  // Skip posts with very little content
  if (cleanContent.length < 50) continue;

  const postDate = extractWP('post_date', item);
  const postName = extractWP('post_name', item);
  const author = extractCDATA('dc:creator', item);
  const categories = extractCategories(item);
  const tags = extractTags(item);
  const excerpt = extractCDATA('excerpt:encoded', item);

  posts.push({
    slug: postName || generateSlug(title),
    title: stripHTML(title),
    author: author || 'The Montessori Foundation',
    date: postDate ? postDate.split(' ')[0] : '',
    categories,
    tags,
    excerpt: stripHTML(excerpt) || generateExcerpt(content),
    content: cleanContent,
  });
}

// Sort by date descending
posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

console.log(`Extracted ${posts.length} published posts with content`);

// Print category stats
const catCounts = {};
for (const p of posts) {
  for (const c of p.categories) {
    catCounts[c] = (catCounts[c] || 0) + 1;
  }
}
console.log('\nCategories:');
Object.entries(catCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});

// Print some sample posts
console.log('\nSample posts:');
for (const p of posts.slice(0, 5)) {
  console.log(`  [${p.date}] ${p.title} (${p.categories.join(', ')}) - ${p.content.length} chars`);
}

// Generate TypeScript file
let ts = `// Auto-generated from WordPress export on ${new Date().toISOString().split('T')[0]}
// Source: montessori.org - The Montessori Foundation & Montessori Family Alliance

export interface Article {
  slug: string
  title: string
  author: string
  date: string
  categories: string[]
  tags: string[]
  excerpt: string
  content: string
}

export const ARTICLES: Article[] = [\n`;

for (const p of posts) {
  const escapedContent = p.content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  ts += `  {
    slug: ${JSON.stringify(p.slug)},
    title: ${JSON.stringify(p.title)},
    author: ${JSON.stringify(p.author)},
    date: ${JSON.stringify(p.date)},
    categories: ${JSON.stringify(p.categories)},
    tags: ${JSON.stringify(p.tags)},
    excerpt: ${JSON.stringify(p.excerpt)},
    content: \`${escapedContent}\`,
  },\n`;
}

ts += `]

// Helper functions
export function getAllArticles(): Article[] {
  return ARTICLES
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find(a => a.slug === slug)
}

export function getArticlesByCategory(category: string): Article[] {
  return ARTICLES.filter(a => a.categories.includes(category))
}

export function getAllCategories(): string[] {
  const cats = new Set<string>()
  ARTICLES.forEach(a => a.categories.forEach(c => cats.add(c)))
  return Array.from(cats).sort()
}

export function getAllTags(): string[] {
  const tags = new Set<string>()
  ARTICLES.forEach(a => a.tags.forEach(t => tags.add(t)))
  return Array.from(tags).sort()
}

export function searchArticles(query: string): Article[] {
  const q = query.toLowerCase()
  return ARTICLES.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.excerpt.toLowerCase().includes(q) ||
    a.content.toLowerCase().includes(q) ||
    a.categories.some(c => c.toLowerCase().includes(q)) ||
    a.tags.some(t => t.toLowerCase().includes(q))
  )
}

// Generate a condensed knowledge summary for AI context
export function getArticleSummariesForAI(): string {
  return ARTICLES.map(a =>
    \`[\${a.slug}] "\${a.title}" by \${a.author} (\${a.categories.join(', ')}): \${a.excerpt}\`
  ).join('\\n')
}
`;

const outPath = path.join(__dirname, '..', 'lib', 'articles.ts');
fs.writeFileSync(outPath, ts, 'utf-8');
console.log(`\nWritten ${posts.length} articles to ${outPath}`);
console.log(`File size: ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);
