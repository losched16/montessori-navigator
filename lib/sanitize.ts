import sanitizeHtml from 'sanitize-html'

// Clean article HTML coming from the rich-text editor (which may include
// pasted Word/Google-Docs/web markup). Allowlist of structural tags only;
// strips scripts, event handlers, styles, classes, and other cruft. Converts
// bold/italic conveyed via inline styles (common in Docs/Word paste) into real
// <strong>/<em> so formatting survives the strip. Runs server-side before we
// store the HTML, so rendering it is safe.
export function cleanArticleHtml(dirty: string): string {
  if (!dirty) return ''
  return sanitizeHtml(dirty, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'p', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u', 's',
      'blockquote', 'ul', 'ol', 'li',
      'a', 'img', 'code', 'pre', 'span',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    // Drop empty spans/attrs; keep no inline styles or classes.
    transformTags: {
      a: (tagName, attribs) => ({
        tagName: 'a',
        attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' },
      }),
      span: (tagName, attribs) => {
        const style = attribs.style || ''
        if (/font-weight\s*:\s*(bold|[6-9]00)/i.test(style)) return { tagName: 'strong', attribs: {} }
        if (/font-style\s*:\s*italic/i.test(style)) return { tagName: 'em', attribs: {} }
        // plain span — unwrap by turning into a no-op span with no attrs
        return { tagName: 'span', attribs: {} }
      },
    },
    // Remove spans that end up empty of attributes AND wrapping nothing useful
    exclusiveFilter: frame =>
      frame.tag === 'span' && !frame.text.trim() && frame.mediaChildren.length === 0,
  })
}
