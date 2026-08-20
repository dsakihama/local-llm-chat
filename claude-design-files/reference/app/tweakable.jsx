// Tweakable wrapper around CleanChat. Adds a floating Tweaks panel (theme,
// accent, font, density). Implemented as a scoped <style> block that
// overrides clean.jsx's inline styles via !important on data-attribute
// selectors — keeps clean.jsx untouched.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accent": "periwinkle",
  "font": "sans",
  "density": "regular"
}/*EDITMODE-END*/;

const ACCENT_PALETTES = {
  periwinkle: { accent: "oklch(0.78 0.12 252)", ink: "#0e1116", bubble: "oklch(0.36 0.07 252)", swatch: "#9aa6ff" },
  ochre:      { accent: "oklch(0.80 0.13 70)",  ink: "#1a1208", bubble: "oklch(0.40 0.09 70)",  swatch: "#e6b86c" },
  emerald:    { accent: "oklch(0.78 0.15 155)", ink: "#08130c", bubble: "oklch(0.36 0.09 155)", swatch: "#5ed3a4" },
  rose:       { accent: "oklch(0.78 0.14 12)",  ink: "#1a0a0d", bubble: "oklch(0.38 0.09 12)",  swatch: "#ec8aa0" },
};

const FONT_STACKS = {
  sans:  "'Helvetica Neue', Helvetica, 'Segoe UI', sans-serif",
  serif: "'Source Serif 4', 'Iowan Old Style', Georgia, serif",
  mono:  "'JetBrains Mono', ui-monospace, Menlo, monospace",
};

const DENSITY = {
  compact: { stream: "16px 24px 8px",  gap: 12, msgPad: "8px 12px",  composer: "8px 24px 12px", input: 13.5 },
  regular: { stream: "28px 24px 12px", gap: 18, msgPad: "10px 14px", composer: "12px 24px 18px", input: 14.5 },
  comfy:   { stream: "40px 32px 16px", gap: 26, msgPad: "12px 16px", composer: "16px 32px 24px", input: 15.5 },
};

const THEMES = {
  dark: {
    bg: "#161719", surface: "#1c1e22", inset: "#0f1114",
    border: "#2a2d33", borderSoft: "#222428",
    fg: "#ebecee", fgDim: "#9aa0a6", fgFaint: "#5b6066",
    bubbleFg: "#ecf0ff",
  },
  light: {
    bg: "#fafaf8", surface: "#ffffff", inset: "#f4f4f1",
    border: "#e2e1dc", borderSoft: "#ececea",
    fg: "#1a1916", fgDim: "#5b5a55", fgFaint: "#8a8984",
    bubbleFg: "#ffffff",
  },
};

function buildOverrideCSS(t) {
  const theme = THEMES[t.theme] || THEMES.dark;
  const accent = ACCENT_PALETTES[t.accent] || ACCENT_PALETTES.periwinkle;
  const font = FONT_STACKS[t.font] || FONT_STACKS.sans;
  const d = DENSITY[t.density] || DENSITY.regular;

  // All overrides are scoped under .tweakable-clean and use !important to
  // beat inline styles set by clean.jsx.
  return `
    .tweakable-clean { background: ${theme.bg} !important; color: ${theme.fg} !important; font-family: ${font} !important; }
    .tweakable-clean * { font-family: inherit !important; }
    .tweakable-clean pre, .tweakable-clean code, .tweakable-clean .tweak-code-name { font-family: ${FONT_STACKS.mono} !important; }
    .tweakable-clean header { background: ${theme.bg} !important; border-color: ${theme.borderSoft} !important; }
    .tweakable-clean header > div:first-child > div > div:first-child { color: ${theme.fg} !important; }
    .tweakable-clean header > div:first-child > div > div:last-child { color: ${theme.fgFaint} !important; }
    .tweakable-clean header button { background: ${theme.surface} !important; border-color: ${theme.border} !important; color: ${theme.fg} !important; }
    /* Brand mark uses accent */
    .tweakable-clean header > div:first-child > div:first-child {
      background: linear-gradient(135deg, ${accent.accent}, oklch(from ${accent.accent} 0.55 calc(c * 1.2) calc(h + 18))) !important;
      color: ${accent.ink} !important;
    }
    /* Stream + composer paddings */
    .tweakable-clean > div { padding: ${d.stream} !important; }
    .tweakable-clean > div > div { gap: ${d.gap}px !important; }
    .tweakable-clean footer { padding: ${d.composer} !important; background: ${theme.bg} !important; }
    .tweakable-clean footer > div > div:first-child {
      background: ${theme.surface} !important;
      border-color: ${theme.border} !important;
    }
    .tweakable-clean textarea { color: ${theme.fg} !important; font-size: ${d.input}px !important; }
    /* User bubble uses accent-tinted bg */
    .tweakable-clean [style*="border-radius: 14px 14px 4px 14px"] {
      background: ${accent.bubble} !important;
      color: ${theme.bubbleFg} !important;
      padding: ${d.msgPad} !important;
    }
    /* Send button uses accent */
    .tweakable-clean footer button[style*="border-radius: 999px"] {
      background: ${accent.accent} !important;
      color: ${accent.ink} !important;
    }
    /* Pill dot (connection) stays green; pill caret uses fgFaint */
    .tweakable-clean header > div:last-child > button:first-child {
      color: ${theme.fg} !important;
    }
    /* Code blocks */
    .tweakable-clean pre {
      background: ${theme.inset} !important;
      color: ${theme.fg} !important;
    }
    .tweakable-clean [style*="border-radius: 10px"][style*="overflow: hidden"] {
      background: ${theme.inset} !important;
      border-color: ${theme.border} !important;
    }
    /* Status pill */
    .tweakable-clean [style*="border-radius: 999px"][style*="padding: 8px 14px"] {
      background: ${theme.surface} !important;
      border-color: ${theme.border} !important;
      color: ${theme.fgDim} !important;
    }
    /* Inline status text color */
    .tweakable-clean p, .tweakable-clean li { color: ${theme.fg} !important; }
    /* Token colors stay the same in dark; soften in light */
    ${t.theme === 'light' ? `
      .tweakable-clean .tk-keyword { color: #cf222e !important; }
      .tweakable-clean .tk-string  { color: #0a3069 !important; }
      .tweakable-clean .tk-comment { color: #6e7781 !important; }
      .tweakable-clean .tk-number  { color: #953800 !important; }
      .tweakable-clean .tk-builtin, .tweakable-clean .tk-func { color: #6639ba !important; }
    ` : ''}
  `;
}

function TweakableCleanChat() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const css = buildOverrideCSS(t);
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <style>{css}</style>
      <div className="tweakable-clean" style={{ width: "100%", height: "100%" }}>
        <CleanChat />
      </div>
      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakRadio label="Mode" value={t.theme}
            options={["dark", "light"]}
            onChange={(v) => setTweak("theme", v)} />
          <TweakColor label="Accent" value={t.accent}
            options={["periwinkle", "ochre", "emerald", "rose"]}
            onChange={(v) => setTweak("accent", v)}
            swatches={{
              periwinkle: ACCENT_PALETTES.periwinkle.swatch,
              ochre: ACCENT_PALETTES.ochre.swatch,
              emerald: ACCENT_PALETTES.emerald.swatch,
              rose: ACCENT_PALETTES.rose.swatch,
            }} />
        </TweakSection>
        <TweakSection label="Type">
          <TweakRadio label="Font" value={t.font}
            options={["sans", "serif", "mono"]}
            onChange={(v) => setTweak("font", v)} />
        </TweakSection>
        <TweakSection label="Layout">
          <TweakRadio label="Density" value={t.density}
            options={["compact", "regular", "comfy"]}
            onChange={(v) => setTweak("density", v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

window.TweakableCleanChat = TweakableCleanChat;
