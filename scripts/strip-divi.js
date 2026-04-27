const fs = require('fs');
const path = require('path');

const ARTICLES_FILE = path.join(__dirname, '..', 'lib', 'articles.ts');
let content = fs.readFileSync(ARTICLES_FILE, 'utf-8');

const before = content.length;

// Remove all Divi shortcodes: [et_pb_*] and [/et_pb_*] with any attributes
content = content.replace(/\[\/?et_pb_[^\]]*\]/g, '');

const after = content.length;
const removed = before - after;

fs.writeFileSync(ARTICLES_FILE, content, 'utf-8');
console.log(`Removed ${removed} characters of Divi shortcode markup`);

// Verify none remain
const remaining = (content.match(/\[et_pb_/g) || []).length;
console.log(`Remaining [et_pb_ occurrences: ${remaining}`);
