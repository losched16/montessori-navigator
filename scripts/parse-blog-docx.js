// Parse the blog posts docx file and add to existing articles library
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const docxPath = path.join('C:', 'Users', 'thelo', 'OneDrive', 'Desktop', 'montessori-navigator-v7', 'Resources', 'Montessori blog posts June 2025.docx');

// Normalize smart/curly quotes to straight quotes for comparison
function normalizeQuotes(str) {
  return str
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")  // smart single quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')   // smart double quotes
    .replace(/[\u2013\u2014]/g, '-');               // em/en dashes
}

// Known article titles (using straight quotes - we'll normalize the source text too)
const ARTICLE_TITLES = [
  "How Montessori Brings Clarity and Freedom to Overwhelmed Parents",
  "Montessori Homeschool vs a Montessori School",
  "You Don't Have to Be a Teacher to Bring Montessori Home",
  "At Home: Building Confidence Without a Classroom",
  "Keeping Respect at the Center-Even in Emotional Storms",
  "If You Can Only Do One Thing Montessori, Do This",
  "Feeling Unqualified and overwhelmed as a parent? You're More Ready Than You Think",
  "How Can Homeschooling Parents Support Socialization and Community-Especially When Montessori Emphasizes Mixed-Age Environments?",
  "Unlearning First-Preparing Ourselves to Parent the Montessori Way",
  "What Does 'Freedom Within Limits' Actually Mean, and How Does It Promote Peace and Order at Home?",
  "Guiding, Not Molding-The Heart of Montessori Parenting",
];

function slugify(text) {
  return normalizeQuotes(text)
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[—–-]+/g, '-')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

function generateExcerpt(content, maxLen = 200) {
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 50);
  if (paragraphs.length === 0) return content.substring(0, maxLen);
  let excerpt = paragraphs[0].trim();
  if (excerpt.length > maxLen) {
    excerpt = excerpt.substring(0, maxLen - 3).replace(/\s+\S*$/, '') + '...';
  }
  return excerpt;
}

function categorizeBlogPost(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  const categories = ['MFA'];
  const tags = [];

  if (text.includes('homeschool') || text.includes('home school')) {
    categories.push('Montessori Parenting');
    tags.push('homeschooling');
  }
  if (text.includes('toddler') || text.includes('preschool') || text.includes('early childhood')) {
    tags.push('early-childhood');
  }
  if (text.includes('independence') || text.includes('independent')) {
    tags.push('independence');
  }
  if (text.includes('practical life') || text.includes('daily life') || text.includes('real life')) {
    tags.push('practical-life');
  }
  if (text.includes('tantrum') || text.includes('emotional') || text.includes('meltdown')) {
    tags.push('emotional-development');
  }
  if (text.includes('respect') || text.includes('discipline') || text.includes('grace and courtesy')) {
    tags.push('respect');
  }
  if (text.includes('socialization') || text.includes('social') || text.includes('community')) {
    tags.push('socialization');
  }
  if (text.includes('freedom within limits') || text.includes('limits')) {
    tags.push('freedom-within-limits');
  }
  if (text.includes('confidence') || text.includes('self-esteem') || text.includes('self-assured')) {
    tags.push('confidence');
  }
  if (text.includes('observation') || text.includes('observe')) {
    tags.push('observation');
  }
  if (text.includes('parent') || text.includes('family') || text.includes('home')) {
    if (!categories.includes('Montessori Parenting')) {
      categories.push('Montessori Parenting');
    }
    tags.push('parenting');
  }
  if (text.includes('family life')) {
    categories.push('Montessori Family Life');
  }

  if (categories.length === 1) {
    categories.push('Montessori Parenting');
  }

  return { categories: [...new Set(categories)], tags: [...new Set(tags)] };
}

async function main() {
  console.log('Parsing docx file...');
  const textResult = await mammoth.extractRawText({ path: docxPath });
  const rawText = textResult.value;
  console.log(`Total text: ${rawText.length} chars`);

  // Normalize the full text for searching (but keep original for content)
  const normalizedText = normalizeQuotes(rawText);

  // Find each article by searching for normalized titles in normalized text
  const articlePositions = [];
  for (const title of ARTICLE_TITLES) {
    const normalizedTitle = normalizeQuotes(title);
    let idx = normalizedText.indexOf(normalizedTitle);

    // Also try searching after "Blog Post N: " prefix
    if (idx === -1) {
      for (let n = 1; n <= 20; n++) {
        const prefixed = `Blog Post ${n}: ${normalizedTitle}`;
        idx = normalizedText.indexOf(prefixed);
        if (idx !== -1) {
          // Adjust to start at the actual title (after prefix)
          idx = normalizedText.indexOf(normalizedTitle, idx);
          break;
        }
      }
    }

    if (idx === -1) {
      // Try partial match (first 40 normalized chars)
      const partial = normalizedTitle.substring(0, 40);
      idx = normalizedText.indexOf(partial);
    }

    if (idx === -1) {
      console.log(`WARNING: Could not find title: "${title}"`);
      continue;
    }

    // Get the actual title from raw text (with original Unicode chars)
    const titleEndIdx = idx + normalizedTitle.length;
    const actualTitle = rawText.substring(idx, titleEndIdx);

    articlePositions.push({
      title: actualTitle,
      normalizedTitle,
      startIdx: idx,
      titleEndIdx,
    });

    console.log(`  Found: "${actualTitle.substring(0, 70)}..." at position ${idx}`);
  }

  // Sort by position
  articlePositions.sort((a, b) => a.startIdx - b.startIdx);

  // Find "Want to Learn More?" CTA position as end marker
  const ctaIdx = normalizedText.indexOf('Want to Learn More?');
  const textEnd = ctaIdx !== -1 ? ctaIdx : rawText.length;

  // Extract articles
  const articles = [];
  for (let i = 0; i < articlePositions.length; i++) {
    const pos = articlePositions[i];
    const nextPos = articlePositions[i + 1];

    // Content starts after the title
    let contentStart = rawText.indexOf('\n', pos.titleEndIdx);
    if (contentStart === -1) contentStart = pos.titleEndIdx;

    // Content ends at next article or CTA
    const contentEnd = nextPos ? nextPos.startIdx : textEnd;

    let content = rawText.substring(contentStart, contentEnd).trim();

    // Remove leading blank lines
    content = content.replace(/^\s*\n\s*\n/, '').trim();

    // Clean title (remove "Blog Post N:" prefix if present)
    let cleanTitle = pos.title.replace(/^Blog Post \d+:\s*/, '');

    const { categories, tags } = categorizeBlogPost(cleanTitle, content);
    const slug = slugify(cleanTitle);
    const excerpt = generateExcerpt(content);

    articles.push({
      title: cleanTitle,
      slug,
      content,
      excerpt,
      author: 'Tim Seldin',
      date: '2025-06-01',
      categories,
      tags,
    });

    console.log(`\nArticle ${i + 1}: "${cleanTitle.substring(0, 60)}..."`);
    console.log(`  Slug: ${slug}`);
    console.log(`  Content: ${content.length} chars`);
    console.log(`  Categories: ${categories.join(', ')}`);
    console.log(`  Tags: ${tags.join(', ')}`);
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total articles extracted: ${articles.length}`);

  // Now merge with existing articles
  const articlesPath = path.join(__dirname, '..', 'lib', 'articles.ts');
  const existingContent = fs.readFileSync(articlesPath, 'utf-8');

  // Find the closing bracket of the ARTICLES array
  const closingIdx = existingContent.lastIndexOf(']');
  if (closingIdx === -1) {
    console.error('Could not find end of ARTICLES array!');
    process.exit(1);
  }

  // Get existing slugs to avoid duplicates
  const existingSlugs = [];
  const slugRegex = /slug:\s*"([^"]+)"/g;
  let match;
  while ((match = slugRegex.exec(existingContent)) !== null) {
    existingSlugs.push(match[1]);
  }
  console.log(`\nExisting articles: ${existingSlugs.length}`);

  // Filter out duplicates
  const newArticles = articles.filter(a => {
    if (existingSlugs.includes(a.slug)) {
      console.log(`  SKIP (duplicate slug): ${a.slug}`);
      return false;
    }
    return true;
  });

  console.log(`New articles to add: ${newArticles.length}`);

  if (newArticles.length === 0) {
    console.log('No new articles to add!');
    return;
  }

  // Generate new article entries
  let newEntries = '';
  for (const article of newArticles) {
    newEntries += `  {\n`;
    newEntries += `    title: ${JSON.stringify(article.title)},\n`;
    newEntries += `    slug: ${JSON.stringify(article.slug)},\n`;
    newEntries += `    content: ${JSON.stringify(article.content)},\n`;
    newEntries += `    excerpt: ${JSON.stringify(article.excerpt)},\n`;
    newEntries += `    author: ${JSON.stringify(article.author)},\n`;
    newEntries += `    date: ${JSON.stringify(article.date)},\n`;
    newEntries += `    categories: ${JSON.stringify(article.categories)},\n`;
    newEntries += `    tags: ${JSON.stringify(article.tags)},\n`;
    newEntries += `  },\n`;
  }

  // Insert before the closing bracket
  const updatedContent = existingContent.substring(0, closingIdx) + newEntries + existingContent.substring(closingIdx);
  fs.writeFileSync(articlesPath, updatedContent, 'utf-8');

  const newSize = fs.statSync(articlesPath).size;
  console.log(`\nUpdated ${articlesPath}`);
  console.log(`New file size: ${(newSize / 1024).toFixed(1)} KB`);
  console.log(`Total articles: ${existingSlugs.length + newArticles.length}`);
}

main().catch(err => console.error(err));
