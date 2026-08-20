// Clean utility aesthetic. Modern dark with soft chrome, neutral palette, subtle
// rounded corners, sans for UI, mono only inside code. Like a Notes app for chat.

const cleanColors = {
  bg: "#161719",
  surface: "#1c1e22",
  surfaceHi: "#22252a",
  inset: "#0f1114",
  border: "#2a2d33",
  borderSoft: "#222428",
  fg: "#ebecee",
  fgDim: "#9aa0a6",
  fgFaint: "#5b6066",
  accent: "oklch(0.78 0.12 252)",       // soft periwinkle
  accentInk: "#0e1116",
  userBubble: "oklch(0.36 0.07 252)",
  userBubbleFg: "#ecf0ff",
  shadow: "0 1px 0 rgba(255,255,255,0.03), 0 8px 24px rgba(0,0,0,0.25)",
};

const cleanStyles = {
  root: {
    width: "100%",
    height: "100%",
    background: cleanColors.bg,
    color: cleanColors.fg,
    fontFamily: "'Helvetica Neue', Helvetica, 'Segoe UI', sans-serif",
    fontSize: 14.5,
    lineHeight: 1.55,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFeatureSettings: "'cv11', 'ss01'",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 24px",
    borderBottom: `1px solid ${cleanColors.borderSoft}`,
    background: cleanColors.bg,
    flexShrink: 0,
  },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  brandMark: {
    width: 26,
    height: 26,
    borderRadius: 7,
    background: `linear-gradient(135deg, ${cleanColors.accent}, oklch(0.62 0.16 270))`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#0b0c0f",
    fontSize: 13,
    fontWeight: 700,
  },
  brandTitle: { fontWeight: 600, fontSize: 15, letterSpacing: -0.1 },
  brandSub: { color: cleanColors.fgFaint, fontSize: 12.5, marginTop: 1 },
  headerRight: { display: "flex", alignItems: "center", gap: 10 },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "7px 12px 7px 10px",
    background: cleanColors.surface,
    border: `1px solid ${cleanColors.border}`,
    borderRadius: 999,
    color: cleanColors.fg,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  pillDot: { width: 7, height: 7, borderRadius: 999, background: "oklch(0.74 0.16 145)" },
  pillSize: { color: cleanColors.fgFaint, fontWeight: 400 },
  pillCaret: { color: cleanColors.fgFaint, fontSize: 11 },
  iconBtn: {
    width: 34,
    height: 34,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: cleanColors.surface,
    border: `1px solid ${cleanColors.border}`,
    borderRadius: 8,
    color: cleanColors.fgDim,
    cursor: "pointer",
  },
  stream: { flex: 1, overflowY: "auto", padding: "28px 24px 12px" },
  streamInner: {
    maxWidth: 760,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  msgUser: {
    display: "flex",
    justifyContent: "flex-end",
  },
  msgUserBubble: {
    maxWidth: "78%",
    background: cleanColors.userBubble,
    color: cleanColors.userBubbleFg,
    padding: "10px 14px",
    borderRadius: "14px 14px 4px 14px",
    fontSize: 14.5,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },
  msgAssistant: { display: "flex", flexDirection: "column", gap: 8 },
  assistantHead: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12.5,
    color: cleanColors.fgDim,
  },
  assistantAvatar: {
    width: 22,
    height: 22,
    borderRadius: 6,
    background: cleanColors.surface,
    border: `1px solid ${cleanColors.border}`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    color: cleanColors.fgDim,
  },
  assistantModel: { color: cleanColors.fg, fontWeight: 500 },
  assistantTime: { color: cleanColors.fgFaint },
  assistantBody: { color: cleanColors.fg },
  para: { margin: "0 0 12px 0" },
  ul: { margin: "0 0 12px 0", paddingLeft: 22 },
  li: { margin: "3px 0" },
  inlineCode: {
    fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
    background: cleanColors.surface,
    color: cleanColors.fg,
    padding: "1.5px 6px",
    borderRadius: 5,
    fontSize: "0.86em",
    border: `1px solid ${cleanColors.border}`,
  },
  codeWrap: {
    margin: "12px 0",
    background: cleanColors.inset,
    border: `1px solid ${cleanColors.border}`,
    borderRadius: 10,
    overflow: "hidden",
  },
  codeHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "9px 12px",
    background: cleanColors.surface,
    borderBottom: `1px solid ${cleanColors.border}`,
    fontSize: 12.5,
  },
  codeLang: { display: "flex", alignItems: "center", gap: 10 },
  codeLangTag: {
    color: cleanColors.fg,
    fontWeight: 500,
    background: cleanColors.surfaceHi,
    border: `1px solid ${cleanColors.border}`,
    padding: "2px 8px",
    borderRadius: 5,
    fontSize: 11.5,
  },
  codeFile: {
    fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
    color: cleanColors.fgFaint,
    fontSize: 11.5,
  },
  codeBtns: { display: "flex", gap: 4 },
  codeBtn: {
    background: "transparent",
    border: "none",
    color: cleanColors.fgDim,
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 6,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  },
  codeBtnPrimary: { color: cleanColors.accent, fontWeight: 500 },
  pre: {
    margin: 0,
    padding: "14px 16px",
    overflowX: "auto",
    fontFamily: "'JetBrains Mono', ui-monospace, Menlo, monospace",
    fontSize: 12.5,
    lineHeight: 1.6,
    color: cleanColors.fg,
  },
  status: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: cleanColors.fgDim,
    padding: "4px 0",
  },
  statusBox: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: cleanColors.surface,
    border: `1px solid ${cleanColors.border}`,
    padding: "8px 14px",
    borderRadius: 999,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    background: cleanColors.accent,
    animation: "clean-pulse 1.4s infinite",
  },
  composer: {
    flexShrink: 0,
    padding: "12px 24px 18px",
    background: cleanColors.bg,
  },
  composerInner: { maxWidth: 760, margin: "0 auto" },
  inputBox: {
    background: cleanColors.surface,
    border: `1px solid ${cleanColors.border}`,
    borderRadius: 14,
    padding: "12px 12px 8px 16px",
    boxShadow: cleanColors.shadow,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  input: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: cleanColors.fg,
    fontFamily: "inherit",
    fontSize: 14.5,
    width: "100%",
    resize: "none",
    minHeight: 24,
    lineHeight: 1.5,
  },
  composerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  composerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  toolBtn: {
    background: "transparent",
    border: "none",
    color: cleanColors.fgDim,
    width: 30,
    height: 30,
    borderRadius: 8,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtn: {
    background: cleanColors.accent,
    color: cleanColors.accentInk,
    border: "none",
    padding: "8px 14px",
    borderRadius: 999,
    fontFamily: "inherit",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  hintRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 8,
    fontSize: 11.5,
    color: cleanColors.fgFaint,
    padding: "0 4px",
  },
  flash: {
    position: "absolute",
    bottom: 80,
    left: "50%",
    transform: "translateX(-50%)",
    background: cleanColors.surface,
    color: cleanColors.fg,
    border: `1px solid ${cleanColors.border}`,
    fontSize: 12.5,
    padding: "8px 14px",
    borderRadius: 999,
    pointerEvents: "none",
    boxShadow: cleanColors.shadow,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
};

function CleanCodeBlock({ lang, code, idx, onFlash }) {
  const tokens = tokenize(code, lang);
  const filename = suggestedFilename(lang, idx);
  return (
    <div style={cleanStyles.codeWrap}>
      <div style={cleanStyles.codeHead}>
        <div style={cleanStyles.codeLang}>
          <span style={cleanStyles.codeLangTag}>{LANG_LABEL[lang?.toLowerCase()] || lang || "text"}</span>
          <span style={cleanStyles.codeFile}>{filename}</span>
        </div>
        <div style={cleanStyles.codeBtns}>
          <button
            style={cleanStyles.codeBtn}
            onClick={() => { navigator.clipboard?.writeText(code); onFlash("Copied to clipboard"); }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </svg>
            Copy
          </button>
          <button
            style={{ ...cleanStyles.codeBtn, ...cleanStyles.codeBtnPrimary }}
            onClick={() => onFlash(`Downloaded ${filename}`)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
            </svg>
            Download
          </button>
        </div>
      </div>
      <pre style={cleanStyles.pre}>
        <code>
          {tokens.map((t, i) => (
            <span key={i} className={`tk-${t.kind}`}>{t.token}</span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function CleanBlocks({ src, onFlash }) {
  const blocks = parseMarkdown(src);
  let codeIdx = 0;
  return (
    <>
      {blocks.map((b, i) => {
        if (b.kind === "code") {
          const idx = codeIdx++;
          return <CleanCodeBlock key={i} lang={b.lang} code={b.code} idx={idx} onFlash={onFlash} />;
        }
        if (b.kind === "ul") {
          return (
            <ul key={i} style={cleanStyles.ul}>
              {b.items.map((it, j) => (
                <li key={j} style={cleanStyles.li} dangerouslySetInnerHTML={{ __html: renderInline(it) }} />
              ))}
            </ul>
          );
        }
        return <p key={i} style={cleanStyles.para} dangerouslySetInnerHTML={{ __html: renderInline(b.text) }} />;
      })}
    </>
  );
}

function CleanChat() {
  const [input, setInput] = React.useState("");
  const [flash, triggerFlash] = useFlash();
  const [statusPhase, setStatusPhase] = React.useState(0);
  const phases = ["Thinking", "Reading sources", "Drafting reply", "Polishing"];
  React.useEffect(() => {
    const t = setInterval(() => setStatusPhase((p) => (p + 1) % phases.length), 1600);
    return () => clearInterval(t);
  }, []);
  const model = MOCK_MODELS[1];

  return (
    <div style={cleanStyles.root}>
      <header style={cleanStyles.header}>
        <div style={cleanStyles.brand}>
          <div style={cleanStyles.brandMark}>O</div>
          <div>
            <div style={cleanStyles.brandTitle}>Ollama Chat</div>
            <div style={cleanStyles.brandSub}>Local · localhost:11434 · connected</div>
          </div>
        </div>
        <div style={cleanStyles.headerRight}>
          <button style={cleanStyles.pill}>
            <span style={cleanStyles.pillDot} />
            <span>{model.name}</span>
            <span style={cleanStyles.pillSize}>{formatSize(model.size)}</span>
            <span style={cleanStyles.pillCaret}>▾</span>
          </button>
          <button style={cleanStyles.iconBtn} title="Copy last response">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </svg>
          </button>
          <button style={cleanStyles.iconBtn} title="Clear history">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
            </svg>
          </button>
        </div>
      </header>

      <div style={cleanStyles.stream}>
        <div style={cleanStyles.streamInner}>
          {MOCK_CONVERSATION.map((m, i) =>
            m.role === "user" ? (
              <div key={i} style={cleanStyles.msgUser}>
                <div style={cleanStyles.msgUserBubble}>{m.content}</div>
              </div>
            ) : (
              <div key={i} style={cleanStyles.msgAssistant}>
                <div style={cleanStyles.assistantHead}>
                  <span style={cleanStyles.assistantAvatar}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </span>
                  <span style={cleanStyles.assistantModel}>{m.model}</span>
                  <span style={cleanStyles.assistantTime}>· 14:21</span>
                </div>
                <div style={cleanStyles.assistantBody}>
                  <CleanBlocks src={m.content} onFlash={triggerFlash} />
                </div>
              </div>
            )
          )}
          <div style={cleanStyles.msgAssistant}>
            <div style={cleanStyles.statusBox}>
              <span style={cleanStyles.statusDot} />
              <span style={cleanStyles.status}>{phases[statusPhase]}…</span>
            </div>
          </div>
        </div>
      </div>

      <footer style={cleanStyles.composer}>
        <div style={cleanStyles.composerInner}>
          <div style={cleanStyles.inputBox}>
            <textarea
              style={cleanStyles.input}
              rows={1}
              placeholder="Message Ollama…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div style={cleanStyles.composerRow}>
              <div style={cleanStyles.composerLeft}>
                <button style={cleanStyles.toolBtn} title="Attach">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5l-9.2 9.2a5 5 0 1 1-7-7L13 5a3.5 3.5 0 1 1 5 5l-8.5 8.5a2 2 0 1 1-3-3L14 8" />
                  </svg>
                </button>
                <button style={cleanStyles.toolBtn} title="System prompt">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 12h16M4 18h10" />
                  </svg>
                </button>
              </div>
              <button style={cleanStyles.sendBtn} onClick={() => { setInput(""); triggerFlash("Sent"); }}>
                Send
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
          <div style={cleanStyles.hintRow}>
            <span>Press ⌘⏎ to send · ⇧⏎ for newline</span>
            <span>Switching models starts a new chat</span>
          </div>
        </div>
      </footer>
      {flash && (
        <div style={cleanStyles.flash}>
          <span style={cleanStyles.statusDot} />
          {flash}
        </div>
      )}
    </div>
  );
}

window.CleanChat = CleanChat;
