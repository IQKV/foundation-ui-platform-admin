// ── Slate gray ramp (HSL 215°, low saturation) ───────────────────────────────
// Replaces Mantine's warm gray. Each step is hand-tuned to keep adequate
// contrast in both light and dark contexts.
export const slateGray = {
  gray: [
    "#f8f9fb", // 0 — page background
    "#f1f3f6", // 1 — subtle fills
    "#e4e8ef", // 2 — borders (light)
    "#d0d6e2", // 3 — disabled borders
    "#b0bac9", // 4 — placeholder / separator
    "#8896aa", // 5 — muted text
    "#5e6e84", // 6 — secondary text
    "#3d4f63", // 7 — body text
    "#243345", // 8 — dark fills
    "#111c2b", // 9 — darkest (dark mode bg)
  ] as const,
};

// ── Mantine dark color ramp for dark theme components ─────────────────────────
export const darkColors = {
  dark: [
    "#C1C2C5", // 0
    "#A6A7AB", // 1
    "#909296", // 2
    "#5c5f66", // 3
    "#373A40", // 4
    "#2C2E33", // 5
    "#25262b", // 6
    "#1A1B1E", // 7
    "#141517", // 8
    "#101113", // 9
  ] as const,
};

// ── Deep indigo accent ────────────────────────────────────────────────────────
// Replaces Mantine's default blue.6 (#228be6) with a saturated indigo that
// signals deliberate brand identity rather than "I left the default".
export const indigoAccent = {
  blue: [
    "#eef0ff", // 0
    "#dce0ff", // 1
    "#bac1fd", // 2
    "#95a0fb", // 3
    "#7280f8", // 4
    "#5465f5", // 5 — hover state
    "#3b4ef0", // 6 — primary ← main action color (light)
    "#2c3dd4", // 7 — pressed / focus ring (dark)
    "#1e2ea8", // 8 — deep accent
    "#111b7a", // 9 — darkest
  ] as const,
};
