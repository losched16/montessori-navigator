const fs = require('fs');
const path = require('path');

const ARTICLES_FILE = path.join(__dirname, '..', 'lib', 'articles.ts');
const content = fs.readFileSync(ARTICLES_FILE, 'utf-8');

// Split into: header (interface + array start), individual article blocks, footer (helper functions)
const arrayStartMarker = 'export const ARTICLES: Article[] = [';
const headerEnd = content.indexOf(arrayStartMarker) + arrayStartMarker.length;
const header = content.substring(0, headerEnd);

// Find end of array - look for the line that's just "]" after all articles
// Articles end with "  }," or "  }" and then the array closes with "]"
const lines = content.split('\n');
let arrayCloseLineIdx = -1;

// Find the "]" that closes the ARTICLES array
// It'll be a line that's just "]" after the article entries
let inArray = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(arrayStartMarker)) {
    inArray = true;
    continue;
  }
  if (inArray && lines[i].trim() === ']') {
    arrayCloseLineIdx = i;
    break;
  }
}

console.log('Array closes at line:', arrayCloseLineIdx + 1);

// Extract everything after the closing bracket as the footer (helper functions)
const footerLines = lines.slice(arrayCloseLineIdx + 1);
const footer = '\n' + footerLines.join('\n');

// Now parse individual article blocks between header and footer
// Each article starts with "  {" and ends with "  }," or "  }"
const articleLines = lines.slice(
  lines.findIndex(l => l.includes(arrayStartMarker)) + 1,
  arrayCloseLineIdx
);

// Group lines into article blocks
const articles = [];
let currentBlock = [];
let braceDepth = 0;

for (const line of articleLines) {
  if (line.trim() === '' && braceDepth === 0) continue;

  currentBlock.push(line);

  for (const ch of line) {
    if (ch === '{') braceDepth++;
    if (ch === '}') braceDepth--;
  }

  if (braceDepth === 0 && currentBlock.length > 0) {
    articles.push(currentBlock.join('\n'));
    currentBlock = [];
  }
}

console.log('Total article blocks found:', articles.length);

// Filter out articles with admin categories
const adminTags = ['Boards', 'Communication', 'School Leadership'];
const kept = [];
let removedCount = 0;

for (const block of articles) {
  const hasAdmin = adminTags.some(tag => block.includes(`"${tag}"`));
  if (hasAdmin) {
    removedCount++;
  } else {
    kept.push(block);
  }
}

console.log('Removed:', removedCount);
console.log('Keeping:', kept.length);

// Rebuild the file
const newContent = header + '\n' + kept.join('\n') + '\n]' + footer;

fs.writeFileSync(ARTICLES_FILE, newContent, 'utf-8');
console.log('\nDone! Updated lib/articles.ts');
