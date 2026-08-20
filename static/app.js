'use strict';

// ── Language maps (from shared.jsx) ───────────────────────────────────────
const LANG_TO_EXT = {
  python: 'py', py: 'py',
  javascript: 'js', js: 'js',
  typescript: 'ts', ts: 'ts',
  bash: 'sh', sh: 'sh', shell: 'sh',
  json: 'json',
  yaml: 'yaml', yml: 'yaml',
  html: 'html',
  css: 'css',
  go: 'go',
  rust: 'rs', rs: 'rs',
  sql: 'sql',
  md: 'md', markdown: 'md',
};

const LANG_LABEL = {
  python: 'Python', py: 'Python',
  javascript: 'JavaScript', js: 'JavaScript',
  typescript: 'TypeScript', ts: 'TypeScript',
  bash: 'Bash', sh: 'Shell', shell: 'Shell',
  json: 'JSON',
  yaml: 'YAML', yml: 'YAML',
  html: 'HTML',
  css: 'CSS',
  go: 'Go',
  rust: 'Rust', rs: 'Rust',
  sql: 'SQL',
  md: 'Markdown', markdown: 'Markdown',
};

const STATUS_PHASES = ['Thinking…', 'Reading sources…', 'Drafting reply…', 'Polishing…'];

// ── State ─────────────────────────────────────────────────────────────────
const appState = {
  messages: [],      // { role, content, model, timestamp }
  selectedModel: '',
  isLoading: false,
  models: [],        // { name, size }
};

// ── localStorage ──────────────────────────────────────────────────────────
function saveHistory() {
  try { localStorage.setItem('chatHistory', JSON.stringify(appState.messages)); } catch (_) {}
}

function loadHistory() {
  try {
    const raw = localStorage.getItem('chatHistory');
    appState.messages = raw ? JSON.parse(raw) : [];
  } catch (_) { appState.messages = []; }
}

function saveModel(name) {
  try { localStorage.setItem('selectedModel', name); } catch (_) {}
}

function loadModel() {
  try { return localStorage.getItem('selectedModel') || ''; } catch (_) { return ''; }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function formatSize(bytes) {
  const gb = bytes / 1e9;
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / 1e6).toFixed(0)} MB`;
}

function suggestedFilename(lang, idx) {
  const l = (lang || '').toLowerCase();
  const ext = LANG_TO_EXT[l] || 'txt';
  const base = (l === 'bash' || l === 'sh') ? 'script'
    : (l === 'python' || l === 'py') ? 'main'
    : 'snippet';
  return `${base}${idx > 0 ? `-${idx + 1}` : ''}.${ext}`;
}

function fmtTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (_) { return ''; }
}

// ── Flash toast ───────────────────────────────────────────────────────────
let flashTimer = null;
function showFlash(msg) {
  const el = document.getElementById('flash');
  document.getElementById('flash-text').textContent = msg;
  el.hidden = false;
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => { el.hidden = true; }, 1200);
}

// ── Status indicator ──────────────────────────────────────────────────────
let statusInterval = null;
let statusPhase = 0;

function showStatus() {
  const wrap = document.getElementById('status-wrap');
  const txt = document.getElementById('status-text');
  statusPhase = 0;
  txt.textContent = STATUS_PHASES[0];
  wrap.hidden = false;
  statusInterval = setInterval(() => {
    statusPhase = (statusPhase + 1) % STATUS_PHASES.length;
    txt.textContent = STATUS_PHASES[statusPhase];
  }, 1600);
  scrollToBottom();
}

function hideStatus() {
  clearInterval(statusInterval);
  document.getElementById('status-wrap').hidden = true;
}

function scrollToBottom() {
  const stream = document.getElementById('stream');
  stream.scrollTop = stream.scrollHeight;
}

// ── Code block injection ──────────────────────────────────────────────────
function injectCodeHeaders(container) {
  let codeIdx = 0;
  container.querySelectorAll('pre > code').forEach(codeEl => {
    const pre = codeEl.parentElement;
    if (pre.closest('.code-wrap')) return; // already wrapped

    // Extract language from highlight.js class (language-* or hljs-*)
    let lang = '';
    codeEl.classList.forEach(cls => {
      if (cls.startsWith('language-')) lang = cls.replace('language-', '');
    });

    const label = LANG_LABEL[lang.toLowerCase()] || lang || 'Text';
    const filename = suggestedFilename(lang, codeIdx);
    const codeText = codeEl.textContent;
    const idx = codeIdx;
    codeIdx++;

    // Build wrapper
    const wrap = document.createElement('div');
    wrap.className = 'code-wrap';

    const head = document.createElement('div');
    head.className = 'code-head';

    const langGroup = document.createElement('div');
    langGroup.className = 'code-lang';
    langGroup.innerHTML = `<span class="code-lang-tag">${escHtml(label)}</span><span class="code-file">${escHtml(filename)}</span>`;

    const btns = document.createElement('div');
    btns.className = 'code-btns';

    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'code-btn';
    copyBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg> Copy`;
    copyBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(codeText).then(() => showFlash('Copied to clipboard'));
    });

    // Download button
    const dlBtn = document.createElement('button');
    dlBtn.className = 'code-btn code-btn-primary';
    dlBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"/></svg> Download`;
    dlBtn.addEventListener('click', () => downloadCode(codeText, filename));

    btns.append(copyBtn, dlBtn);
    head.append(langGroup, btns);
    wrap.append(head);

    // Move pre into wrap
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
  });
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Download ──────────────────────────────────────────────────────────────
async function downloadCode(content, filename) {
  try {
    const resp = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, filename }),
    });

    if (resp.status === 413) {
      const data = await resp.json().catch(() => ({}));
      appendErrorCard('filesize', data.error || 'File too large (> 10 MB)');
      return;
    }

    if (!resp.ok) throw new Error(`Download failed (${resp.status})`);

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showFlash(`Downloaded ${filename}`);
  } catch (err) {
    console.error('[download]', err);
    showFlash('Download failed');
  }
}

// ── Inline error cards ────────────────────────────────────────────────────
const ERROR_ICONS = {
  offline: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 8.8a16 16 0 0 1 20 0M5 12.5a11 11 0 0 1 14 0M8.5 16a6 6 0 0 1 7 0"/><line x1="3" y1="3" x2="21" y2="21" stroke="currentColor"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>`,
  timeout: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></svg>`,
  filesize: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="13" x2="12" y2="17"/><circle cx="12" cy="19.5" r="0.5" fill="currentColor"/></svg>`,
};

const ERROR_DEFS = {
  offline: {
    title: "Can't reach Ollama",
    code: 'ECONNREFUSED · localhost:11434',
    msg: "Ollama isn't responding on the default port. Start it from the terminal and try again.",
    hint: '$ ollama serve',
    actions: [
      { label: 'Retry connection', primary: true, action: () => retryModels() },
      { label: 'Ollama docs', primary: false, action: () => window.open('https://ollama.com') },
    ],
  },
  timeout: {
    title: 'Ollama took too long',
    code: 'TIMEOUT · 120s',
    msg: "The model didn't finish within the timeout window. The conversation is preserved — you can resend the last message or switch to a smaller model.",
    hint: null,
    actions: [
      { label: 'Retry', primary: true, action: () => retrySend() },
      { label: 'Switch model', primary: false, action: () => document.getElementById('model-select').focus() },
    ],
  },
  filesize: {
    title: 'File exceeds the 10 MB limit',
    code: '413 · Too Large',
    msg: 'The generated file is too large to download in v1. Copy the contents to clipboard instead.',
    hint: null,
    actions: [
      { label: 'Copy to clipboard', primary: true, action: () => copyLastCode() },
    ],
  },
};

function appendErrorCard(type, detail) {
  const def = ERROR_DEFS[type] || { title: 'Error', code: '', msg: detail, hint: null, actions: [] };
  const inner = document.getElementById('stream-inner');

  const card = document.createElement('div');
  card.className = 'error-card';

  const iconWrap = document.createElement('div');
  iconWrap.className = `error-icon-wrap ${type}`;
  iconWrap.innerHTML = ERROR_ICONS[type] || '';

  const body = document.createElement('div');
  body.className = 'error-body';

  const top = document.createElement('div');
  top.className = 'error-top';
  top.innerHTML = `<span class="error-title">${escHtml(def.title)}</span><span class="error-code">${escHtml(def.code)}</span>`;

  const msg = document.createElement('div');
  msg.className = 'error-msg';
  msg.textContent = def.msg;

  body.append(top, msg);

  if (def.hint) {
    const hint = document.createElement('div');
    hint.className = 'error-hint';
    hint.textContent = def.hint;
    body.appendChild(hint);
  }

  const actions = document.createElement('div');
  actions.className = 'error-actions';
  def.actions.forEach(a => {
    const btn = document.createElement('button');
    btn.className = `error-btn${a.primary ? ' error-btn-primary' : ''}`;
    btn.textContent = a.label;
    btn.addEventListener('click', a.action);
    actions.appendChild(btn);
  });
  body.appendChild(actions);

  card.append(iconWrap, body);
  inner.appendChild(card);
  scrollToBottom();
}

// ── Message rendering ─────────────────────────────────────────────────────
function renderMessage({ role, content, model, timestamp }) {
  const inner = document.getElementById('stream-inner');
  const ts = timestamp ? fmtTime(timestamp) : '';

  if (role === 'user') {
    const wrap = document.createElement('div');
    wrap.className = 'msg-user';
    const bubble = document.createElement('div');
    bubble.className = 'msg-user-bubble';
    bubble.textContent = content;
    wrap.appendChild(bubble);
    inner.appendChild(wrap);
  } else {
    const wrap = document.createElement('div');
    wrap.className = 'msg-assistant';

    const head = document.createElement('div');
    head.className = 'assistant-head';
    head.innerHTML = `
      <span class="assistant-avatar">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
      </span>
      <span class="assistant-model">${escHtml(model || 'assistant')}</span>
      ${ts ? `<span class="assistant-time">· ${ts}</span>` : ''}
    `;

    const body = document.createElement('div');
    body.className = 'assistant-body';

    // Parse markdown
    body.innerHTML = marked.parse(content, { breaks: true, gfm: true });

    // Syntax highlight all code blocks in this message
    body.querySelectorAll('pre > code').forEach(el => hljs.highlightElement(el));

    // Inject code block headers
    injectCodeHeaders(body);

    wrap.append(head, body);
    inner.appendChild(wrap);
  }

  scrollToBottom();
}

function renderAllMessages() {
  document.getElementById('stream-inner').innerHTML = '';
  appState.messages.forEach(m => renderMessage(m));
}

// ── Model dropdown ────────────────────────────────────────────────────────
function updatePill(model) {
  const m = appState.models.find(x => x.name === model);
  document.getElementById('pill-name').textContent = model || 'No models';
  document.getElementById('pill-size').textContent = m ? formatSize(m.size) : '';
}

function populateModels(models) {
  appState.models = models;
  const select = document.getElementById('model-select');
  select.innerHTML = '';
  if (!models.length) {
    const opt = document.createElement('option');
    opt.textContent = 'No models found';
    select.appendChild(opt);
    return;
  }
  models.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.name;
    opt.textContent = `${m.name} (${formatSize(m.size)})`;
    select.appendChild(opt);
  });

  // Restore saved model or default to first
  const saved = loadModel();
  const match = models.find(m => m.name === saved);
  const chosen = match ? saved : models[0].name;
  select.value = chosen;
  appState.selectedModel = chosen;
  updatePill(chosen);
}

// ── API ───────────────────────────────────────────────────────────────────
async function retryModels() {
  try {
    const resp = await fetch('/api/models');
    const data = await resp.json();
    if (resp.ok && data.models) {
      populateModels(data.models);
    }
  } catch (_) {}
}

async function fetchModels() {
  try {
    const resp = await fetch('/api/models');
    const data = await resp.json();
    if (!resp.ok) {
      appendErrorCard('offline', data.error);
      return;
    }
    populateModels(data.models || []);
  } catch (_) {
    appendErrorCard('offline', 'Could not reach backend');
  }
}

let lastUserContent = '';

async function sendMessage() {
  const input = document.getElementById('user-input');
  const content = input.value.trim();
  if (!content || appState.isLoading) return;

  lastUserContent = content;
  input.value = '';
  input.style.height = 'auto';

  const ts = new Date().toISOString();
  const userMsg = { role: 'user', content, timestamp: ts };
  appState.messages.push(userMsg);
  saveHistory();
  renderMessage(userMsg);

  setLoading(true);

  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: appState.selectedModel,
        messages: appState.messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });

    const data = await resp.json();

    if (resp.status === 502 || (data.code === 'ECONNREFUSED')) {
      appendErrorCard('offline', data.error);
      return;
    }
    if (resp.status === 504 || (data.code === 'TIMEOUT')) {
      appendErrorCard('timeout', data.error);
      return;
    }
    if (!resp.ok) {
      appendErrorCard('offline', data.error || 'Unknown error');
      return;
    }

    const assistantContent = data.message?.content || '';
    const assistantMsg = {
      role: 'assistant',
      content: assistantContent,
      model: data.model || appState.selectedModel,
      timestamp: data.created_at || new Date().toISOString(),
    };
    appState.messages.push(assistantMsg);
    saveHistory();
    renderMessage(assistantMsg);

  } catch (_) {
    appendErrorCard('offline', 'Network error — check your connection');
  } finally {
    setLoading(false);
  }
}

function retrySend() {
  document.getElementById('user-input').value = lastUserContent;
  // remove the last user message from state so it isn't duplicated
  if (appState.messages.length && appState.messages[appState.messages.length - 1].role === 'user') {
    appState.messages.pop();
    saveHistory();
  }
}

function copyLastCode() {
  const blocks = document.querySelectorAll('#stream-inner .code-wrap pre code');
  if (blocks.length) {
    navigator.clipboard?.writeText(blocks[blocks.length - 1].textContent)
      .then(() => showFlash('Copied to clipboard'));
  }
}

// ── Loading state ─────────────────────────────────────────────────────────
function setLoading(on) {
  appState.isLoading = on;
  document.getElementById('send-btn').disabled = on;
  if (on) showStatus(); else hideStatus();
}

// ── Clear history ─────────────────────────────────────────────────────────
function clearHistory() {
  if (!confirm('Clear all chat history?')) return;
  appState.messages = [];
  saveHistory();
  document.getElementById('stream-inner').innerHTML = '';
}

// ── Copy last response ────────────────────────────────────────────────────
function copyLastResponse() {
  const last = [...appState.messages].reverse().find(m => m.role === 'assistant');
  if (!last) return;
  navigator.clipboard?.writeText(last.content).then(() => showFlash('Copied to clipboard'));
}

// ── Event listeners ───────────────────────────────────────────────────────
function setupListeners() {
  document.getElementById('send-btn').addEventListener('click', sendMessage);

  document.getElementById('user-input').addEventListener('keydown', e => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const modifier = isMac ? e.metaKey : e.ctrlKey;
    if (modifier && e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-grow textarea
  document.getElementById('user-input').addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 240) + 'px';
  });

  document.getElementById('model-select').addEventListener('change', function () {
    const chosen = this.value;
    appState.selectedModel = chosen;
    saveModel(chosen);
    updatePill(chosen);
    // Clear chat when model changes
    appState.messages = [];
    saveHistory();
    document.getElementById('stream-inner').innerHTML = '';
  });

  document.getElementById('clear-btn').addEventListener('click', clearHistory);
  document.getElementById('copy-btn').addEventListener('click', copyLastResponse);
}

// ── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Configure marked
  marked.setOptions({ breaks: true, gfm: true });

  loadHistory();
  renderAllMessages();
  fetchModels();
  setupListeners();
});
