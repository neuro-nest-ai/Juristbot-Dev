/* ═══════════════════════════════════════════════════════════════════════
   parseBlocks.js
   Extracts :::mermaid / :::flowchart / :::mindmap / :::kanban / :::checklist
   blocks (and ```mermaid code fences) from an assistant message.

   Design notes
   ────────────
   • Same contract as the existing document/section parsing: each block is
     replaced by a `[[RICH_BLOCK:id]]` marker in the cleaned text, and the
     block payload is returned in a map. Nothing about the existing
     writing / placeholders / section handling changes.
   • Backend sometimes emits 3 or 4 colons → `:{3,}` everywhere.
   • Streaming safe: an unterminated block is parsed as `streaming: true`.
     Text-based blocks (kanban / checklist) render progressively; Mermaid
     waits for the closing fence so the parser never sees half a graph.
   ═══════════════════════════════════════════════════════════════════════ */

const DIAGRAM_KINDS = ['mermaid', 'flowchart', 'mindmap'];
const ALL_KINDS = [...DIAGRAM_KINDS, 'kanban', 'checklist'];
const KIND_GROUP = ALL_KINDS.join('|');

/* :::kind{attrs}\n body \n::: */
const BLOCK_RE = new RegExp(
  `:{3,}\\s*(${KIND_GROUP})\\s*(\\{[^}]*\\})?[ \\t]*\\r?\\n([\\s\\S]*?)\\r?\\n[ \\t]*:{3,}`,
  'g'
);

/* Same, still streaming (no closing colons yet) */
const OPEN_BLOCK_RE = new RegExp(
  `:{3,}\\s*(${KIND_GROUP})\\s*(\\{[^}]*\\})?[ \\t]*\\r?\\n([\\s\\S]*)$`
);

/* ```mermaid … ``` — the model often falls back to a plain code fence */
const CODE_FENCE_RE = /```\s*(mermaid|flowchart|mindmap)\s*\r?\n([\s\S]*?)```/g;
const OPEN_CODE_FENCE_RE = /```\s*(mermaid|flowchart|mindmap)\s*\r?\n([\s\S]*)$/;

const ATTR_RE = /(\w+)\s*=\s*"([^"]*)"/g;

const parseAttrs = (raw = '') => {
  const attrs = {};
  const src = raw.replace(/^\{|\}$/g, '');
  let m;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(src)) !== null) attrs[m[1]] = m[2];
  return attrs;
};

/* Mermaid mindmaps are indentation-based and have no bullet syntax, so a
   markdown-style `- Label` ends up rendering the dash inside the node. Strip
   the marker while keeping each line's indentation, so the tree shape (which
   is what Mermaid actually reads) is untouched. */
export const stripMindmapBullets = (code = '') =>
  code
    .split(/\r?\n/)
    .map((line) => line.replace(/^(\s*)[-*+]\s+/, '$1'))
    .join('\n');

/* ── Flowchart auto-repair ────────────────────────────────────────────────
   The model sometimes writes an arrow straight into a shape with no node id
   in front of it — `A --> {Label?}` — and then reuses that label's full text
   (including punctuation) as the *source* of the next edges, e.g.
   `Label? -- Yes --> B`. Mermaid requires a short id there, not the label,
   so both lines fail to parse. This gives every such shape a generated id
   and rewrites later bare references to the same label back to that id,
   without touching the label text actually shown inside `{...}`.          */
export const repairFlowchart = (code = '') => {
  if (!code) return code;

  const labelToId = {};

  // 1) Insert a missing id in front of any arrow that points directly into
  //    a `{label}` shape: "A --> {Label}" → "A --> dec0{Label}".
  let out = code.replace(/(-->|-\.-?>|==+>)(\s*)\{([^{}]+)\}/g, (_m, arrow, ws, label) => {
    const clean = label.trim();
    const id = labelToId[clean] || (labelToId[clean] = `dec${Object.keys(labelToId).length}`);
    return `${arrow}${ws}${id}{${clean}}`;
  });

  if (!Object.keys(labelToId).length) return out;

  // 2) Mask every `{...}` body so the substitution below can't rewrite the
  //    display label itself — only bare references to it elsewhere.
  const masks = [];
  let masked = out.replace(/\{[^{}]*\}/g, (m) => {
    masks.push(m);
    return `@@RBMASK${masks.length - 1}@@`;
  });

  // 3) Swap any later bare occurrence of the label text for its generated id.
  Object.entries(labelToId).forEach(([label, id]) => {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    masked = masked.replace(new RegExp(escaped, 'g'), id);
  });

  // 4) Restore the masked label bodies.
  return masked.replace(/@@RBMASK(\d+)@@/g, (_m, i) => masks[Number(i)]);
};

/* ── Mermaid source normalisation ──────────────────────────────────────── */
export const normaliseDiagram = (kind, raw = '') => {
  let code = raw.trim();
  if (!code) return '';
  if (kind === 'flowchart' && !/^\s*(flowchart|graph)\b/i.test(code)) {
    code = `flowchart TD\n${code}`;
  }
  if (kind === 'mindmap' && !/^\s*mindmap\b/i.test(code)) {
    code = `mindmap\n${code}`;
  }
  if (kind === 'mindmap' || (kind === 'mermaid' && /^\s*mindmap\b/i.test(code))) {
    const [head, ...rest] = code.split(/\r?\n/);
    code = [head, ...stripMindmapBullets(rest.join('\n')).split('\n')].join('\n');
  }
  if (kind === 'flowchart' || (kind === 'mermaid' && /^\s*(flowchart|graph)\b/i.test(code))) {
    code = repairFlowchart(code);
  }
  return code;
};

/* A cheap guard: don't hand Mermaid something that is obviously a fragment. */
export const looksRenderable = (code = '') =>
  /^\s*(flowchart|graph|mindmap|sequenceDiagram|classDiagram|stateDiagram(-v2)?|erDiagram|journey|gantt|pie|gitGraph|timeline|quadrantChart|mindmap)\b/i.test(
    code
  ) && code.trim().split(/\r?\n/).length >= 2;

/* ── Kanban ────────────────────────────────────────────────────────────── */
export const parseKanban = (body = '', fallbackTitle = 'Board') => {
  const columns = [];
  let current = null;

  body.split(/\r?\n/).forEach((line) => {
    const col = line.match(/^\s{0,3}#{2,4}\s+(.+?)\s*$/);
    if (col) {
      current = { title: col[1].trim(), cards: [] };
      columns.push(current);
      return;
    }
    const card = line.match(/^\s*[-*+]\s+(.+?)\s*$/);
    if (!card) return;

    let text = card[1];
    let done = false;
    const box = text.match(/^\[(x|X| )\]\s*(.*)$/);
    if (box) {
      done = box[1].toLowerCase() === 'x';
      text = box[2];
    }
    if (!text) return;

    if (!current) {
      current = { title: fallbackTitle, cards: [] };
      columns.push(current);
    }
    current.cards.push({ text, done });
  });

  return columns.filter((c) => c.cards.length || c.title);
};

/* ── Checklist ─────────────────────────────────────────────────────────── */
export const parseChecklist = (body = '') =>
  body
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*+]\s+/, '').trim())
    .filter(Boolean)
    .map((line, i) => {
      const box = line.match(/^\[(x|X| )\]\s*(.*)$/);
      return {
        id: `i${i}`,
        label: box ? box[2] : line,
        defaultChecked: box ? box[1].toLowerCase() === 'x' : false,
      };
    })
    .filter((item) => item.label);

/* ── Main entry ────────────────────────────────────────────────────────── */
/**
 * @param {string} raw  assistant text (already stripped of doc/section blocks
 *                      or not — order does not matter, patterns don't overlap)
 * @returns {{ text: string, blocks: Object }}
 */
export const extractRichBlocks = (raw = '') => {
  const blocks = {};
  let count = 0;
  let src = raw;

  const add = (kind, attrs, body, streaming) => {
    const id = `blk-${count++}`;
    const title = attrs.title || '';

    if (DIAGRAM_KINDS.includes(kind)) {
      const code = normaliseDiagram(kind, body);
      /* `raw` keeps the original indented list: mindmaps are rendered by
         markmap (which needs the markdown bullets) rather than Mermaid. */
      blocks[id] = { id, type: 'diagram', kind, title, code, raw: body.trim(), streaming };
    } else if (kind === 'kanban') {
      blocks[id] = {
        id,
        type: 'kanban',
        title: title || 'Board',
        columns: parseKanban(body, title || 'Board'),
        streaming,
      };
    } else {
      blocks[id] = {
        id,
        type: 'checklist',
        title: title || 'Checklist',
        items: parseChecklist(body),
        streaming,
      };
    }
    return `\n\n[[RICH_BLOCK:${id}]]\n\n`;
  };

  /* 1. Closed ::: blocks */
  BLOCK_RE.lastIndex = 0;
  src = src.replace(BLOCK_RE, (_full, kind, attrs, body) =>
    add(kind.toLowerCase(), parseAttrs(attrs), body, false)
  );

  /* 2. Closed ``` diagram fences */
  CODE_FENCE_RE.lastIndex = 0;
  src = src.replace(CODE_FENCE_RE, (_full, kind, body) =>
    add(kind.toLowerCase(), {}, body, false)
  );

  /* 3. Still-streaming ::: block (always the tail of the message) */
  const open = src.match(OPEN_BLOCK_RE);
  if (open) {
    const marker = add(open[1].toLowerCase(), parseAttrs(open[2]), open[3], true);
    src = src.slice(0, open.index) + marker;
  } else {
    /* 4. Still-streaming ``` diagram fence */
    const openFence = src.match(OPEN_CODE_FENCE_RE);
    if (openFence) {
      const marker = add(openFence[1].toLowerCase(), {}, openFence[2], true);
      src = src.slice(0, openFence.index) + marker;
    }
  }

  return { text: src, blocks };
};

export default extractRichBlocks;