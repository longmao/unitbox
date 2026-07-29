// Tiny inline-markdown helper for our paragraph arrays. We hand-write article bodies in TS,
// and we want them to render bold/italic/links without dragging in a full markdown library.
//
// Supports:
//   **bold**       -> <strong>bold</strong>
//   *italic*       -> <em>italic</em>
//   [text](url)    -> <a href="url">text</a>
//   `code`         -> <code>code</code>
//   $$ math $$     -> <span class="math">math</span> (caller decides styling)
// Order matters: process math/code blocks first (before inline transforms touch asterisks).
//
// Returns a Set:html-safe string. Caller wraps in <p> or similar.

export type InlineRenderable = string | { tag: string; html: string };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Format a body of text by rendering inline markdown. Math blocks are returned
 * as sentinel objects so the caller can render them with a custom element.
 */
export function formatInline(s: string): InlineRenderable[] {
  const out: InlineRenderable[] = [];

  // 1) Pull out $$ math $$ tokens into placeholders.
  const mathMarker = 'MATH';
  let buf = s.replace(/\$\$([\s\S]+?)\$\$/g, (_m, expr) => {
    return `${mathMarker}${escapeHtml(expr.trim())}${mathMarker}`;
  });

  // 2) Escape the rest.
  buf = escapeHtml(buf);

  // 3) Now apply inline transforms on the escaped text (so < > & are safe).
  // We must re-escape any HTML we inject.
  buf = buf.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  buf = buf.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
  buf = buf.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  buf = buf.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');

  // 4) Re-instate math placeholders.
  const re = new RegExp(`${mathMarker}([\\s\\S]+?)${mathMarker}`, 'g');
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(buf)) !== null) {
    if (m.index > lastIndex) {
      out.push(buf.slice(lastIndex, m.index));
    }
    out.push({ tag: 'math', html: m[1] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < buf.length) {
    out.push(buf.slice(lastIndex));
  }
  return out;
}
