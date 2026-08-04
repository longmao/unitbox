// Renderer for apple-dev recipe bodies. Supports fenced code blocks, headings,
// unordered lists, and inline markdown (delegates to formatInline).
//
// Deliberately separate from the articles.ts rendering path so the conversion
// core stays untouched (spec CHE-UNITBOX-APPLE-DEV-001, acceptance A8).
//
// Supported syntax in a recipe body:
//   ```lang\n...\n```   → <pre class="code-block"><code>…</code></pre>
//   ## heading          → <h2>
//   - item / * item     → unordered list (consecutive lines form one <ul>)
//   anything else       → paragraph (inline markdown via formatInline)

import { formatInline, type InlineRenderable } from './format';

export type Block =
  | { type: 'p'; segments: InlineRenderable[] }
  | { type: 'h2'; segments: InlineRenderable[] }
  | { type: 'code'; lang?: string; code: string }
  | { type: 'ul'; items: InlineRenderable[][] };

// ASCII sentinel that can never appear in a real recipe body. Survives trim().
const CODE_MARK = '@@CB@@';

/**
 * Parse a recipe body (markdown-ish) into renderable blocks.
 */
export function parseRecipe(body: string): Block[] {
  const blocks: Block[] = [];

  // 1) Pull fenced code blocks out into placeholders so inline transforms
  //    never touch their contents.
  const codeStore: Array<{ lang?: string; code: string }> = [];
  let buf = body.replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, lang: string, code: string) => {
    const idx = codeStore.length;
    codeStore.push({ lang: lang || undefined, code: code.replace(/\n$/, '') });
    return `\n${CODE_MARK}${idx}${CODE_MARK}\n`;
  });

  // 2) Split on blank lines; each chunk becomes one block.
  const segments = buf.split(/\n{2,}/);
  for (const seg of segments) {
    const trimmed = seg.trim();
    if (!trimmed) continue;

    // lone code-block placeholder
    const codeMatch = trimmed.match(new RegExp(`^${CODE_MARK}(\\d+)${CODE_MARK}$`));
    if (codeMatch) {
      const stored = codeStore[Number(codeMatch[1])];
      blocks.push({ type: 'code', lang: stored.lang, code: stored.code });
      continue;
    }

    // heading
    if (/^##\s+/.test(trimmed)) {
      blocks.push({ type: 'h2', segments: formatInline(trimmed.replace(/^##\s+/, '').replace(/\n/g, ' ')) });
      continue;
    }

    const lines = trimmed.split(/\n/).map((l) => l.trim()).filter(Boolean);

    // unordered list — every line starts with - or *
    const isList = lines.length > 0 && lines.every((l) => /^[-*]\s+/.test(l));
    if (isList) {
      blocks.push({
        type: 'ul',
        items: lines.map((l) => formatInline(l.replace(/^[-*]\s+/, ''))),
      });
      continue;
    }

    // paragraph — collapse internal newlines (soft wraps) to spaces
    blocks.push({ type: 'p', segments: formatInline(trimmed.replace(/\n/g, ' ')) });
  }

  return blocks;
}
