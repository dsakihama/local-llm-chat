// Shared mock data, markdown rendering, and small utilities for all chat variants.

const MOCK_MODELS = [
  { name: "llama3.1:8b", size: 4_661_211_424, modified_at: "2026-04-22T09:14:01Z" },
  { name: "qwen2.5-coder:7b", size: 4_701_122_113, modified_at: "2026-04-30T18:02:43Z" },
  { name: "mistral:7b", size: 4_109_865_159, modified_at: "2026-03-18T11:55:09Z" },
  { name: "gemma2:2b", size: 1_629_518_336, modified_at: "2026-02-09T15:21:00Z" },
  { name: "deepseek-r1:14b", size: 8_949_223_001, modified_at: "2026-05-02T22:11:55Z" },
];

const formatSize = (bytes) => {
  const gb = bytes / 1e9;
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / 1e6).toFixed(0)} MB`;
};

// Realistic, useful conversation that exercises all the rendering surfaces:
// inline code, bold, lists, multiple code blocks (different languages), prose.
const MOCK_CONVERSATION = [
  {
    role: "user",
    content:
      "Write a Python function to download a list of URLs concurrently with asyncio. It should retry on failure with exponential backoff and return per-URL results.",
    timestamp: "2026-05-09T14:21:08Z",
  },
  {
    role: "assistant",
    model: "qwen2.5-coder:7b",
    timestamp: "2026-05-09T14:21:14Z",
    content: `Here's a concurrent fetcher with retry using \`asyncio\` and \`aiohttp\`. It returns a list of dicts so failed URLs surface in the result rather than raising.

\`\`\`python
import asyncio
import aiohttp
from typing import List, Dict

async def fetch_with_retry(
    session: aiohttp.ClientSession,
    url: str,
    retries: int = 3,
    backoff: float = 0.5,
) -> Dict:
    for attempt in range(retries):
        try:
            async with session.get(url, timeout=10) as resp:
                resp.raise_for_status()
                return {
                    "url": url,
                    "status": resp.status,
                    "body": await resp.text(),
                }
        except Exception as e:
            if attempt == retries - 1:
                return {"url": url, "error": str(e)}
            await asyncio.sleep(backoff * (2 ** attempt))

async def download_all(urls: List[str]) -> List[Dict]:
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_with_retry(session, u) for u in urls]
        return await asyncio.gather(*tasks)
\`\`\`

A few notes on the design:

- **Exponential backoff** between retries (0.5s, 1s, 2s by default).
- Each request has a 10-second timeout via \`aiohttp\`'s built-in option.
- Failures are returned as \`{"url", "error"}\` dicts instead of raised \u2014 easier to fan out and inspect.

Quick way to try it:

\`\`\`bash
pip install aiohttp
python -c "import asyncio, json; from main import download_all; print(json.dumps(asyncio.run(download_all(['https://example.com', 'https://httpbin.org/status/500'])), indent=2))"
\`\`\`
`,
  },
];

// Tiny markdown renderer \u2014 just enough for chat: paragraphs, bold/italic, inline
// code, unordered lists, fenced code blocks. Keeps the prototype self-contained
// (no CDN markdown lib) and gives me precise control over the code-block DOM so
// each variant can style it differently.
function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderInline(text) {
  let t = escapeHtml(text);
  t = t.replace(/`([^`]+)`/g, '<code class="md-inline">$1</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  return t;
}

// Returns an array of blocks: { kind: 'p' | 'ul' | 'code', ... }
function parseMarkdown(src) {
  const lines = src.split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ kind: "code", lang, code: code.join("\n") });
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }
    // paragraph: gather until blank line / fence / list
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("```") &&
      !/^[-*]\s+/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ kind: "p", text: para.join(" ") });
  }
  return blocks;
}

// Map common languages to filenames (per PRD: smart detection from fence hint).
const LANG_TO_EXT = {
  python: "py",
  py: "py",
  javascript: "js",
  js: "js",
  typescript: "ts",
  ts: "ts",
  bash: "sh",
  sh: "sh",
  shell: "sh",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  html: "html",
  css: "css",
  go: "go",
  rust: "rs",
  rs: "rs",
  sql: "sql",
  md: "md",
  markdown: "md",
};

const LANG_LABEL = {
  python: "Python",
  py: "Python",
  javascript: "JavaScript",
  js: "JavaScript",
  typescript: "TypeScript",
  ts: "TypeScript",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  html: "HTML",
  css: "CSS",
  go: "Go",
  rust: "Rust",
  rs: "Rust",
  sql: "SQL",
  md: "Markdown",
  markdown: "Markdown",
};

function suggestedFilename(lang, idx) {
  const ext = LANG_TO_EXT[lang?.toLowerCase()] || "txt";
  const base = lang?.toLowerCase() === "bash" || lang?.toLowerCase() === "sh"
    ? "script"
    : lang?.toLowerCase() === "python" || lang?.toLowerCase() === "py"
    ? "main"
    : "snippet";
  return `${base}${idx > 0 ? `-${idx + 1}` : ""}.${ext}`;
}

// Very lightweight token highlighter \u2014 not as rich as highlight.js but keeps the
// page self-contained and lets each variant style its own token classes. Returns
// an array of { token, kind } chunks.
function tokenize(code, lang) {
  const l = (lang || "").toLowerCase();
  const rules = {
    python: [
      { kind: "comment", re: /(#[^\n]*)/g },
      { kind: "string", re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g },
      { kind: "keyword", re: /\b(import|from|def|async|await|return|for|in|if|else|elif|try|except|raise|with|as|class|while|pass|continue|break|lambda|None|True|False|not|and|or|is)\b/g },
      { kind: "builtin", re: /\b(print|range|len|list|dict|str|int|float|bool|tuple|set|isinstance|enumerate|zip|map|filter|open)\b/g },
      { kind: "number", re: /\b(\d+\.?\d*)\b/g },
      { kind: "func", re: /\b([a-zA-Z_][\w]*)(?=\()/g },
    ],
    bash: [
      { kind: "comment", re: /(#[^\n]*)/g },
      { kind: "string", re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g },
      { kind: "keyword", re: /\b(if|then|else|fi|for|do|done|while|case|esac|function|return|export|local)\b/g },
      { kind: "builtin", re: /\b(pip|python|npm|node|cd|ls|echo|cat|curl|wget|git|sudo|apt|brew|rm|mkdir|grep|sed|awk|chmod|export)\b/g },
    ],
    javascript: [
      { kind: "comment", re: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g },
      { kind: "string", re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g },
      { kind: "keyword", re: /\b(const|let|var|function|return|if|else|for|while|async|await|class|new|import|export|from|default|try|catch|throw|extends|null|undefined|true|false)\b/g },
      { kind: "number", re: /\b(\d+\.?\d*)\b/g },
      { kind: "func", re: /\b([a-zA-Z_$][\w$]*)(?=\()/g },
    ],
  };
  const langRules = rules[l] || rules[{ py: "python", sh: "bash", shell: "bash", ts: "javascript", js: "javascript" }[l]] || [];
  if (!langRules.length) return [{ token: code, kind: "text" }];

  // Mark spans, prefer earliest match wins
  const marks = [];
  for (const { kind, re } of langRules) {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(code))) {
      marks.push({ start: m.index, end: m.index + m[0].length, kind, text: m[0] });
    }
  }
  marks.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const final = [];
  let cursor = 0;
  for (const mk of marks) {
    if (mk.start < cursor) continue; // overlap; skip
    if (mk.start > cursor) final.push({ token: code.slice(cursor, mk.start), kind: "text" });
    final.push({ token: mk.text, kind: mk.kind });
    cursor = mk.end;
  }
  if (cursor < code.length) final.push({ token: code.slice(cursor), kind: "text" });
  return final;
}

// Tiny copy helper that flashes a "Copied" state for ~1.2s.
function useFlash() {
  const [flash, setFlash] = React.useState(null);
  const trigger = React.useCallback((label) => {
    setFlash(label);
    setTimeout(() => setFlash(null), 1200);
  }, []);
  return [flash, trigger];
}

Object.assign(window, {
  MOCK_MODELS,
  MOCK_CONVERSATION,
  formatSize,
  parseMarkdown,
  renderInline,
  tokenize,
  suggestedFilename,
  LANG_LABEL,
  useFlash,
});
