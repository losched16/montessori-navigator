// Tiny markdown → HTML renderer. Covers the basics we need for article and
// guide bodies in /admin/resources: headings, paragraphs, bold, italic, code,
// links, bullet lists, numbered lists, blockquotes, and inline line breaks.
//
// Deliberately small — if we need full CommonMark/GFM later (tables,
// footnotes, autolinking, fenced code blocks with syntax highlighting), we
// can swap in `marked` or `react-markdown`. For now, no new dep.
//
// SECURITY: every interpolation is HTML-escaped before any markdown
// transformation is applied to it, so a partner can't slip a <script> tag
// into an article body and have it execute. The output is safe to render
// with dangerouslySetInnerHTML.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function inline(s: string): string {
  let out = s
  // Images: ![alt](url) — MUST run before links so the "!" prefix isn't lost.
  // url must be http/https or a site-relative path.
  out = out.replace(
    /!\[([^\]]*?)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g,
    '<img src="$2" alt="$1" loading="lazy" style="max-width:100%;height:auto;border-radius:10px;display:block;margin:1.5em auto;" />',
  )
  // Bold: **text**
  out = out.replace(/\*\*([^\n*]+?)\*\*/g, '<strong>$1</strong>')
  // Italic: *text* (single asterisk, not surrounded by other asterisks)
  out = out.replace(/(^|[^*])\*([^\n*]+?)\*(?!\*)/g, '$1<em>$2</em>')
  // Inline code: `text`
  out = out.replace(/`([^`\n]+?)`/g, '<code>$1</code>')
  // Links: [text](url) — url must be http/https/mailto/relative
  out = out.replace(/\[([^\]]+?)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|\/[^\s)]*)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  return out
}

export function renderMarkdown(input: string): string {
  if (!input) return ''
  const escaped = escapeHtml(input)
  // Normalize Windows line endings to LF, force a block break before any
  // heading line, then split on blank lines.
  const blocks = escaped
    .replace(/\r\n/g, '\n')
    .replace(/\n(#{1,6}\s)/g, '\n\n$1')
    .split(/\n{2,}/)
  const html: string[] = []

  // Queue instead of plain loop: a heading on the first line of a multi-line
  // block (common in LLM output — "## Try this\nDo the thing") is emitted as
  // a heading and the remainder re-queued for normal block processing.
  const queue = [...blocks]
  while (queue.length > 0) {
    const rawBlock = queue.shift()!
    const block = rawBlock.trim()
    if (!block) continue

    // Headings: # / ## / ### / #### / ##### / ######
    const firstLine = block.split('\n', 1)[0]
    const headingMatch = firstLine.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      html.push(`<h${level}>${inline(headingMatch[2])}</h${level}>`)
      const rest = block.slice(firstLine.length).trim()
      if (rest) queue.unshift(rest)
      continue
    }

    // Blockquote: every line starts with "> "
    if (block.split('\n').every(line => /^&gt;\s?/.test(line))) {
      const inner = block.split('\n').map(line => line.replace(/^&gt;\s?/, '')).join(' ')
      html.push(`<blockquote>${inline(inner)}</blockquote>`)
      continue
    }

    // Bullet list: every line starts with "- " or "* "
    if (block.split('\n').every(line => /^[-*]\s+/.test(line))) {
      const items = block.split('\n').map(line => `<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`).join('')
      html.push(`<ul>${items}</ul>`)
      continue
    }

    // Numbered list: every line starts with "1. ", "2. ", etc.
    if (block.split('\n').every(line => /^\d+\.\s+/.test(line))) {
      const items = block.split('\n').map(line => `<li>${inline(line.replace(/^\d+\.\s+/, ''))}</li>`).join('')
      html.push(`<ol>${items}</ol>`)
      continue
    }

    // Default: paragraph (preserve in-paragraph line breaks as <br>)
    const inlined = inline(block).replace(/\n/g, '<br>')
    html.push(`<p>${inlined}</p>`)
  }

  return html.join('\n')
}
