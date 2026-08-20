// Error-state vignettes. Three cases the PRD calls out:
//   1. Ollama unreachable (connection refused on localhost:11434)
//   2. Request timed out
//   3. Generated file exceeds the 10 MB download limit
// Rendered in the Clean aesthetic so they read as the canonical error treatment;
// the same patterns translate trivially to Terminal/Editorial.

const errStyles = {
  root: {
    width: "100%",
    minHeight: "100%",
    background: "#161719",
    color: "#ebecee",
    fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    padding: "28px 28px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  header: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: { fontSize: 14, fontWeight: 600, letterSpacing: 0.2, color: "#ebecee" },
  sub: {
    fontSize: 11.5,
    color: "#5b6066",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  card: {
    background: "#1c1e22",
    border: "1px solid #2a2d33",
    borderRadius: 12,
    padding: "18px 20px",
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
  },
  iconWrap: (bg, fg) => ({
    width: 40,
    height: 40,
    borderRadius: 10,
    background: bg,
    color: fg,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  body: { flex: 1, display: "flex", flexDirection: "column", gap: 6 },
  rowTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  errTitle: { fontSize: 15, fontWeight: 600, color: "#ebecee" },
  errCode: {
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: 11.5,
    color: "#9aa0a6",
    background: "#0f1114",
    border: "1px solid #2a2d33",
    padding: "2px 8px",
    borderRadius: 5,
  },
  errMsg: { fontSize: 13.5, color: "#c8cacd", lineHeight: 1.55 },
  hint: {
    fontSize: 12.5,
    color: "#7d8590",
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    background: "#0f1114",
    border: "1px solid #222428",
    padding: "8px 10px",
    borderRadius: 6,
    marginTop: 4,
    overflowX: "auto",
    whiteSpace: "pre",
  },
  actions: { display: "flex", gap: 8, marginTop: 6 },
  btn: {
    background: "transparent",
    border: "1px solid #2a2d33",
    color: "#ebecee",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12.5,
    fontFamily: "inherit",
    cursor: "pointer",
  },
  btnPrimary: {
    background: "oklch(0.78 0.12 252)",
    color: "#0e1116",
    border: "none",
    fontWeight: 600,
  },
};

function ErrorIcon({ kind }) {
  if (kind === "offline") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 8.8a16 16 0 0 1 20 0M5 12.5a11 11 0 0 1 14 0M8.5 16a6 6 0 0 1 7 0" />
        <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" />
        <circle cx="12" cy="20" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "timeout") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l3 2M9 2h6" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="13" x2="12" y2="17" /><circle cx="12" cy="19.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function ErrorStates() {
  return (
    <div style={errStyles.root}>
      <div style={errStyles.header}>
        <span style={errStyles.title}>Error states</span>
        <span style={errStyles.sub}>03 patterns</span>
      </div>

      {/* 1. Ollama offline */}
      <div style={errStyles.card}>
        <div style={errStyles.iconWrap("oklch(0.28 0.08 25)", "oklch(0.78 0.16 25)")}>
          <ErrorIcon kind="offline" />
        </div>
        <div style={errStyles.body}>
          <div style={errStyles.rowTop}>
            <span style={errStyles.errTitle}>Can’t reach Ollama</span>
            <span style={errStyles.errCode}>ECONNREFUSED · localhost:11434</span>
          </div>
          <div style={errStyles.errMsg}>
            Ollama isn’t responding on the default port. Start it from the terminal and try again — the page will pick up automatically.
          </div>
          <div style={errStyles.hint}>$ ollama serve</div>
          <div style={errStyles.actions}>
            <button style={{ ...errStyles.btn, ...errStyles.btnPrimary }}>Retry connection</button>
            <button style={errStyles.btn}>Open Ollama docs</button>
          </div>
        </div>
      </div>

      {/* 2. Timeout */}
      <div style={errStyles.card}>
        <div style={errStyles.iconWrap("oklch(0.30 0.08 80)", "oklch(0.82 0.14 80)")}>
          <ErrorIcon kind="timeout" />
        </div>
        <div style={errStyles.body}>
          <div style={errStyles.rowTop}>
            <span style={errStyles.errTitle}>Ollama took too long</span>
            <span style={errStyles.errCode}>TIMEOUT · 120s</span>
          </div>
          <div style={errStyles.errMsg}>
            <strong style={{ color: "#ebecee" }}>deepseek-r1:14b</strong> didn’t finish within the timeout window. The conversation is preserved — you can resend the last message or switch to a smaller model.
          </div>
          <div style={errStyles.actions}>
            <button style={{ ...errStyles.btn, ...errStyles.btnPrimary }}>Retry request</button>
            <button style={errStyles.btn}>Switch model</button>
            <button style={errStyles.btn}>Increase timeout</button>
          </div>
        </div>
      </div>

      {/* 3. File too large */}
      <div style={errStyles.card}>
        <div style={errStyles.iconWrap("oklch(0.28 0.06 280)", "oklch(0.80 0.12 280)")}>
          <ErrorIcon kind="filesize" />
        </div>
        <div style={errStyles.body}>
          <div style={errStyles.rowTop}>
            <span style={errStyles.errTitle}>File exceeds the 10 MB limit</span>
            <span style={errStyles.errCode}>413 · 12.4 MB</span>
          </div>
          <div style={errStyles.errMsg}>
            <code style={{ fontFamily: "'JetBrains Mono', monospace", background: "#0f1114", padding: "1px 6px", borderRadius: 4, border: "1px solid #2a2d33" }}>training-data.json</code> is too large to download in v1. Copy the contents to clipboard or split into smaller blocks.
          </div>
          <div style={errStyles.actions}>
            <button style={{ ...errStyles.btn, ...errStyles.btnPrimary }}>Copy to clipboard</button>
            <button style={errStyles.btn}>Split into parts</button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.ErrorStates = ErrorStates;
